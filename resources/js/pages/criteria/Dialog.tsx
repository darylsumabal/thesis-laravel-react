import { MultipleRoundCriteria } from '@/api/criteria';
import { Participant, TeamParticipant } from '@/api/result';
import { JudgesData } from '@/api/scoring';
import TableCardCriteria from '@/components/table/TableCardCriteria';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CriteriaAddRound, CriteriaRound } from '@/schema/scoring';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { Loader2, PlusCircleIcon } from 'lucide-react';
import { useState } from 'react';
import { FieldArrayWithId, UseFieldArrayRemove, useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';

import { z } from 'zod';

type DialogAddCriteriaProps = {
    judges: JudgesData[];
    addedJudges: string[];
    formJudges: UseFormReturn<
        {
            judges: {
                id: number;
            }[];
        },
        {
            judges: {
                id: number;
            }[];
        }
    >;
    handleToggleChange: (
        value: string,
        id: number,
        targetForm: UseFormReturn<
            {
                judges: {
                    id: number;
                }[];
            },
            {
                judges: {
                    id: number;
                }[];
            }
        >,
    ) => void;
    handleAddJudges: () => Promise<void>;
    selectedJudges: string[];
    pendingJudges: boolean;
    judgesCriteria: {
        judge: {
            id: number;
            name: string;
        };
    }[];
};

export function DialogAddJudges({
    judges,
    addedJudges,
    formJudges,
    handleToggleChange,
    handleAddJudges,
    selectedJudges,
    pendingJudges,
    judgesCriteria,
}: DialogAddCriteriaProps) {
    const dataJudges = judges
        ?.sort((a, b) => {
            const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10);
            const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10);
            return numA - numB;
        })
        .map((item) => ({
            id: item.id,
            value: item.name,
            label: item.name,
            role: item.role,
        }));

    return (
        <Dialog>
            <DialogTrigger asChild>
                <PlusCircleIcon className="cursor-pointer" />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Select Judges</DialogTitle>
                    <DialogDescription>Choose a judges. Click add judges when you're done.</DialogDescription>
                </DialogHeader>
                <ToggleGroup type="multiple" variant="default">
                    <div className="items-center space-y-2 space-x-2">
                        {dataJudges?.map((item) => (
                            <ToggleGroupItem
                                key={item.id}
                                value={item.label}
                                aria-label={item.label}
                                className={`h-fit w-fit ${addedJudges.includes(item.label) ? 'bg-[#45226b]' : ''}`}
                                onClick={() => handleToggleChange(item.label, Number(item.id), formJudges)}
                                // disabled={judgesId.some((i) => i === item.id)}
                                disabled={judgesCriteria.some((i) => i.judge.name === item.label)}
                            >
                                <div>
                                    <p>{item.label}</p>
                                    <p>{item.role}</p>
                                </div>
                            </ToggleGroupItem>
                        ))}
                    </div>
                </ToggleGroup>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button className="cursor-pointer" variant={'default'} onClick={handleAddJudges} disabled={selectedJudges.length === 0}>
                            {pendingJudges && <Loader2 />}
                            Add Judges
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type DialogAddCriteria = {
    openAddCriteria: boolean;
    setOpenAddCriteria: React.Dispatch<React.SetStateAction<boolean>>;
    formAddCriteria: UseFormReturn<CriteriaAddRound>;
    fieldAddCriteria: FieldArrayWithId<
        {
            criteria: {
                criteria: {
                    criteria: string;
                    round: string;
                    category: string;
                    criterion: {
                        evaluationCriterion: string;
                        score: number;
                        id?: number | undefined;
                    }[];
                }[];
            };
        },
        'criteria.criteria',
        'id'
    >[];
    onSubmitAddCriteria: (data: CriteriaAddRound) => Promise<void>;
    pendingAddCriteria: boolean;
    removeAddCriteria: UseFieldArrayRemove;
    handleWatchCriteriaAddScore: (idx: number) => number;
    scoringType: string;
};

export function DialogAddCriteria({
    openAddCriteria,
    setOpenAddCriteria,
    formAddCriteria,
    fieldAddCriteria,
    onSubmitAddCriteria,
    pendingAddCriteria,
    removeAddCriteria,
    handleWatchCriteriaAddScore,
    scoringType,
}: DialogAddCriteria) {
    return (
        <Dialog open={openAddCriteria} onOpenChange={setOpenAddCriteria}>
            <DialogTrigger asChild>
                <Button>Add Criteria</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Criteria</DialogTitle>
                    <DialogDescription>Edit Criteria</DialogDescription>
                </DialogHeader>
                <Form {...formAddCriteria}>
                    {fieldAddCriteria.map((item, idx) => (
                        <div key={idx}>
                            <TableCardCriteria
                                id={item.id}
                                onSubmit={onSubmitAddCriteria}
                                isPending={pendingAddCriteria}
                                fieldRound={fieldAddCriteria}
                                removeRound={removeAddCriteria}
                                idx={idx}
                                form={formAddCriteria as unknown as UseFormReturn<CriteriaRound>}
                                watchScore={handleWatchCriteriaAddScore}
                                roundScoring={true}
                                multipleRound={true}
                                edit={scoringType == 'sr' ? false : true}
                                buttonTitle="Create criteria"
                            />
                        </div>
                    ))}
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function DialogEditQualified() {
    const [open, setOpen] = useState<boolean>(false);
    const { participant, contestId, groupId, qualified } = usePage<{ participant: Participant[] | TeamParticipant[] }>().props;
    const [loading, setLoading] = useState<boolean>(false);
    const formSchema = z.object({
        qualified: z.coerce.number().min(1, {
            message: 'Qualified participant must be at least 1',
        }),
    });

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            qualified: qualified,
        },
    });

    const handleOnSubmit = (data: z.infer<typeof formSchema>) => {
        setLoading(true);
        const promise = new Promise((resolve, reject) => {
            router.post(`/criteria/update/qualified/${contestId}/${groupId}`, data, {
                preserveScroll: true,
                onSuccess: (page) => {
                    router.reload({ only: ['qualified'] });
                    setOpen(false);
                    setLoading(false);
                    resolve(page);
                },
                onError: (error) => {
                    console.log(error);
                    reject(error);
                    setLoading(false);
                },
            });
        });
        toast.promise(promise, {
            loading: 'Loading...',
            success: 'Qualified edited successfully!',
            error: 'Failed to edit.',
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Edit Qualified</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Qualified Participant</DialogTitle>
                    <DialogDescription>Edit Qualified Participant</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-8">
                        <p className="font-medium">Total Participant {participant.length}</p>
                        <FormField
                            control={form.control}
                            name={`qualified`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <FormLabel>Qualified Participant</FormLabel>
                                            <Input
                                                {...field}
                                                type="number"
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === '') {
                                                        field.onChange('');
                                                        return;
                                                    }
                                                    const num = Number(val);
                                                    if (num >= 0 && num <= participant.length) {
                                                        field.onChange(num);
                                                    }
                                                }}
                                                placeholder="Enter qualified participant"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" className="w-fit" disabled={loading}>
                                {loading && <Loader2 className="animate-spin" />}
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

type DeleteCriteriaProps = {
    criteria: string;
    round: string;
    refetch?: (options?: RefetchOptions) => Promise<QueryObserverResult<MultipleRoundCriteria[], Error>>;
};

export function DeleteCriteria({ criteria, round }: DeleteCriteriaProps) {
    const [open, setOpen] = useState<boolean>(false);
    const { contestId, groupId } = usePage().props;
    const [loading, setLoading] = useState<boolean>(false);
    const handleDelete = async () => {
        setLoading(true);
        const promise = new Promise((resolve, reject) => {
            router.delete(`/criteria/${contestId}/${groupId}`, {
                data: {
                    criteria: [
                        {
                            criteria: criteria,
                            round: round,
                        },
                    ],
                },
                preserveScroll: true,
                onSuccess: (page) => {
                    setOpen(false);
                    resolve(page);
                    router.reload({ only: ['criteria'] });

                    setLoading(false);
                },
                onError: (error) => {
                    console.log(error);
                    setLoading(false);
                    reject(error);
                },
            });
        });

        toast.promise(promise, {
            loading: 'Loading...',
            success: 'Criteria deleted successfully!',
            error: 'Failed to delete',
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Criteria</DialogTitle>
                    <DialogDescription>Are you sure you want to delete this criteria?</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" onClick={() => handleDelete()} variant={'destructive'} disabled={loading}>
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type UpdatePercentageProps = {
    roundScore: { round: string; percentage: string }[];
};

export function UpdatePercentage({ roundScore }: UpdatePercentageProps) {
    const [open, setOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { contestId, groupId } = usePage().props;

    const formSchema = z.object({
        preliminary: z.coerce
            .number()
            .min(1, {
                message: 'Preliminary scoring must be between 1 and 100',
            })
            .max(100, {
                message: 'Preliminary scoring must be between 1 and 100',
            }),
        final: z.coerce
            .number()
            .min(1, {
                message: 'Preliminary scoring must be between 1 and 100',
            })
            .max(100, {
                message: 'Preliminary scoring must be between 1 and 100',
            }),
    });
    const defaultValues = {
        preliminary: Number(roundScore.find((r) => r.round.toLowerCase() === 'preliminary')?.percentage) || 0,
        final: Number(roundScore.find((r) => r.round.toLowerCase() === 'final')?.percentage) || 0,
    };
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues,
    });

    const handleUpdate = (data: z.infer<typeof formSchema>) => {
        setLoading(true);
        const promise = new Promise((resolve, reject) => {
            router.post(`/criteria/update/percentage/${contestId}/${groupId}`, data, {
                preserveScroll: true,
                onSuccess: (page) => {
                    setLoading(false);
                    router.reload({ only: ['roundScore'] });
                    setOpen(false);
                    resolve(page);
                },
                onError: (error) => {
                    setLoading(false);
                    console.log(error);
                    reject(error);
                },
            });
        });

        toast.promise(promise, {
            loading: 'Loading...',
            success: 'Updated successfully!',
            error: 'Failed to update.',
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Edit Percentage</Button>
            </DialogTrigger>

            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-8">
                        <DialogHeader>
                            <DialogTitle>Round Percentage</DialogTitle>
                            <DialogDescription>Update Round Final Scoring Percentage</DialogDescription>
                        </DialogHeader>

                        <FormField
                            control={form.control}
                            name={`preliminary`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <FormLabel>Preliminary Round Percentage Score</FormLabel>
                                            <Input
                                                {...field}
                                                type="number"
                                                max={100}
                                                value={field.value || ''}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLInputElement;

                                                    if (target.value.length > 3) {
                                                        target.value = target.value.slice(0, 3);
                                                    }
                                                }}
                                                placeholder="Enter a number"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name={`final`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="space-y-2">
                                            <FormLabel>Final Round Percentage Score</FormLabel>
                                            <Input
                                                {...field}
                                                type="number"
                                                max={100}
                                                value={field.value || ''}
                                                onInput={(e) => {
                                                    const target = e.target as HTMLInputElement;
                                                    // restrict length to 3 characters
                                                    if (target.value.length > 3) {
                                                        target.value = target.value.slice(0, 3);
                                                    }
                                                    // enforce max 100
                                                    // if (Number(target.value) > 100) {
                                                    //   target.value = "100";
                                                    // }
                                                }}
                                                placeholder="Enter a number"
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
