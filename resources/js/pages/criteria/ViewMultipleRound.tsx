import { CriteriaInfos, MultipleCriterion, MultipleRoundCriteria } from '@/api/criteria';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { scoreMap } from '@/lib/constant/contest';
import { CriteriaAddRound, CriteriaAddSchema, CriteriaRound, CriteriaRoundSr, CriteriaSchema, judgesSchema } from '@/schema/scoring';

import { Contests } from '@/api/contest';
import { Participant, TeamParticipant } from '@/api/result';
import { JudgesData } from '@/api/scoring';
import TableCardCriteria from '@/components/table/TableCardCriteria';
import { Toaster } from '@/components/ui/sonner';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Trash } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { DeleteCriteria, DialogAddCriteria, DialogAddJudges, DialogEditQualified, UpdatePercentage } from './Dialog';
import { column } from './columns';

export type PROPS = {
    contest: Contests[];
    criteria: MultipleRoundCriteria[];
    criteriaInfo?: CriteriaInfos[];
    judgesCriteria: {
        judge: {
            id: number;
            name: string;
            role: string;
        };
    }[];
    prelimFinal: string;
    roundScore: { round: string; percentage: string }[];
    qualified: number;
    judges: JudgesData[];
    contestId: number;
    groupId: string;
    participant: Participant[] | TeamParticipant[];
};

