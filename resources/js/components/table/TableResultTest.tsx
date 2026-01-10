export type JudgeScore = {
    id: number;
    criteria: string;
    rank: string;
    total: string;
    participant_no: string;
    participant_id: number;
    participant_gender: string;
    evaluation_criteria?: string;
    total_score: string;
    gender_category: string;
    score: string;
    scores: [
        {
            id: string;
            judge_name: string;
            participant_no: string;
            participant_gender: string;
            evaluation_criteria: string;
            criteria_over: string;
            score: string;
        },
    ];
    round_score: string;
    total_rank: string;
    final_rank: string;
    judge_name: string;
    judges_score: JudgeScore[];
};

export type MajorAward = {
    criteria: string;
    top_male: {
        participant: {
            participant_no: string;
            team_participant_no: string;
            team_name: string;
            gender: string;
        };
    };
    participant: {
        participant: {
            participant_no: string;
            team_participant_no: string;
            team_name: string;
            gender: string;
        };
    };
    top_female: {
        participant: {
            participant_no: string;
            gender: string;
        };
    };
};

export type GroupedParticipant = {
    participant_no: string;
    total_score: string;
    total_rank: string;
    final_rank: string;
    total: string;
    judges_scores: Record<string, JudgeScore>; // judge_name -> scores
};

import { formatRank, getRankBgClass } from '@/pages/utils/function/rank';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export default function TableResultTest({
    criteriaName,
    gender,
}: {
    criteriaName: string;
    gender: string; // can be "Male", "Female", "Mixed", "MaleFemale"
}) {
    const { result, qualified } = usePage().props;

    const data: JudgeScore[] = result?.flatMap((r) => r.judges_score) ?? [];

    const getUniqueJudges = () => {
        return [...new Set(data.map((item) => item.judge_name))].sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''), 10);
            const numB = parseInt(b.replace(/\D/g, ''), 10);
            return numA - numB;
        });
    };

    const judges = getUniqueJudges();

    // ✅ Adjust filtering for mixed / maleFemale
    const getFilteredData = (criteriaName: string, gender: string) => {
        if (gender.toLowerCase() === 'mixed') {
            // Show all genders
            return data.filter((item) => item.criteria === criteriaName);
        }

        if (gender.toLowerCase() === 'malefemale') {
            // Combine male + female
            return data.filter((item) => item.criteria === criteriaName && ['Male', 'Female'].includes(item.participant_gender));
        }

        // Normal gender filtering
        return data.filter((item) => item.criteria === criteriaName && item.participant_gender?.toLowerCase() === gender.toLowerCase());
    };

    const groupByParticipant = (filteredData: JudgeScore[]): GroupedParticipant[] => {
        const grouped: Record<string, GroupedParticipant> = {};

        filteredData.forEach((item) => {
            if (!grouped[item.participant_no]) {
                grouped[item.participant_no] = {
                    participant_no: item.participant_no,
                    total_score: item.total_score,
                    total_rank: item.total_rank,
                    final_rank: item.final_rank,
                    total: item.total,
                    judges_scores: {},
                };
            }
            grouped[item.participant_no].judges_scores[item.judge_name] = item;
        });

        return Object.values(grouped).sort((a, b) => parseFloat(a.participant_no) - parseFloat(b.participant_no));
    };

    const filteredData = getFilteredData(criteriaName, gender);
    const groupedData = groupByParticipant(filteredData);

    // 🧠 Title mapping
    const getGenderTitle = (gender: string) => {
        switch (gender.toLowerCase()) {
            case 'male':
                return 'Male Candidates';
            case 'female':
                return 'Female Candidates';
            case 'mixed':
                return 'Mixed / Team Candidates';
            case 'malefemale':
                return 'Male & Female Candidates';
            default:
                return `${gender} Candidates`;
        }
    };

    if (groupedData.length === 0) {
        return (
            <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
                <p>
                    {/* No data available for {criteriaName} - {getGenderTitle(gender)} */}
                    No data available
                </p>
            </div>
        );
    }
    const contest = filteredData.map((i) => i.criteria).find((c) => c === criteriaName);

    // const hasTie = groupedData.some((item) => {
    //     const rank = Number.isInteger(item.final_rank);

    //     return !Number.isInteger(rank);
    // });
    const hasTie = groupedData.some((item) => !Number.isInteger(Number(item.final_rank)));
    return (
        <>
            {hasTie &&
                toast.warning(`There is a tie in the rankings ${contest} ${gender}`, {
                    duration: 3000,
                })}
            <div className="mb-12 w-full">
                <div className="mb-6 p-4 text-center">
                    <p className="text-2xl font-bold uppercase">{getGenderTitle(gender)}</p>
                </div>
                <div className="overflow-x-auto rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-center text-xs font-bold tracking-wider uppercase">Contestant No.</TableHead>
                                {judges.map((judge) => (
                                    <TableHead
                                        key={judge}
                                        className="p-2 text-center text-xs font-bold tracking-wider break-words whitespace-normal uppercase"
                                    >
                                        <div>{judge}</div>
                                        <div className="flex justify-between uppercase">
                                            <p>%</p>
                                            <p>Rank</p>
                                        </div>
                                    </TableHead>
                                ))}
                                <TableHead className="text-center text-xs font-bold tracking-wider uppercase">Total %</TableHead>
                                <TableHead className="text-center text-xs font-bold tracking-wider uppercase">Total Rank</TableHead>
                                <TableHead className="text-center text-xs font-bold tracking-wider uppercase">Final Rank</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groupedData.map((participant) => (
                                <TableRow key={participant.participant_no}>
                                    <TableCell className="text-center font-bold whitespace-nowrap">{participant.participant_no}</TableCell>
                                    {judges.map((judge) => {
                                        const judgeScore = participant.judges_scores[judge];
                                        return (
                                            <TableCell key={judge} className="text-center whitespace-nowrap">
                                                {judgeScore ? (
                                                    <div className="flex justify-between">
                                                        <div className="font-bold">{parseInt(judgeScore.total)}%</div>
                                                        <div className="font-bold">{formatRank(judgeScore.rank)}</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400">-</div>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-center font-bold whitespace-nowrap">{participant.total_score}</TableCell>
                                    <TableCell className="text-center font-bold whitespace-nowrap">{participant.total_rank}</TableCell>
                                    <TableCell
                                        className={`text-center font-bold whitespace-nowrap ${getRankBgClass(participant.final_rank, qualified)}`}
                                    >
                                        {formatRank(participant.final_rank)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}
