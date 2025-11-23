import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { pointBasedSchemaTest, PointBasedSchemaTest } from '@/schema/criteria';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useContextUser } from '@/context/ContesxtProvider';
import { CriteriaTestsTeam } from '@/pages/judge/CriteriaJudgingTeam';
import { router, usePage } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CriteriaCardTeam } from './CriteriaCardTeam';

export function CriteriaGroupWrapperTeam({ group, criteriaGroup }: { group: CriteriaTestsTeam; criteriaGroup: CriteriaTestsTeam }) {
    //   const { contest_id, group_id } = useParams();
    //   const { user } = useContextUser();
    const { judge, savedCriteria, auth, contestId, groupId } = usePage().props;
    const judgeId = auth?.user.id;

    const filteredParticipants = (criteriaGroup?.participants || []).filter((p) => p.id === p.id);

    const [, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);
    const currentRounds = group.items.find((i) => ['Final', 'Preliminary'].includes(i.round))?.round ?? '';

    // const { criteria: savedCriteria, refetch } = useScoreJudges(group_id ?? '', contest_id ?? '');
    // const { judge, refetch: refetchJudge } = useJudgeCheck(judgeId, group_id ?? '');

    const hasMatch = judge?.some((i) => i.judges_id === judgeId && criteriaGroup.criteria.includes(i.criteria) && i.is_finished === 1);

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
                        s.group_id === (groupId ?? '') &&
                        s.judges_id === judgeId &&
                        s.criteria === item.criteria,
                );

                criteria[participant.id][item.id] = {
                    judges_id: judgeId,
                    round: currentRounds,
                    participant_id: participant.id,
                    participant_type: 'individual',
                    contest_id: Number(contestId),
                    group_id: groupId ?? '',
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
        defaultValues: getDefaultValues(), // build criteria for both genders
    });

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

    const { setPendingSubmitScore } = useContextUser();

    const onSubmit = (values: pointBasedSchemaTest) => {
        const flat: Array<pointBasedSchemaTest['criteria'][string][string]> = [];
        setLoading(true)
        Object.values(values.criteria).forEach((itemsByParticipant) => {
            Object.values(itemsByParticipant).forEach((entry) => {
                flat.push(entry);
            });
        });
        const promise = new Promise((resolve, reject) => {
            router.post(
                `/judging/score/${judgeId}/${contestId}/${groupId}/${currentRounds}`,
                { criteria: flat },
                {
                    onSuccess: (page) => {
                        form.reset(values);
                        resolve(page);
                        setLoading(false);
                    },
                    onError: (errors) => {
                        reject(errors);
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

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
                <div className="flex flex-col">
                    <div>
                        <p className="mb-4 rounded-md bg-zinc-800 p-3 text-center text-5xl font-medium text-white uppercase">{group.criteria}</p>
                    </div>
                    <div className="flex gap-6">
                        <CriteriaCardTeam criteriaGroup={group} form={form} />
                    </div>
                </div>

                {group.participants.length <= 0 && !isFormReady ? (
                    <p className="text-center text-2xl font-medium">No participants yet!</p>
                ) : (
                    <div className="mt-4 text-right">
                        <Button type="submit" disabled={hasMatch || loading}>
                            {loading && <Loader2 strokeWidth={3} className="animate-spin" />}
                            Submit
                        </Button>
                    </div>
                )}
            </form>
        </Form>
    );
}
