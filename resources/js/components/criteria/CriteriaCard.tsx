import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useContextUser } from '@/context/ContesxtProvider';
import { pointBasedSchemaTest } from '@/schema/criteria';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import InputWithEndButton from '../input-button';
import { CriteriaTests } from './CriteriaGroupWrapper';
import { getRankBgClass } from '../../pages/utils/function/rank';

export function CriteriaCard({
    criteriaGroup,
    gender,
    form,
}: {
    criteriaGroup: CriteriaTests;
    gender: string;
    form: UseFormReturn<pointBasedSchemaTest>;
}) {
    const { judge, savedCriteria, auth, groupId, qualified } = usePage().props;
    const judgeId = auth?.user.id;
    // const { qualified } = useQualified(contest_id ?? "", group_id ?? "");
    const [, setIsSubmitted] = useState(false);
    const genderCategory = criteriaGroup.gender_category?.toLowerCase() ?? 'mixed';
    const { pendingSubmitScore } = useContextUser();
    const filteredParticipants = (criteriaGroup.participants || []).filter((p) => {
        if (genderCategory === 'male') return p.gender === 'Male';
        if (genderCategory === 'female') return p.gender === 'Female';
        if (genderCategory === 'malefemale') return p.gender === gender;
        if (genderCategory === 'mixed') return true; // show both
        return true;
    });

    const hasMatch = judge?.some((i) => i.judges_id === judgeId && criteriaGroup.criteria.includes(i.criteria) && i.is_finished === 1);

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
    }, [savedCriteria, filteredParticipants, criteriaGroup.items, groupId, judgeId]);

    if (filteredParticipants.length === 0) return null;

    const getParticipantRank = (participantId: number) => {
        // Get total points for all participants
        const participantTotals = filteredParticipants.map((participant) => {
            const totalPoints = criteriaGroup.items.reduce((acc, item) => {
                const score = form.watch(`criteria.${participant.id}.${item.id}.score`) || 0;
                return acc + score;
            }, 0);

            return {
                id: participant.id,
                totalPoints,
            };
        });

        // Sort descending by total points
        participantTotals.sort((a, b) => b.totalPoints - a.totalPoints);

        // Compute ranks with .5 for ties
        const ranks: Record<number, number> = {};
        let currentRank = 1;

        for (let i = 0; i < participantTotals.length; i++) {
            const sameScoreGroup = participantTotals.filter((p, index) => index >= i && p.totalPoints === participantTotals[i].totalPoints);

            const rankToAssign = sameScoreGroup.length === 1 ? currentRank : currentRank + (sameScoreGroup.length - 1) / 2;

            sameScoreGroup.forEach((p) => {
                ranks[p.id] = rankToAssign;
            });

            currentRank += sameScoreGroup.length;
            i += sameScoreGroup.length - 1; // skip the tied group
        }

        return ranks[participantId] || '-';
    };
    const totalScore = criteriaGroup.items.reduce((sum, item) => sum + Number(item.score || 0), 0);

    return (
        <div className="w-full uppercase">
            <div className="p-2 text-center">
                <p className="text-3xl">{gender} Candidates</p>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader className="border-b">
                        <TableRow>
                            <TableHead className="text-center">
                                <div className="font-extrabold">
                                    <p className="break-words whitespace-normal">Candidate No</p>
                                    <p className="invisible">s</p>
                                </div>
                            </TableHead>
                            {criteriaGroup.items.map((item) => (
                                <TableHead key={item.id} className="py-4 capitalize">
                                    <div className="text-center font-extrabold">
                                        <p className="break-words whitespace-normal uppercase">{item.evaluation_criteria}</p>
                                        <p>{item.score}%</p>
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="text-center">
                                <div className="font-extrabold">
                                    <p className="break-words whitespace-normal">Total Points</p>
                                    <p>{totalScore}%</p>
                                </div>
                            </TableHead>
                            <TableHead className="text-center">
                                <div className="font-extrabold">
                                    <p>Rank</p>
                                    <p className="invisible">s</p>
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="font-bold">
                        {filteredParticipants.map((p) => {
                            const totalPoints = criteriaGroup.items.reduce((acc, item) => {
                                const score = form.watch(`criteria.${p.id}.${item.id}.score`) || 0;
                                return acc + score;
                            }, 0);

                            const rank = totalPoints > 0 ? getParticipantRank(p.id) : '-';

                            const isQualified = typeof rank === 'number' && Math.floor(rank) <= Number(qualified);

                            return (
                                <TableRow key={p.id}>
                                    <TableCell className="text-center">{p.participant_no}</TableCell>
                                    {criteriaGroup.items.map((item) => {
                                        return (
                                            <TableCell key={item.id}>
                                                <FormField
                                                    control={form.control}
                                                    name={`criteria.${p.id}.${item.id}.score`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormControl>
                                                                <InputWithEndButton
                                                                    field={field}
                                                                    item={item}
                                                                    hasMatch={hasMatch}
                                                                    pendingSubmitScore={pendingSubmitScore}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-center">{totalPoints}%</TableCell>
                                    <TableCell
                                        className={`text-center font-bold ${isQualified ? 'rounded bg-[#45226b] text-white' : ''} `}

                                        // className="text-center text-lg font-bold"
                                    >
                                        {rank}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
