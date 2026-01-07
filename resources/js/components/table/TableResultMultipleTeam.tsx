import { Contest } from '@/api/contest';
import ResultHeader from '@/components/result/ResultHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRank, getRankBgClass } from '@/pages/utils/function/rank';
import { usePage } from '@inertiajs/react';

export type JudgeScoreTest = {
    id: string;
    criteria: string;
    rank: string;
    score: string;
    total: number;
    participant_no: string;
    participant_id: number;
    team_participant_no: string;
    team_name: string;
    team_description: string;
    team_captain: string;
    participant_gender: string;
    total_score: string;
    total_rank: string;
    final_rank: string;
    judge_name: string;
    total_points: string;
    round_score: string;
    judges_score: JudgeScoreTest[];
};

type GroupedParticipant = {
    participant_no: string;
    total_score: string;
    total_rank: string;
    final_rank: string;
    score: string;
    total: number;
    total_points: string;
    judges_scores: Record<
        string, // criteriaName
        Record<string, JudgeScoreTest> // judgeName -> JudgeScoreTest
    >;
};

function TableResultTypeTeamMultiple({ scoringType, contest }: { scoringType: string; contest: Contest }) {
    const { tableResultTypeMultiple, qualified, prelimScoringType, preliminaryScore } = usePage().props;

    const flattened: JudgeScoreTest[] = tableResultTypeMultiple?.flatMap((r) => r.judges_score) ?? [];

    const data: JudgeScoreTest[] = Array.from(new Map(flattened.map((item) => [`${item.criteria}-${item.participant_no}`, item])).values());

    const criteria = [...new Set(data?.map((item) => item.criteria))];
    const genders = [...new Set(data?.map((item) => item.participant_gender))];
    const getUniqueJudgesTest = () => {
        return [...new Set(data?.map((item) => item.judge_name))];
    };

    // Filter data by criteria and gender

    const groupByParticipantTest = (filteredData: JudgeScoreTest[]): GroupedParticipant[] => {
        const grouped: Record<string, GroupedParticipant> = {};

        filteredData.forEach((item) => {
            if (!grouped[item.participant_no]) {
                grouped[item.participant_no] = {
                    participant_no: item.participant_no,
                    total_score: item.total_score,
                    total_rank: item.total_rank,
                    score: item.score,
                    final_rank: item.final_rank,
                    total_points: item.total_points,
                    total: item.total,
                    judges_scores: {}, // now nested
                };
            }

            if (!grouped[item.participant_no].judges_scores[item.criteria]) {
                grouped[item.participant_no].judges_scores[item.criteria] = {};
            }

            grouped[item.participant_no].judges_scores[item.criteria][item.judge_name] = item;
        });

        return Object.values(grouped).sort((a, b) => parseFloat(a.participant_no) - parseFloat(b.participant_no));
    };
    const criteriaWeightsMap: Record<string, number> = {};
    preliminaryScore.forEach((item) => {
        criteriaWeightsMap[item.contest_name.trim()] = Number(item.weight); // convert string to number
    });

    return (
        <div className="flex flex-col">
            <ResultHeader contest={contest ?? { contest: [], message: '' }} />
            <div className="mt-14 mb-10 text-center text-3xl font-bold">
                <p>CONSOLIDATED RESULT</p>
            </div>

            <div className="mb-4 flex w-full flex-col items-center justify-center rounded-md bg-[#45226b] p-4 text-center text-3xl font-bold text-white">
                <p className="">Top {qualified} Finalists</p>
                <p className="text-base font-normal uppercase">({scoringType})</p>
                <p className="text-base font-normal uppercase">({prelimScoringType} ROUND)</p>
            </div>
            <div className="flex gap-4">
                {genders.map((gender, index) => {
                    // Filter once per gender

                    const filteredData = data.filter((item) => item.participant_gender === gender);
                    const groupedData = groupByParticipantTest(filteredData);
                    const judges = getUniqueJudgesTest();

                    if (groupedData.length === 0) {
                        return (
                            <div key={index} className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
                                <p>No data available</p>
                            </div>
                        );
                    }

                    return (
                        <div key={index} className="mb-12 w-full">
                            <div className="mb-6 rounded-lg p-4 text-center">
                                <h2 className="text-2xl font-bold"> Candidates</h2>
                            </div>
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-center text-xs font-bold uppercase">Contestant No.</TableHead>

                                            {criteria.map((crit) =>
                                                judges.map((judge) => {
                                                    const weight = criteriaWeightsMap[crit.trim()] ?? 0;

                                                    return (
                                                        <TableHead
                                                            key={`${crit}-${judge}`}
                                                            className="space-y-2 p-2 text-center text-xs font-bold uppercase"
                                                        >
                                                            {prelimScoringType === 'weighted' && <p>{weight}%</p>}
                                                            <div className="break-words whitespace-normal">{crit}</div>
                                                            <div className="flex justify-around uppercase">
                                                                {scoringType == 'Point Based Multiple Round' && (
                                                                    <>
                                                                        <p>Total Points</p>
                                                                        <p>Final Rank</p>
                                                                    </>
                                                                )}

                                                                {scoringType == 'Rank Based Multiple Round' && (
                                                                    <>
                                                                        {/* <p>Total Points</p> */}
                                                                        <p>Total Rank</p>
                                                                        <p>Final Rank</p>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableHead>
                                                    );
                                                }),
                                            )}
                                            {scoringType == 'Point Based Multiple Round' && (
                                                <>
                                                    <TableHead className="text-center text-xs font-bold uppercase">Total %</TableHead>
                                                    <TableHead className="text-center text-xs font-bold break-words whitespace-normal uppercase">
                                                        Total Rank
                                                    </TableHead>
                                                </>
                                            )}
                                            {scoringType == 'Rank Based Multiple Round' && (
                                                <>
                                                    {prelimScoringType == 'weighted' ? (
                                                        <TableHead className="text-center text-xs font-bold uppercase">Total Rank</TableHead>
                                                    ) : (
                                                        <TableHead className="text-center text-xs font-bold uppercase">Total Points</TableHead>
                                                    )}
                                                    <TableHead className="text-center text-xs font-bold break-words whitespace-normal uppercase">
                                                        Total %
                                                    </TableHead>
                                                </>
                                            )}
                                            <TableHead className="text-center text-xs font-bold break-words whitespace-normal uppercase">
                                                Final Rank
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groupedData.map((participant) => (
                                            <TableRow key={participant.participant_no}>
                                                <TableCell className="text-center font-bold whitespace-nowrap">
                                                    {participant.participant_no}
                                                </TableCell>

                                                {criteria.map((crit) =>
                                                    judges.map((judge) => {
                                                        const judgeScore = participant.judges_scores[crit]?.[judge];
                                                        return (
                                                            <TableCell
                                                                key={`${participant.participant_no}-${crit}-${judge}`}
                                                                className="text-center whitespace-nowrap"
                                                            >
                                                                {judgeScore ? (
                                                                    <div className="flex justify-around">
                                                                        {scoringType == 'Point Based Multiple Round' ? (
                                                                            <>
                                                                                {prelimScoringType == 'weighted' ? (
                                                                                    <>
                                                                                        <div className="font-bold">{judgeScore.total_points}%</div>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="font-bold">{judgeScore.score}%</div>
                                                                                    </>
                                                                                )}

                                                                                <div className="font-bold">{formatRank(judgeScore.rank)}</div>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                {/* <div className="font-bold">
                                                                                    {parseFloat(judgeScore.score).toFixed(2)}
                                                                                </div> */}
                                                                                {prelimScoringType == 'weighted' ? (
                                                                                    <>
                                                                                        <div className="font-bold">
                                                                                            {parseFloat(judgeScore.rank).toFixed(2)}
                                                                                        </div>
                                                                                        <div className="font-bold">{judgeScore.total_rank}</div>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <div className="font-bold">{judgeScore.total_rank}</div>
                                                                                        <div className="font-bold">
                                                                                            {parseFloat(judgeScore.rank).toFixed(2)}
                                                                                        </div>
                                                                                    </>
                                                                                )}

                                                                                {/* </>
                                                                    )} */}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-gray-400">-</div>
                                                                )}
                                                            </TableCell>
                                                        );
                                                    }),
                                                )}

                                                {scoringType == 'Point Based Multiple Round' ? (
                                                    <>
                                                        <TableCell className="text-center font-bold">{participant.total}</TableCell>
                                                        <TableCell className="text-center font-bold">{participant.total_rank}</TableCell>
                                                    </>
                                                ) : (
                                                    <>
                                                        <TableCell className="text-center font-bold">{participant.total_points}</TableCell>
                                                        <TableCell className="text-center font-bold">{participant.total}</TableCell>
                                                    </>
                                                )}
                                                <TableCell className={`text-center font-bold ${getRankBgClass(participant.final_rank, qualified)}`}>
                                                    {formatRank(participant.final_rank)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default TableResultTypeTeamMultiple;