const ViewMultipleRound = ({ contest, criteria, judgesCriteria, prelimFinal, qualified, judges, roundScore, participant }: PROPS) => {
    const [open, setOpen] = useState<boolean>(false);
    const [openAddCriteria, setOpenAddCriteria] = useState<boolean>(false);
    const { contestId, groupId } = usePage().props;

    const scoringType = scoreMap[contest[0]?.contest_scoring_type || ''];

    const flattenedData = useMemo(() => {
        return criteria?.flatMap((item) => item.criteria_test) ?? [];
    }, [criteria]);

    const table = useReactTable({
        data: flattenedData,
        columns: column,
        getCoreRowModel: getCoreRowModel(),
    });
    const [selectedJudges, setSelectedJudges] = useState<string[]>([]);
    // const [selectedJudges, setSelectedJudges] = useState<Option[]>([]);
    const [, setValue] = useState('');
    const [addedJudges, setAddedJudges] = useState<string[]>([]);
    // const [addedJudges, setAddedJudges] = useState<Option[]>([]);
    const [judgesId, setJudgesId] = useState<number[]>([]);

    const handleOpen = (criteriaId: number) => {
        // Find the selected criteria group based on criteriaId
        let selectedRound = '';
        let selectedCriteria = '';
        let selectedGroup: MultipleCriterion[] = [];

        for (const [round, criteriaGroups] of Object.entries(groupedByRoundAndCriteria)) {
            for (const [criteria, items] of Object.entries(criteriaGroups)) {
                if (items.some((item) => item.id === criteriaId)) {
                    selectedRound = round;
                    selectedCriteria = criteria;
                    selectedGroup = items;
                    break;
                }
            }
            if (selectedGroup.length > 0) break;
        }

        // Safety check
        if (selectedGroup.length === 0) return;

        // Build all criterion under that group
        const criterionList = selectedGroup.map((item) => ({
            id: item.id,
            evaluationCriterion: item.evaluation_criteria || '',
            score: Number(item.score) || 0,
        }));

        // Reset form with all criteria in the selected group
        form.reset({
            judges: judgesCriteria
                ? judgesCriteria.map((i) => ({
                      id: i.judge.id,
                  }))
                : [],
            qualified: qualified,
            preliminary: 0,
            scoringMethod: 'Final',
            final: 0,
            criteria: {
                criteria: [
                    {
                        criteria: selectedCriteria,
                        round: selectedRound,
                        category: selectedGroup[0].category || 'Mixed',
                        criterion: criterionList, // 👈 all criteria appear here
                    },
                ],
            },
        });

        setOpen(true);
    };

    const defaultValues: CriteriaRound | CriteriaRoundSr = {
        judges: [],
        qualified: 0,
        preliminary: 0,
        scoringMethod: '',
        final: 0,
        criteria: {
            criteria: [
                {
                    criteria: '',
                    round: '',
                    category: 'Mixed',
                    criterion: [{ evaluationCriterion: '', score: 0 }],
                },
            ],
        },
    };

    const defaultValuesCriteriaAdd: CriteriaAddRound = {
        judges: judges?.map((i) => ({ id: Number(i.id) })) ?? [],
        criteria: {
            criteria: [
                {
                    criteria: '',
                    round: scoringType?.includes('sr') ? 'Preliminary' : '',
                    category: 'Mixed',
                    criterion: [{ evaluationCriterion: '', score: 0 }],
                },
            ],
        },
    };

    const form = useForm<CriteriaRound | CriteriaRoundSr>({
        resolver: zodResolver(CriteriaSchema),
        defaultValues,
    });

    const formAddCriteria = useForm<CriteriaAddRound>({
        resolver: zodResolver(CriteriaAddSchema),
        defaultValues: defaultValuesCriteriaAdd,
    });

    useEffect(() => {
        if (judgesCriteria && judgesCriteria.length > 0) {
            formAddCriteria.reset({
                judges: judgesCriteria.map((i) => ({ id: i.judge.id })),
                criteria: {
                    criteria: [
                        {
                            criteria: '',
                            round: scoringType?.includes('sr') ? 'Preliminary' : '',
                            category: 'Mixed',
                            criterion: [{ evaluationCriterion: '', score: 0 }],
                        },
                    ],
                },
            });
        }
    }, [judgesCriteria, formAddCriteria, scoringType]);

    const formJudges = useForm({
        resolver: zodResolver(
            z.object({
                judges: z.array(judgesSchema),
            }),
        ),
        defaultValues: {
            judges: [],
        },
    });

    const onSubmit = (data: CriteriaRound | CriteriaRoundSr) => {
        const invalidRounds = data.criteria.criteria.some((_round, idx) => {
            const totalScore = handleWatchScore(idx);
            return totalScore > 100;
        });

        if (invalidRounds) {
            toast.error("Each round's total score must be 100!");
            return;
        }

        router.post(`/criteria/update/${contestId}/${groupId}`, data, {
            onSuccess: () => {
                form.reset();
                router.reload({ only: ['criteria'] });
                setOpen(false);
                toast.success('Criteria updated!');
            },
            onError: (error) => {
                console.log(error);
            },
        });
    };

    const onSubmitAddCriteria = (data: CriteriaAddRound) => {
        const invalidRounds = data.criteria.criteria.some((_round, idx) => {
            const totalScore = handleWatchCriteriaAddScore(idx);
            return totalScore > 100;
        });

        if (invalidRounds) {
            toast.error('This round total score must be 100!');
            return;
        }

        router.post(`/criteria/criteria-add/${contestId}/${groupId}`, data, {
            onSuccess: () => {
                toast.success('Criteria added');
                formAddCriteria.reset();
                setOpenAddCriteria(false);
                router.reload({ only: ['criteria'] });
            },
            onError: (error) => {
                console.log(error);
            },
        });
    };

    const groupedByRoundAndCriteria = useMemo(() => {
        return flattenedData.reduce(
            (acc, item) => {
                if (!acc[item.round]) acc[item.round] = {};
                if (!acc[item.round][String(item.criteria)]) acc[item.round][String(item.criteria)] = [];
                acc[item.round][String(item.criteria)].push(item);
                return acc;
            },
            {} as Record<string, Record<string, typeof flattenedData>>,
        );
    }, [flattenedData]);

    const {
        fields: fieldCriteria,
        // append: appendCriteria,
        remove: removeCriteria,
    } = useFieldArray({
        control: form.control,
        name: `criteria.criteria`,
    });

    const {
        fields: fieldAddCriteria,
        // append: appendCriteria,
        remove: removeAddCriteria,
    } = useFieldArray({
        control: formAddCriteria.control,
        name: `criteria.criteria`,
    });

    const handleWatchScore = (idx: number) => {
        const totalScore = form.watch(`criteria.criteria.${idx}.criterion`).reduce((sum, criterion) => {
            return sum + (Number(criterion.score) || 0);
        }, 0);
        return totalScore;
    };

    const handleWatchCriteriaAddScore = (idx: number) => {
        const totalScore = formAddCriteria.watch(`criteria.criteria.${idx}.criterion`).reduce((sum, criterion) => {
            return sum + (Number(criterion.score) || 0);
        }, 0);
        return totalScore;
    };

    const handleToggleChange = (value: string, id: number, targetForm: typeof formJudges) => {
        setSelectedJudges((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));

        setJudgesId((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

        const selectedJudges = targetForm.watch('judges');

        const updatedSelectedJudges = selectedJudges.map((judge) => (typeof judge === 'number' ? { id: judge } : judge));

        const updatedJudges = judgesId.some((judge) => judge === id) ? judgesId.filter((item) => item !== id) : [...updatedSelectedJudges, { id }];

        targetForm.setValue('judges', updatedJudges as { id: number }[]);
    };

    const handleAddJudges = () => {
        const formData = formJudges.getValues();
        setAddedJudges(selectedJudges);
        setJudgesId(judgesId);

        router.post(`/criteria/add-judges/${contestId}/${groupId}`, formData, {
            onSuccess: () => {
                router.reload({ only: ['judgesCriteria'] });
                setAddedJudges([]);
                setJudgesId([]);
                setSelectedJudges([]);
                setValue('');
                toast.success('Judges added');
            },
            onError: (error) => {
                console.log(error);
            },
        });
    };

    const handleDeleteJudges = (id: number) => {
        router.delete(`/criteria/delete-judges/${id}/${contestId}/${groupId}`, {
            onSuccess: () => {
                router.reload({ only: ['judgesCriteria'] });
                toast.success('Judges deleted in this contest');
            },
            onError: (error) => {
                console.log(error);
            },
        });
    };
    return (
        <Card className="h-fit rounded-xl p-6">
            <Toaster richColors closeButton position="top-center" />
            <div className="w-full space-y-4">
                <div className="flex w-full gap-4">
                    <div className="flex w-full flex-col">
                        <p className="mb-3 text-lg font-bold capitalize">Judges</p>
                        <Card className="mb-10 flex-1 border-2 p-2">
                            <DialogAddJudges
                                judges={judges ?? []}
                                addedJudges={addedJudges}
                                formJudges={formJudges}
                                handleToggleChange={handleToggleChange}
                                handleAddJudges={handleAddJudges}
                                selectedJudges={selectedJudges}
                                // pendingJudges={pendingJudges}
                                judgesCriteria={judgesCriteria ?? []}
                            />

                            <div className="flex gap-4 divide-x-2 divide-black">
                                {judgesCriteria?.map((i, index) => (
                                    <div className="pr-2 text-center" key={index}>
                                        <p className="font-medium">{i.judge.name}</p>
                                        <Button onClick={() => handleDeleteJudges(i.judge.id)} variant="link" className="hover:cursor-pointer">
                                            <Trash color="red" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    <div className="flex w-full flex-col">
                        <p className="mb-3 text-lg font-bold capitalize">Qualified Participants</p>
                        <Card className="mb-10 flex-1 border-2 p-2">
                            <p>Total Participants {participant.length}</p>
                            <p>Qualified Participants {qualified}</p>
                        </Card>
                    </div>
                    {prelimFinal === 'PrelimFinal' && (
                        <div className="flex w-full flex-col">
                            <p className="mb-3 text-lg font-bold capitalize">Round Percentage</p>
                            <Card className="mb-10 flex-1 border-2 p-2">
                                {roundScore?.map((i) => (
                                    <div key={i.round} className="flex gap-4">
                                        <span className="font-medium">{i.round}</span>
                                        <span className="font-medium">{i.percentage}%</span>
                                    </div>
                                ))}
                            </Card>
                        </div>
                    )}
                </div>
                <div className="space-x-2">
                    <DialogAddCriteria
                        openAddCriteria={openAddCriteria}
                        setOpenAddCriteria={setOpenAddCriteria}
                        formAddCriteria={formAddCriteria}
                        fieldAddCriteria={fieldAddCriteria}
                        onSubmitAddCriteria={onSubmitAddCriteria}
                        // pendingAddCriteria={pendingAddCriteria}
                        removeAddCriteria={removeAddCriteria}
                        scoringType={scoringType}
                        handleWatchCriteriaAddScore={handleWatchCriteriaAddScore}
                    />
                    <DialogEditQualified />
                    {prelimFinal === 'PrelimFinal' && <UpdatePercentage roundScore={roundScore} />}
                </div>
                {Object.entries(groupedByRoundAndCriteria).map(([round, criteriaGroups]) => (
                    <div key={round} className="mb-4">
                        {scoringType === 'sr' ? (
                            <div className="mb-3 text-lg font-bold capitalize">Contest</div>
                        ) : (
                            <div className="mb-3 text-lg font-bold capitalize">{round} Round Contest</div>
                        )}

                        {Object.entries(criteriaGroups).map(([criteria, items]) => (
                            <Card key={criteria} className="mb-10 border-2 p-2">
                                <div className="flex space-x-2">
                                    <Button className="w-fit cursor-pointer font-normal" variant="default" onClick={() => handleOpen(items[0].id)}>
                                        Edit
                                    </Button>
                                    <DeleteCriteria criteria={criteria} round={items[0].round} />
                                </div>
                                <div className="font-semibold capitalize">{criteria}</div>

                                <Table className="border-b">
                                    <TableHeader>
                                        {table.getHeaderGroups().map((headerGroup) => (
                                            <TableRow key={headerGroup.id}>
                                                {headerGroup.headers.map((header) => (
                                                    <TableHead key={header.id}>
                                                        {header.isPlaceholder
                                                            ? null
                                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableHeader>

                                    <TableBody>
                                        {items.map((i) => (
                                            <TableRow key={i.id} className="text-base capitalize">
                                                <TableCell>{i.evaluation_criteria}</TableCell>
                                                <TableCell>{i.score}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Card>
                        ))}
                    </div>
                ))}
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criteria</DialogTitle>
                            <DialogDescription>Edit Criteria</DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            {fieldCriteria.map((item, idx) => (
                                <div key={idx}>
                                    <TableCardCriteria
                                        id={item.id}
                                        onSubmit={onSubmit}
                                        // isPending={isPending}
                                        fieldRound={fieldCriteria}
                                        removeRound={removeCriteria}
                                        idx={idx}
                                        form={form as UseFormReturn<CriteriaRound>}
                                        watchScore={handleWatchScore}
                                        roundScoring={true}
                                        multipleRound={true}
                                        edit={false}
                                        buttonTitle="Edit criteria"
                                    />
                                </div>
                            ))}
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </Card>
    );
};

export default ViewMultipleRound;
