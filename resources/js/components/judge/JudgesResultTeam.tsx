import { getRankBgClass } from '@/pages/utils/function/rank';
import { usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { PROPS } from './JudgesResult';

export type JudgeScore = {
    id: string;
    judge_name: string;
    participant_no: string;
    participant_gender: string;
    evaluation_criteria: string;
    criteria_over: string;
    score: string;
    participant_id?: number;
    criteria?: string;
    rank?: number;
    total?: number;
};

const JudgesResultTeam = ({ judgeId, judgeName, judgeRole }: { judgeId: string; judgeName: string; judgeRole: string }) => {
    const { qualified, judgeData, auth } = usePage<PROPS>().props;
    console.log(judgeData);
    // const filteredJudgeData = judgeData.filter((item) => item.judgeId === judgeId);
    const filteredJudgeData = judgeData.map((item) => {
        return {
            criteria: item.criteria,
            scores: item.scores.filter((score) => score.judgeId === judgeId),
        };
    });
    console.log(filteredJudgeData);
    const computeTotalsAndRanks = (byParticipant: Record<string, JudgeScore[]>) => {
        const totals = Object.entries(byParticipant).map(([participantNo, scores]) => {
            const total = scores.reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0);
            return { participantNo, scores, total };
        });

        // Sort by total (desc)
        const sortedByTotal = [...totals].sort((a, b) => b.total - a.total);

        // Assign average ranks
        const ranked: {
            participantNo: string;
            scores: JudgeScore[];
            total: number;
            rank: number;
        }[] = [];
        let i = 0;
        while (i < sortedByTotal.length) {
            const currentTotal = sortedByTotal[i].total;
            let j = i;
            while (j < sortedByTotal.length && sortedByTotal[j].total === currentTotal) {
                j++;
            }
            const rank = (i + 1 + j) / 2;
            for (let k = i; k < j; k++) {
                ranked.push({ ...sortedByTotal[k], rank });
            }
            i = j;
        }

        // Return sorted by contestant number (ascending)
        return ranked.sort((a, b) => parseInt(a.participantNo) - parseInt(b.participantNo));
    };

    return (
        <div>
            {filteredJudgeData && filteredJudgeData?.length > 0 ? (
                filteredJudgeData?.map((criteriaItem) => {
                    // ✅ Group scores by participant (team)
                    const groupByParticipant = (scores: JudgeScore[]): Record<string, JudgeScore[]> => {
                        return scores.reduce(
                            (acc, score) => {
                                if (!acc[score.participant_no]) acc[score.participant_no] = [];
                                acc[score.participant_no].push(score);
                                return acc;
                            },
                            {} as Record<string, JudgeScore[]>,
                        );
                    };

                    const byParticipant = groupByParticipant(criteriaItem.scores);

                    // ✅ Compute totals + ranks
                    const rankedTeams = computeTotalsAndRanks(byParticipant);

                    // ✅ Unique criteria
                    const criteriaList = [...new Set(criteriaItem.scores.map((s) => s.evaluation_criteria))];

                    return (
                        <div key={criteriaItem.criteria} className="mx-auto mb-12">
                            <h2 className="mb-4 rounded-md bg-[#45226b] p-2 text-center text-3xl font-medium text-white uppercase">
                                {criteriaItem.criteria}
                            </h2>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-center text-xs font-medium tracking-wider uppercase">Team No.</TableHead>
                                        {criteriaList.map((criteria) => {
                                            const scoreObj = criteriaItem.scores.find((s) => s.evaluation_criteria === criteria);
                                            const criteriaOver = scoreObj?.criteria_over ?? '-';
                                            return (
                                                <TableHead key={criteria} className="p-2 text-center text-xs font-medium tracking-wider uppercase">
                                                    <div className="flex flex-col gap-2">
                                                        <p className="break-words whitespace-normal">{criteria}</p>
                                                        <p>{criteriaOver}%</p>
                                                    </div>
                                                </TableHead>
                                            );
                                        })}
                                        <TableHead className="text-center text-xs font-medium tracking-wider uppercase">
                                            <div className="flex flex-col gap-2">
                                                <p>Total Points</p>
                                                <p>
                                                    {criteriaList.reduce((sum, criteria) => {
                                                        const scoreObj = criteriaItem.scores.find((s) => s.evaluation_criteria === criteria);
                                                        const criteriaOver = parseFloat(scoreObj?.criteria_over ?? '0');
                                                        return sum + (isNaN(criteriaOver) ? 0 : criteriaOver);
                                                    }, 0)}
                                                    %
                                                </p>
                                            </div>
                                        </TableHead>

                                        <TableHead className="text-center text-xs font-medium tracking-wider uppercase">Rank</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rankedTeams.map(({ participantNo, scores, total, rank }) => (
                                        <TableRow key={participantNo}>
                                            <TableCell className="text-center font-medium">{participantNo}</TableCell>
                                            {criteriaList.map((criteria) => {
                                                const score = scores.find((s) => s.evaluation_criteria === criteria);
                                                return (
                                                    <TableCell key={`${participantNo}-${criteria}`} className="text-center font-medium">
                                                        {score ? score.score : '-'}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-center font-medium">{total}</TableCell>
                                            <TableCell
                                                className={`text-center font-medium whitespace-nowrap ${getRankBgClass(String(rank), qualified)}`}
                                            >
                                                {rank}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    );
                })
            ) : (
                <p className="h-96 text-center text-2xl font-medium">No Result Yet!</p>
            )}
            <div>
                <div className="mt-10 flex flex-wrap justify-center gap-10">
                    <div className="w-72 text-center">
                        <div className='uppercase'>{judgeName}</div>
                        <hr className="h-[2px] bg-slate-950" />
                        <div className="text-xs">{judgeRole}</div>
                    </div>
                </div>

                <div className="mt-10 flex flex-wrap justify-center gap-10">
                    <div className="w-72 text-center">
                        <div className='uppercase'>{auth.user.name}</div>
                        <hr className="h-[2px] bg-slate-950" />
                        <div className="text-xs">Tabulator</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JudgesResultTeam;
