export type JudgeScoreTest = {
    id: string;
    criteria: string;
    rank: string;
    score: string;
    total: number;
    participant_no: string;
    participant_id: number;
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


import { useParams } from 'react-router-dom';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Contest } from '@/api/contest';
import { formatRank, getRankBgClass } from '@/pages/utils/function/rank';
import ResultHeader from '../result/ResultHeader';
import { usePage } from '@inertiajs/react';
function TableRankedFinalTeam({ scoringType, contest }: { scoringType: string; contest: Contest }) {
      const { tableRankedFinalTeam, qualified } = usePage().props;

    const data: JudgeScoreTest[] = tableRankedFinalTeam?.flatMap((r) => r.judges_score) ?? [];

    const criteria = [...new Set(data?.map((item) => item.criteria))];
    const genders = [...new Set(data?.map((item) => item.participant_gender))];
    // const getUniqueJudgesTest = () => {
    //   return [...new Set(data?.map((item) => item.judge_name))];
    // };
    const getUniqueJudgesTest = () => {
        return [...new Set(data?.map((item) => item.judge_name))].sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''), 10);
            const numB = parseInt(b.replace(/\D/g, ''), 10);
            return numA - numB;
        });
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
    return (
        <div className="w-full">
            <ResultHeader contest={contest ?? { contest: [], message: '' }} />

            <div className="mt-14 mb-10 text-center text-3xl font-medium">
                <p>CONSOLIDATED RESULT</p>
            </div>
            <div className="flex flex-col">
                <div className="mb-4 flex w-full flex-col items-center justify-center rounded-md bg-[#45226b] p-4 text-center text-3xl font-medium text-white">
                    <p className="uppercase">{data?.[0]?.criteria}</p>
                </div>
                <div className="flex gap-4">
                    {genders.map((gender) => {
                        // Filter once per gender
                        const filteredData = data.filter((item) => item.participant_gender === gender);
                        const groupedData = groupByParticipantTest(filteredData);
                        const judges = getUniqueJudgesTest();

                        if (groupedData.length === 0) {
                            return (
                                <div key={gender} className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
                                    <p>No data available for {gender}</p>
                                </div>
                            );
                        }

                        return (
                            <div className="mb-12 w-full">
                                <div className="mb-2 rounded-lg p-4 text-center">
                                    <h2 className="text-2xl font-medium">Candidates</h2>
                                </div>
                                <div className="w-full overflow-x-auto border rounded-md">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-center text-xs font-medium  uppercase">Contestant No.</TableHead>
                                                {judges.map((judge) => (
                                                    <TableHead
                                                        key={judge}
                                                        className="space-y-2 p-2 text-center text-xs font-medium tracking-wider break-words whitespace-normal  uppercase"
                                                    >
                                                        <div>{judge}</div>
                                                        <div className="flex justify-around uppercase">
                                                            <p>%</p>
                                                            <p>Rank</p>
                                                        </div>
                                                    </TableHead>
                                                ))}

                                                {scoringType == 'rank based' && (
                                                    <>
                                                        <TableHead className="text-center text-xs font-medium break-words whitespace-normal  uppercase">
                                                            Total %
                                                        </TableHead>
                                                        <TableHead className="text-center text-xs font-medium break-words whitespace-normal  uppercase">
                                                            Total Rank
                                                        </TableHead>
                                                    </>
                                                )}

                                                {scoringType == 'point based' && (
                                                    <>
                                                        <TableHead className="text-center text-xs font-medium break-words whitespace-normal  uppercase">
                                                            Total %
                                                        </TableHead>
                                                        <TableHead className="text-center text-xs font-medium break-words whitespace-normal  uppercase">
                                                            Total Rank
                                                        </TableHead>
                                                    </>
                                                )}
                                                <TableHead className="text-center text-xs font-medium break-words whitespace-normal  uppercase">
                                                    Final Rank
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {scoringType == 'rank based' && (
                                                <>
                                                    {groupedData.map((participant) => (
                                                        <TableRow key={participant.participant_no}>
                                                            <TableCell className="text-center font-medium whitespace-nowrap ">
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
                                                                                    <div className="font-medium">
                                                                                        {parseFloat(String(judgeScore.total)).toFixed(2)}
                                                                                    </div>
                                                                                    <div className="font-medium">
                                                                                        {parseFloat(judgeScore.rank).toFixed(2)}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-gray-400">-</div>
                                                                            )}
                                                                        </TableCell>
                                                                    );
                                                                }),
                                                            )}

                                                            <TableCell className="text-center font-medium whitespace-nowrap">
                                                                {participant.total_points}
                                                            </TableCell>
                                                            <TableCell className="text-center font-medium whitespace-nowrap">
                                                                {participant.total_rank}
                                                            </TableCell>
                                                            <TableCell
                                                                className={`text-center font-medium whitespace-nowrap ${getRankBgClass(
                                                                    participant.final_rank,
                                                                    qualified,
                                                                )} `}
                                                            >
                                                                {formatRank(participant.final_rank)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </>
                                            )}

                                            {scoringType == 'point based' && (
                                                <>
                                                    {groupedData.map((participant) => (
                                                        <TableRow key={participant.participant_no}>
                                                            <TableCell className="text-center font-medium whitespace-nowrap ">
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
                                                                                <div className="flex justify-between">
                                                                                    <div className="font-medium">
                                                                                        {parseFloat(String(judgeScore.total)).toFixed(2)}
                                                                                    </div>
                                                                                    <div className="font-medium">
                                                                                        {parseFloat(judgeScore.rank).toFixed(2)}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-gray-400">-</div>
                                                                            )}
                                                                        </TableCell>
                                                                    );
                                                                }),
                                                            )}

                                                            <TableCell className="text-center font-medium whitespace-nowrap">
                                                                {participant.total_score}
                                                            </TableCell>
                                                            <TableCell className="text-center font-medium whitespace-nowrap">
                                                                {participant.total_rank}
                                                            </TableCell>
                                                            <TableCell
                                                                className={`text-center font-medium whitespace-nowrap ${getRankBgClass(
                                                                    participant.final_rank,
                                                                    qualified,
                                                                )} `}
                                                            >
                                                                {formatRank(participant.final_rank)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default TableRankedFinalTeam;
