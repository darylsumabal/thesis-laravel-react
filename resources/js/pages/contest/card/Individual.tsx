import { Contests } from '@/api/contest';
import { Participant } from '@/api/result';
import ActionForm from '@/components/ActionForm';
import CardContent from '@/components/card/CardContent';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    COMBOBOX_INPUT_GENDER,
    FIELD_NAME_PARTICIPANT,
    FIELD_PARTICIPANT_CONTEST,
    PARTICIPANT_FIELDS,
    UPLOAD_FIELD_PARTICIPANT,
    UPLOAD_FIELD_PARTICIPANT_CONTEST,
} from '@/lib/constant/contest';
import { imageSrc } from '@/lib/src';
import { addImportParticipantSchema, addParticipantSchema, defaultValuesImportParticipant, defaultValuesParticipants } from '@/schema/contest';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from '@inertiajs/react';
import { ImagePlus, Loader2, Plus, UserPlus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import CreateJudge from '../CreateJudge';
import { posterSchema } from './Team';

type PROPS = { contest: Contests[]; participant: Participant[]; poster: string };

export default function Individual({ contest, participant, poster }: PROPS) {
    const contestId = contest[0]?.id;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const scoringType = contest[0].contest_scoring_type;
    const base = scoringType.toLowerCase().includes('rank') ? 'rank' : 'point';
    // Detect single or multiple
    const round = scoringType.toLowerCase().includes('single') ? 'sr' : 'mr';
    const roundType = `${base}-${round}`;
    const contestType = contest[0].contest_type.toLowerCase();
    const [loading, setLoading] = useState<boolean>(false);
    const formParticipant = useForm({
        resolver: zodResolver(addParticipantSchema),
        defaultValues: defaultValuesParticipants,
    });
    const fileRef = useRef<HTMLInputElement | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const formParticipantImport = useForm({
        resolver: zodResolver(addImportParticipantSchema),
        defaultValues: defaultValuesImportParticipant,
    });

    const handleOnSubmitParticipant = async (data: z.infer<typeof addParticipantSchema>) => {
        setLoading(true);
        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value instanceof FileList) {
                // Append the first file from FileList if it exists
                if (value.length > 0) {
                    formData.append(key, value[0]);
                }
            } else if (value instanceof File) {
                formData.append(key, value);
            } else if (value !== undefined && value !== null) {
                formData.append(key, value.toString());
            }
        });

        router.post(`/event/${contestId}/participant`, formData, {
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
                toast.success('Team Participant added successfully.');
                formParticipant.reset();
                setIsOpen(false);
                router.reload({ only: ['participants'] });
            },
            onError: (error) => {
                toast.error(error[0]);
                setLoading(false);
                console.log(error);
            },
        });
    };

    const handleOnSubmitImportParticipant = async (data: z.infer<typeof addImportParticipantSchema>) => {
        setLoading(true);
        router.post(`/contest/${contestId}/participant/upload`, data, {
            preserveScroll: true,
            onSuccess: () => {
                setLoading(false);
                setIsOpen(!open);
                toast.success('Participant imported');
            },
            onError: (error) => {
                toast.error(error[0]);
                setLoading(false);
                console.log(error);
            },
        });
    };

    const handleResetCloseDialog = (open: boolean) => {
        setIsOpen(open);
        formParticipant.reset();
        formParticipantImport.reset();
    };

    const form = useForm<z.infer<typeof posterSchema>>({
        resolver: zodResolver(posterSchema),
        defaultValues: {
            poster: '',
        },
    });
    const [openPoster, setOpenPoser] = useState<boolean>(false);
    async function onSubmit(values: z.infer<typeof posterSchema>) {
        setLoading(true);
        router.post(`/event/poster/${contestId}`, values, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Poster updated successfully!');
                setLoading(false);
                setOpenPoser(false);
            },
            onError: (error) => {
                console.log(error);
                setLoading(false);
                setOpenPoser(false);
            },
        });
    }

    const contestGenderCategory = contest[0]?.contest_gender_category;

    // Filter options based on the contest
    const filteredGenderOptions = COMBOBOX_INPUT_GENDER[0].data.filter((option) => {
        if (!contestGenderCategory || option.value === '') return true; // always include SELECT
        if (contestGenderCategory === 'male') return option.value === 'Male';
        if (contestGenderCategory === 'female') return option.value === 'Female';
        if (contestGenderCategory === 'maleFemale' || contestGenderCategory === 'mixed') return option.value === 'Male' || option.value === 'Female';
        return true;
    });

    return (
        <div className="h-full space-y-7">
            <div>
                <div className="mb-8 space-y-2">
                    {poster ? (
                        <img src={`${imageSrc}/${poster}`} className="h-96 w-full rounded-md" alt="poster" style={{ imageRendering: 'auto' }} />
                    ) : (
                        <div className="flex h-96 w-full items-center justify-center rounded-md bg-gray-200 text-black">No Poster Available</div>
                    )}
                </div>
                <div className="flex w-full max-w-sm items-center gap-3">
                    <Dialog open={openPoster} onOpenChange={(open) => setOpenPoser(open)}>
                        <DialogTrigger asChild>
                            <Button variant="default" className="hover:cursor-pointer">
                                <ImagePlus /> {poster ? 'Edit' : 'Add'} Poster
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{poster ? 'Edit' : 'Add'} Poster</DialogTitle>
                                <DialogDescription>Choose a poster.</DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                    <FormField
                                        control={form.control}
                                        name="poster"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Poster</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        id="picture"
                                                        type="file"
                                                        ref={fileRef}
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] ?? null;
                                                            field.onChange(file);
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={loading}>
                                        {loading && <Loader2 className="animate-spin" />}
                                        Save
                                    </Button>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>

                    <div className="flex justify-between gap-2">
                        <Dialog onOpenChange={handleResetCloseDialog} open={isOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="default"
                                    className="w-fit cursor-pointer"
                                    onClick={() => {
                                        // setId(item.id);
                                        setIsOpen(!open);
                                    }}
                                >
                                    <UserPlus /> Create Participant
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Participant</DialogTitle>
                                    <DialogDescription>Participant Contest Info</DialogDescription>
                                </DialogHeader>
                                <Tabs defaultValue="individual">
                                    <TabsList>
                                        <TabsTrigger value="individual">Individual Participant</TabsTrigger>
                                        <TabsTrigger value="upload">Upload Participant</TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="individual">
                                        <ActionForm
                                            buttonText="Save"
                                            comboboxField={[
                                                {
                                                    ...COMBOBOX_INPUT_GENDER[0],
                                                    data: filteredGenderOptions,
                                                },
                                            ]}
                                            fieldNames={FIELD_NAME_PARTICIPANT}
                                            fields={FIELD_PARTICIPANT_CONTEST}
                                            form={formParticipant}
                                            onSubmit={handleOnSubmitParticipant}
                                            fileInputRef={fileInputRef}
                                            isPending={loading}
                                        />
                                    </TabsContent>
                                    <TabsContent value="upload">
                                        <a href="/files/ Participant.xlsx" download="Team Participant File">
                                            <Button className="mb-6 w-full hover:cursor-pointer">Download Form</Button>
                                        </a>
                                        <ActionForm
                                            buttonText="Upload"
                                            fieldNames={UPLOAD_FIELD_PARTICIPANT}
                                            fields={UPLOAD_FIELD_PARTICIPANT_CONTEST}
                                            form={formParticipantImport}
                                            onSubmit={handleOnSubmitImportParticipant}
                                            fileInputRef={fileInputRef}
                                            isPending={loading}
                                        />
                                    </TabsContent>
                                </Tabs>
                            </DialogContent>
                        </Dialog>
                        <Link href={`/criteria/create/${contestId}/${contestType}/${roundType}`}>
                            <Button className="cursor-pointer">
                                <Plus />
                                Create Criteria
                            </Button>
                        </Link>
                        <CreateJudge contest={contest} />
                    </div>
                </div>
            </div>
            {/* <p className="text-xl font-medium">Participants</p> */}
            <div className="overflow-auto py-10">
                {participant.length === 0 && <div>No participants</div>}
                {participant.some((p) => p.gender === 'Male') && (
                    <div className="w-full">
                        <p className="mb-4 border-b border-white pb-1 text-lg font-semibold">Male Participants</p>
                        <div className="grid grid-flow-row grid-cols-2 gap-7 py-6 xl:grid-cols-2 2xl:grid-cols-3">
                            {participant
                                .filter((p) => p.gender === 'Male')
                                .map((item) => (
                                    <CardContent
                                        participantType="individual"
                                        key={item.id}
                                        className="h-full w-64 xl:w-72 2xl:w-86"
                                        item={{
                                            id: String(item.id),
                                            poster: item.poster_url,
                                        }}
                                        fullItem={item}
                                        fields={
                                            PARTICIPANT_FIELDS as {
                                                label: string;
                                                value: (item: unknown) => React.ReactNode;
                                            }[]
                                        }
                                        tanstack={true}
                                    />
                                ))}
                        </div>
                    </div>
                )}
                {/* Female Participants */}
                {participant.some((p) => p.gender === 'Female') && (
                    <div className="mt-10 w-full">
                        <p className="mb-4 border-b border-white pb-1 text-lg font-semibold">Female Participants</p>
                        <div className="grid grid-flow-row grid-cols-2 gap-7 py-6 xl:grid-cols-2 2xl:grid-cols-3">
                            {participant
                                .filter((p) => p.gender === 'Female')
                                .map((item) => (
                                    <CardContent
                                        participantType="individual"
                                        key={item.id}
                                        className="h-full w-64 xl:w-72 2xl:w-86"
                                        item={{
                                            id: String(item.id),
                                            poster: item.poster_url,
                                        }}
                                        fullItem={item}
                                        fields={
                                            PARTICIPANT_FIELDS as {
                                                label: string;
                                                value: (item: unknown) => React.ReactNode;
                                            }[]
                                        }
                                        tanstack={true}
                                    />
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
