import {
    COMBOBOX_INPUT_GENDER,
    FIELD_NAME_PARTICIPANT,
    FIELD_NAME_TEAM_PARTICIPANT,
    FIELD_PARTICIPANT_CONTEST,
    FIELD_TEAM_PARTICIPANT,
} from '@/lib/constant/contest';

import { addParticipantSchema, addTeamParticipantSchema, defaultValuesParticipants, defaultValuesTeamsParticipant } from '@/schema/contest';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import ActionForm from './ActionForm';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type PopoverProps = {
    tanstack: UseMutateAsyncFunction<AxiosResponse<string, string>, Error, { id: string }, unknown>;
    id: string;
    participantType?: 'individual' | 'team';
};

const ActionPopover = ({ tanstack, id, participantType, item }: PopoverProps) => {
    const { contest } = usePage().props;
    const contestId = contest[0]?.id;
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const formParticipant = useForm({
        resolver: zodResolver(addParticipantSchema),
        defaultValues: defaultValuesParticipants,
    });

    const formTeamParticipant = useForm({
        resolver: zodResolver(addTeamParticipantSchema),
        defaultValues: defaultValuesTeamsParticipant,
    });

    useEffect(() => {
        if (!item) return;

        if (participantType === 'individual') {
            formParticipant.reset({
                participant_no: item.participant_no,
                first_name: item.first_name,
                last_name: item.last_name,
                description: item.description || '',
                age: item.age || '',
                gender: item.gender,
                poster_url: item.poster_url || null,
            });
        }

        if (participantType === 'team') {
            formTeamParticipant.reset({
                team_participant_no: item.team_participant_no,
                team_name: item.team_name,
                team_description: item.team_description || '',
                team_captain: item.team_captain || '',
                poster_url: item.poster_url || null,
            });
        }
    }, [item, participantType, formParticipant, formTeamParticipant]);

    const handleOnSubmitParticipant = async (data: z.infer<typeof addParticipantSchema>) => {
        setLoading(true);
        router.post(`/contest/${contestId}/update/participant/${id}`, data, {
            onSuccess: () => {
                setLoading(false);
                setIsOpen(!open);
                toast.success('Participant updated successfully!');
                router.reload({ only: ['participants'] });
            },
            onError: (error) => {
                setLoading(false);
                console.log(error);
                toast.error('An error occurred');
            },
        });
    };

    const handleOnSubmitTeamParticipant = async (data: z.infer<typeof addTeamParticipantSchema>) => {
        setLoading(true);
        router.post(`/contest/${contestId}/team/${id}`, data, {
            onSuccess: () => {
                setLoading(false);
                setIsOpen(!open);
                toast.success('Participant updated successfully!');
                router.reload({ only: ['participants'] });
            },
            onError: (error) => {
                setLoading(false);
                console.log(error);
                toast.error('An error occurred');
            },
        });
    };

    const handleDelete = (id: string) => {
        // return tanstack({ id });
        setLoading(true);
        if (participantType === 'individual') {
            router.delete(`/contest/participant/${contestId}/${id}`, {
                onSuccess: () => {
                    setLoading(false);
                    setIsOpen(!open);
                    toast.success('Participant deleted');
                },
                onError: (error) => {
                    setLoading(false);
                    console.log(error);
                    toast.error('An error occurred');
                },
            });
        }
        if (participantType === 'team') {
            router.delete(`/contest/team-participant/${contestId}/${id}`, {
                onSuccess: () => {
                    setLoading(false);
                    toast.success('Participant deleted');
                },
                onError: (error) => {
                    setLoading(false);
                    console.log(error);
                    toast.error('An error occurred');
                },
            });
        }
    };

    const contestGenderCategory = contest[0]?.contest_gender_category;

    // Filter options based on the contest
    const filteredGenderOptions = COMBOBOX_INPUT_GENDER[0].data.filter((option) => {
        if (!contestGenderCategory || option.value === '') return true; // always include SELECT
        if (contestGenderCategory === 'male') return option.value === 'Male';
        if (contestGenderCategory === 'female') return option.value === 'Female';
        if (contestGenderCategory === 'maleFemale' || contestGenderCategory === 'mixed') return option.value === 'Male' || option.value === 'Female';
        return true;
    });

    const handleResetCloseDialog = (open: boolean) => {
        setIsOpen(open);
        formParticipant.reset();
    };

    const handleTeamResetCloseDialog = (open: boolean) => {
        setIsOpen(open);

        formTeamParticipant.reset();
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className="flex w-full justify-end">
                    <Button variant="ghost" className="h-4 cursor-pointer p-0">
                        <MoreHorizontal />
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-full p-2" align="end">
                <div className="flex w-full flex-col gap-2">
                    <div>
                        <h4 className="text-xs leading-none font-medium">Actions</h4>
                    </div>

                    {participantType === 'individual' && (
                        <>
                            <Dialog onOpenChange={handleResetCloseDialog} open={isOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="w-full cursor-pointer"
                                        onClick={() => {
                                            setIsOpen(!open);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Participant</DialogTitle>
                                        <DialogDescription>Participant Contest Info</DialogDescription>
                                    </DialogHeader>
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
                                        isPending={loading}
                                        // submitCombobox={isSubmit}
                                        // fileInputRef={fileInputRef}
                                        // isPending={pendingParticipant}
                                    />
                                </DialogContent>
                            </Dialog>

                            <Button
                                className="cursor-pointer font-normal hover:bg-[#45226b]"
                                onClick={() => handleDelete(id)}
                                variant="destructive"
                                disabled={loading}
                            >
                                Delete
                            </Button>
                        </>
                    )}

                    {participantType === 'team' && (
                        <>
                            <Dialog onOpenChange={handleTeamResetCloseDialog} open={isOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="default"
                                        className="w-full cursor-pointer"
                                        onClick={() => {
                                            setIsOpen(!open);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Participant</DialogTitle>
                                        <DialogDescription>Participant Contest Info</DialogDescription>
                                    </DialogHeader>
                                    <ActionForm
                                        buttonText="Save"
                                        // comboboxField={[
                                        //   {
                                        //     ...COMBOBOX_INPUT_GENDER[0],
                                        //     data: filteredGenderOptions,
                                        //   },
                                        // ]}
                                        isPending={loading}
                                        fieldNames={FIELD_NAME_TEAM_PARTICIPANT}
                                        fields={FIELD_TEAM_PARTICIPANT}
                                        form={formTeamParticipant}
                                        onSubmit={handleOnSubmitTeamParticipant}
                                        // submitCombobox={isSubmit}
                                        // fileInputRef={fileInputRef}
                                        // isPending={pendingTeamParticipant}
                                    />
                                </DialogContent>
                            </Dialog>

                            <Button
                                className="cursor-pointer font-normal hover:bg-[#45226b]"
                                onClick={() => handleDelete(id)}
                                variant="destructive"
                                disabled={loading}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ActionPopover;
