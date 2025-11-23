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

type PROPS = {
    scoringType: 'Point Based Multiple Round' | 'Rank Based Multiple Round';
    contest: Contest;
    genderCategory: string[];
};

function TableResultTypeMultiple({ scoringType, contest, genderCategory }: PROPS) {
    const { tableResultTypeMultiple, qualified } = usePage().props;

    const flattened: JudgeScoreTest[] = tableResultTypeMultiple?.flatMap((r) => r.judges_score) ?? [];

    const data: JudgeScoreTest[] = Array.from(
        new Map(flattened.map((item) => [`${item.criteria}-${item.participant_id}-${item.participant_gender}`, item])).values(),
    );
    const criteria = [...new Set(data?.map((item) => item.criteria))];

    const getUniqueJudges = () => [...new Set(data?.map((item) => item.judge_name))];

    // 🧠 Group by participant number
    const groupByParticipant = (filteredData: JudgeScoreTest[]): GroupedParticipant[] => {
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
                    judges_scores: {},
                };
            }

            if (!grouped[item.participant_no].judges_scores[item.criteria]) {
                grouped[item.participant_no].judges_scores[item.criteria] = {};
            }

            grouped[item.participant_no].judges_scores[item.criteria][item.judge_name] = item;
        });

        return Object.values(grouped).sort((a, b) => parseFloat(a.participant_no) - parseFloat(b.participant_no));
    };

    // 🧩 Handle gender rendering logic
    const renderTables = () => {
        const lower = genderCategory[0]?.toLowerCase();

        // 🟣 Case 1: MaleFemale → 2 tables (Male, Female)
        if (lower === 'malefemale') {
            return (
                <div className="flex flex-col gap-8 xl:flex-row">{['Male', 'Female'].map((gender) => renderSingleTable(gender, data, criteria))}</div>
            );
        }

        // 🟢 Case 2: Mixed → combine Male + Female into one table
        if (lower === 'mixed') {
            const combined = data.filter((item) => item.participant_gender === 'Male' || item.participant_gender === 'Female');
            return <>{renderSingleTable('Mixed', combined, criteria)}</>;
        }

        // 🔵 Case 3: Male-only or Female-only
        const gender = lower === 'male' || lower === 'female' ? lower.charAt(0).toUpperCase() + lower.slice(1) : 'Mixed';

        return <>{renderSingleTable(gender, data, criteria)}</>;
    };
    // 🧱 Table UI per gender
    const renderSingleTable = (gender: string, sourceData: JudgeScoreTest[], criteria: string[]) => {
        const filtered = sourceData.filter((item) => gender === 'Mixed' || item.participant_gender === gender);

        const groupedData = groupByParticipant(filtered);
        const judges = getUniqueJudges();

        if (groupedData.length === 0) {
            return (
                <div key={gender} className="p-8 text-center">
                    <p>No data available for {gender}</p>
                </div>
            );
        }

        return (
            <div key={gender} className="mb-12 w-full">
                <div className="mb-6 rounded-lg p-4 text-center">
                    <h2 className="text-2xl font-medium uppercase">{gender} Candidates</h2>
                </div>
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center text-xs font-medium uppercase">Contestant No.</TableHead>

                                {criteria.map((crit) =>
                                    judges.map((judge) => (
                                        <TableHead key={`${crit}-${judge}`} className="p-2 text-center text-xs font-medium uppercase">
                                            <div className="break-words whitespace-normal">{crit}</div>
                                            <div className="flex justify-around uppercase">
                                                {scoringType == 'Point Based Multiple Round' && (
                                                    <>
                                                        <p>%</p>
                                                        <p>Rank</p>
                                                    </>
                                                )}
                                                {scoringType == 'Rank Based Multiple Round' && (
                                                    <>
                                                        <p>Total Points</p>
                                                        <p>Total Rank</p>
                                                        <p>Final Rank</p>
                                                    </>
                                                )}
                                            </div>
                                        </TableHead>
                                    )),
                                )}

                                {scoringType == 'Point Based Multiple Round' && (
                                    <>
                                        <TableHead className="text-center text-xs font-medium uppercase">Total %</TableHead>
                                        <TableHead className="text-center text-xs font-medium uppercase">Total Rank</TableHead>
                                    </>
                                )}
                                {scoringType == 'Rank Based Multiple Round' && (
                                    <>
                                        <TableHead className="text-center text-xs font-medium uppercase">Total Points</TableHead>
                                        <TableHead className="text-center text-xs font-medium uppercase">Total %</TableHead>
                                    </>
                                )}
                                <TableHead className="text-center text-xs font-medium uppercase">Final Rank</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {groupedData.map((participant) => (
                                <TableRow key={participant.participant_no}>
                                    <TableCell className="text-center font-medium whitespace-nowrap">{participant.participant_no}</TableCell>

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
                                                                    <div className="font-medium">{judgeScore.score}%</div>
                                                                    <div className="font-medium">{formatRank(judgeScore.rank)}</div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <div className="font-medium">{parseFloat(judgeScore.score).toFixed(2)}</div>
                                                                    <div className="font-medium">{judgeScore.total_rank}</div>
                                                                    <div className="font-medium">{parseFloat(judgeScore.rank).toFixed(2)}</div>
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
                                            <TableCell className="text-center font-medium">{participant.total}</TableCell>
                                            <TableCell className="text-center font-medium">{participant.total_rank}</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell className="text-center font-medium">{participant.total_points}</TableCell>
                                            <TableCell className="text-center font-medium">{participant.total}</TableCell>
                                        </>
                                    )}
                                    <TableCell className={`text-center font-medium ${getRankBgClass(participant.final_rank, qualified)}`}>
                                        {formatRank(participant.final_rank)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        );
    };

    // 🧩 Final Render
    return (
        <div className="flex flex-col">
            <ResultHeader contest={contest ?? { contest: [], message: '' }} />
            <div className="mt-14 mb-10 text-center text-3xl font-medium">
                <p>CONSOLIDATED RESULT</p>
            </div>
            <div className="mb-4 flex w-full flex-col items-center justify-center rounded-md bg-[#45226b] p-4 text-center text-3xl font-medium text-white">
                <p className="uppercase">Top {qualified} Finalists</p>
                <p className="text-base font-normal uppercase">({scoringType})</p>
            </div>
            {renderTables()}
        </div>
    );
}

export default TableResultTypeMultiple;
