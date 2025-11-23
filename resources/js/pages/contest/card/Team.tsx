import { Contests } from '@/api/contest';
import { TeamParticipant } from '@/api/result';
import ActionForm from '@/components/ActionForm';
import CardContent from '@/components/card/CardContent';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    FIELD_NAME_TEAM_PARTICIPANT,
    FIELD_TEAM_PARTICIPANT,
    TEAM_PARTICIPANT_FIELDS,
    UPLOAD_FIELD_TEAM_PARTICIPANT,
    UPLOAD_FIELD_TEAM_PARTICIPANT_CONTEST,
} from '@/lib/constant/contest';
import {
    addImportTeamParticipantSchema,
    addTeamParticipantSchema,
    defaultValuesImportTeamParticipant,
    defaultValuesTeamsParticipant,
} from '@/schema/contest';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from '@inertiajs/react';
import { ImagePlus, Loader2, Plus, UserPlus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import CreateJudge from '../CreateJudge';

export const posterSchema = z.object({
    poster: z
        .any()
        .refine((file) => file === null || file instanceof File, {
            message: 'Please upload a valid image',
        })
        .refine((file) => file !== null, {
            message: 'No image uploaded. Please upload an image',
        }),
});

type PROPS = { contest: Contests[]; participant: TeamParticipant[]; poster: string };

export default function Team({ contest, participant, poster }: PROPS) {
    const contestId = contest[0]?.id;

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const scoringType = contest[0].contest_scoring_type;
    const base = scoringType.toLowerCase().includes('rank') ? 'rank' : 'point';
    // Detect single or multiple
    const round = scoringType.toLowerCase().includes('single') ? 'sr' : 'mr';
    const roundType = `${base}-${round}`;
    const contestType = contest[0].contest_type.toLowerCase();
    const [loading, setLoading] = useState<boolean>(false);
    const fileRef = useRef<HTMLInputElement | null>(null);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const formParticipantTeam = useForm({
        resolver: zodResolver(addTeamParticipantSchema),
        defaultValues: defaultValuesTeamsParticipant,
    });

    const formTeamParticipantImport = useForm({
        resolver: zodResolver(addImportTeamParticipantSchema),
        defaultValues: defaultValuesImportTeamParticipant,
    });

    const handleSubmitTeam = (data: z.infer<typeof addTeamParticipantSchema>) => {
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

        router.post(`/event/${contestId}/team-participant`, formData, {
            onSuccess: () => {
                setLoading(false);
                toast.success('Team Participant added successfully.');
                formParticipantTeam.reset();
                setIsOpen(false);
                router.reload({ only: ['participants'] });
            },
            onError: (error) => {
                setLoading(false);
                console.log(error);
            },
        });
    };

    const handleSubmitImportTeam = async (data: z.infer<typeof addImportTeamParticipantSchema>) => {
        setLoading(true);
        router.post(`/contest/${contestId}/team-participant/upload`, data, {
            onSuccess: () => {
                setLoading(false);
                setIsOpen(!open);
                toast.success('Participant imported');
            },
            onError: (error) => {
                setLoading(false);
                console.log(error);
            },
        });
    };

    const handleResetCloseDialog = (open: boolean) => {
        setIsOpen(open);
        formParticipantTeam.reset();
        formTeamParticipantImport.reset();
    };

    const form = useForm<z.infer<typeof posterSchema>>({
        resolver: zodResolver(posterSchema),
        defaultValues: {
            poster: '',
        },
    });

    async function onSubmit(values: z.infer<typeof posterSchema>) {
        setLoading(true);
        router.post(`/event/poster/${contestId}`, values, {
            onSuccess: () => {
                setLoading(false);
                toast.success('Poster updated successfully!');
            },
            onError: (error) => {
                setLoading(false);
                console.log(error);
            },
        });
    }

    return (
        <div className="flex flex-col gap-6 xl:flex-row">
            {/* <div>
             
            </div> */}
            <Card className="h-fit w-full p-6">
                <div className="h-full space-y-7">
                    <div>
                        <div className="mb-8 space-y-2">
                            {poster ? (
                                <img src={`/storage/${poster}`} className="h-96 w-full rounded-md object-cover object-center" alt="poster" />
                            ) : (
                                <div className="flex h-96 w-full items-center justify-center rounded-md bg-gray-200 text-black">
                                    No Poster Available
                                </div>
                            )}
                        </div>
                        <div className="flex w-full max-w-sm items-center gap-3">
                            <Dialog>
                                <form>
                                    <DialogTrigger asChild>
                                        <Button variant="default" className="hover:cursor-pointer">
                                            <ImagePlus />
                                            Poster
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Poster</DialogTitle>
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
                                                <Button disabled={loading} type="submit">
                                                    {loading && <Loader2 className="animate-spin" />}
                                                    Save
                                                </Button>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </form>
                            </Dialog>
                            <div className="flex justify-between gap-2">
                                <Dialog onOpenChange={handleResetCloseDialog} open={isOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="default"
                                            className="cursor-pointer"
                                            onClick={() => {
                                                // setId(item.id);
                                                setIsOpen(true);
                                            }}
                                        >
                                            <UserPlus /> Create Participant
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Team Participant</DialogTitle>
                                            <DialogDescription>Team Participant Contest Info</DialogDescription>
                                        </DialogHeader>
                                        <Tabs defaultValue="individual">
                                            <TabsList>
                                                <TabsTrigger value="individual">Team Participant</TabsTrigger>
                                                <TabsTrigger value="upload">Upload Team Participant</TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="individual">
                                                <ActionForm
                                                    buttonText="Save"
                                                    fieldNames={FIELD_NAME_TEAM_PARTICIPANT}
                                                    fields={FIELD_TEAM_PARTICIPANT}
                                                    form={formParticipantTeam}
                                                    onSubmit={handleSubmitTeam}
                                                    fileInputRef={fileInputRef}
                                                    isPending={loading}
                                                />
                                            </TabsContent>
                                            <TabsContent value="upload">
                                                <a href="/files/Team Participant.xlsx" download="Team Participant File">
                                                    <Button className="mb-6 w-full hover:cursor-pointer">Download Form</Button>
                                                </a>
                                                <ActionForm
                                                    buttonText="Upload"
                                                    fieldNames={UPLOAD_FIELD_TEAM_PARTICIPANT}
                                                    fields={UPLOAD_FIELD_TEAM_PARTICIPANT_CONTEST}
                                                    form={formTeamParticipantImport}
                                                    onSubmit={handleSubmitImportTeam}
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
                    <p className="text-xl font-medium">Participants</p>
                    <div className="grid grid-flow-row grid-cols-2 gap-7 overflow-auto py-10 xl:grid-cols-3 2xl:grid-cols-3">
                        {participant.length === 0 && <div>No participants</div>}
                        {participant?.map((item) => (
                            <CardContent
                                participantType="team"
                                className="h-full w-64 xl:w-72 2xl:w-86"
                                key={item.id}
                                item={{
                                    id: String(item.id),
                                    poster: item.poster_url,
                                }}
                                fullItem={item}
                                fields={
                                    TEAM_PARTICIPANT_FIELDS as {
                                        label: string;
                                        value: (item: unknown) => React.ReactNode;
                                    }[]
                                }
                                tanstack={true}
                            />
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
}
