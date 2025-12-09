import { Participant } from '@/api/result';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useContextUser } from '@/context/ContesxtProvider';
import { PointBasedSchemaTest, pointBasedSchemaTest } from '@/schema/criteria';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import { useEcho } from '@laravel/echo-react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { CriteriaCard } from './CriteriaCard';

export type CriteriaItem = {
    id: number;
    criteria: string;
    category: string;
    evaluation_criteria: string;
    score: number;
    group_id: string;
    round: string;
    contest_id: number;
    created_at: string;
    updated_at: string;
};

export type CriteriaTests = {
    criteria: string;
    category: string;
    gender_category: string;
    items: CriteriaItem[];
    participants: Participant[];
};

export function CriteriaGroupWrapper({ group, criteriaGroup }: { group: CriteriaTests; criteriaGroup: CriteriaTests }) {
    const { judge, savedCriteria, auth, contestId, groupId } = usePage().props;
    const judgeId = auth?.user.id;

    const filteredParticipants = (criteriaGroup.participants || []).filter((p) => p.gender === p.gender);
    const [loading, setLoading] = useState<boolean>(false);
    const [, setIsSubmitted] = useState(false);
    const { setPendingSubmitScore } = useContextUser();
    const currentRounds = group.items.find((i) => ['Final', 'Preliminary'].includes(i.round))?.round ?? '';
    const [loadingRequest, setLoadingRequest] = useState(false);

    useEcho('submit-score', 'JudgeSubmit', (event: { contestId: number; groupId: number }) => {
        if (event.contestId == contestId && event.groupId == groupId) {
            // toast.promise(
            //     new Promise((resolve, reject) => {
            //         router.reload({
            //             only: ['judge'],
            //             onFinish: () => resolve('success'),
            //             onError: () => reject('error'),
            //         });
            //     }),
            //     {
            //         loading: 'Refreshing...',
            //         success: 'You can now edit',
            //         error: 'Failed to refresh results',
            //     },
            // );
            router.reload({
                only: ['judge'],
                // onFinish: () => resolve('success'),
                // onError: () => reject('error'),
            });
        }
    });

    useEcho('request-edit', 'RequestEdit', (event: { contestId: number; groupId: number; judgeId: number; judgeName: string; action: string }) => {
        if (event.contestId == contestId && event.groupId == groupId) {
            if (event.judgeId == judgeId) {
                if (event.action === 'request') {
                    toast.success(`Requested to edit scores`);
                } else if (event.action === 'grant') {
                    toast.success(`You can now edit the scores`);
                }
            }

            // If you want to reload judges list:
            router.reload({
                only: ['judge'],
            });
        }
    });

    const getDefaultValues = () => {
        const criteria: Record<
            number, // participant_id
            Record<
                number, // item_id
                {
                    judges_id: number;
                    participant_id: number;
                    participant_type: string;
                    contest_id: number;
                    group_id: string;
                    round: string;
                    evaluation_criteria: string;
                    criteria: string;
                    score: number;
                }
            >
        > = {};

        filteredParticipants.forEach((participant) => {
            criteria[participant.id] = criteria[participant.id] || {};

            criteriaGroup.items.forEach((item) => {
                const saved = savedCriteria?.find(
                    (s) =>
                        s.participant_id === participant.id &&
                        s.evaluation_criteria === item.evaluation_criteria &&
                        s.group_id === groupId &&
                        s.judges_id === judgeId &&
                        s.criteria === item.criteria,
                );

                criteria[participant.id][item.id] = {
                    judges_id: judgeId,
                    round: currentRounds,
                    participant_id: participant.id,
                    participant_type: 'individual',
                    contest_id: Number(contestId),
                    group_id: groupId,
                    evaluation_criteria: item.evaluation_criteria,
                    criteria: item.criteria,
                    score: saved ? saved.score : 0,
                };
            });
        });

        return { criteria };
    };

    const form = useForm({
        resolver: zodResolver(PointBasedSchemaTest),
        defaultValues: getDefaultValues(),
    });

    useEffect(() => {
        if (!judge) return;
        const match = judge.some((i) => group.criteria.includes(i.criteria) && i.is_finished == 1);
        setIsSubmitted(match);
    }, [judge, group.criteria]);

    useEffect(() => {
        if (savedCriteria) {
            form.reset(getDefaultValues());
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savedCriteria, form]);

    useEffect(() => {
        if (!savedCriteria || savedCriteria.length === 0) return;

        const allSaved = filteredParticipants.every((participant) =>
            criteriaGroup.items.every((item) =>
                savedCriteria.some(
                    (s) =>
                        s.participant_id === participant.id &&
                        s.evaluation_criteria === item.evaluation_criteria &&
                        s.group_id === (groupId ?? '') &&
                        s.judges_id === judgeId &&
                        s.criteria === item.criteria,
                ),
            ),
        );

        if (allSaved) {
            setIsSubmitted(true); // Disable submit button if everything is saved
        }
    }, [savedCriteria, filteredParticipants, criteriaGroup.items, groupId, judgeId, form]);

    const onSubmit = (values: pointBasedSchemaTest) => {
        const flat: Array<pointBasedSchemaTest['criteria'][string][string]> = [];

        Object.values(values.criteria).forEach((itemsByParticipant) => {
            Object.values(itemsByParticipant).forEach((entry) => {
                flat.push(entry);
            });
        });
        setLoading(true);

        const promise = new Promise((resolve, reject) => {
            router.post(
                `/judging/score/${judgeId}/${contestId}/${groupId}/${currentRounds}`,
                { criteria: flat },
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        form.reset(values);
                        resolve(page); // resolve promise
                        setLoading(false);
                    },
                    onError: (errors) => {
                        reject(errors); // reject promise
                        setLoading(false);
                    },
                },
            );
        });

        toast.promise(promise, {
            loading: 'Submitting score...',
            success: 'Score submitted successfully!',
            error: 'Failed to submit score.',
        });
    };

    const hasMatch = judge?.some((i) => i.judges_id === judgeId && criteriaGroup.criteria.includes(i.criteria) && i.is_finished === 1);

    const [isFormReady, setIsFormReady] = useState(false);

    useEffect(() => {
        if (savedCriteria !== undefined && filteredParticipants.length > 0) {
            setIsFormReady(false);
            const defaults = getDefaultValues();
            form.reset(defaults);
            // Small delay to ensure reset completes
            setTimeout(() => setIsFormReady(true), 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [savedCriteria, filteredParticipants.length, criteriaGroup.items.length]);

    useEffect(() => {
        setPendingSubmitScore(loading);
    }, [loading, setPendingSubmitScore]);

    const handleRequestEdit = (criteria: string) => {
        setLoadingRequest(true);
        const promise = new Promise((resolve, reject) => {
            router.post(
                `/judging/edit-score/${contestId}/${groupId}/${judgeId}`,
                { criteria, approved: 1 },
                {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        setLoadingRequest(false);
                        resolve(page);
                    },
                    onError: (errors) => {
                        setLoadingRequest(false);
                        reject(errors);
                    },
                },
            );
        });

        toast.promise(promise, {
            loading: 'Loading...',
            success: 'Judge requested edit',
            error: 'Judge enabled failed',
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <div className="flex flex-col">
                    <div>
                        <p className="mb-4 rounded-md bg-[#45226b] p-3 text-center text-5xl font-medium text-white uppercase">{group.criteria}</p>
                    </div>

                    <div className="flex flex-wrap gap-6">
                        {(() => {
                            const genderCategory = criteriaGroup.gender_category?.toLowerCase();

                            // 🔹 Case 1: Male only
                            if (genderCategory === 'male') {
                                return <CriteriaCard criteriaGroup={group} gender="Male" form={form} />;
                            }

                            // 🔹 Case 2: Female only
                            if (genderCategory === 'female') {
                                return <CriteriaCard criteriaGroup={group} gender="Female" form={form} />;
                            }

                            // 🔹 Case 3: Male + Female (two cards)
                            if (genderCategory === 'malefemale') {
                                return (
                                    <div className="flex w-full flex-col gap-2 xl:flex-row">
                                        <CriteriaCard criteriaGroup={group} gender="Male" form={form} />
                                        <CriteriaCard criteriaGroup={group} gender="Female" form={form} />
                                    </div>
                                );
                            }

                            // 🔹 Case 4: Mixed (one card with both genders)
                            if (genderCategory === 'mixed') {
                                return <CriteriaCard criteriaGroup={group} gender="Mixed" form={form} />;
                            }

                            // Default: just in case
                            return null;
                        })()}
                    </div>
                </div>

                {group.participants.length <= 0 && !isFormReady ? (
                    <p className="text-center text-2xl font-medium">No participants yet!</p>
                ) : (
                    <div className="mt-4 space-x-2 text-right">
                        {hasMatch && (
                            <Button disabled={!hasMatch || loadingRequest} onClick={() => handleRequestEdit(group.criteria)} type="button">
                                {loadingRequest && <Loader2 strokeWidth={3} className="animate-spin" />}
                                Request Edit Score
                            </Button>
                        )}

                        <Button disabled={hasMatch || loading} type="submit">
                            {loading && <Loader2 strokeWidth={3} className="animate-spin" />}
                            Submit
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
}
