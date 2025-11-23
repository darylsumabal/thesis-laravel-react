import { formatRank, getRankBgClass } from '@/pages/utils/function/rank';
import { usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export type JudgeScoreTeam = {
    id: number;
    criteria: string;
    rank: string;
    total: string;
    team_participant_no: string;
    participant_id: number;
    participant_gender: string;
    evaluation_criteria?: string;
    total_score: string;
    score: string;
    scores: [
        {
            id: string;
            judge_name: string;
            team_participant_no: string;
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
    judges_score: JudgeScoreTeam[];
};

export type MajorAward = {
    criteria: string;
};

export type GroupedParticipant = {
    team_participant_no: string;
    total_score: string;
    total_rank: string;
    final_rank: string;
    total: string;
    judges_scores: Record<string, JudgeScoreTeam>; // judge_name -> scores
};

export default function TableResultTestTeam({ criteriaName }: { criteriaName: string }) {
    // const { contest_id, group_id } = useParams();
    // const { result } = useResultTestTeam(Number(contest_id), group_id ?? '');
    const { result, qualified } = usePage().props;
    const data = result?.flatMap((r) => r.judges_score) ?? [];
    // const { qualified } = useQualified(contest_id ?? '', group_id ?? '');
    const getUniqueJudges = () => {
        return [...new Set(data?.map((item) => item.judge_name))].sort((a, b) => {
            // Extract numbers from judge names if they exist
            const numA = parseInt(a.match(/\d+/)?.[0] || '0');
            const numB = parseInt(b.match(/\d+/)?.[0] || '0');
            return numA - numB;
        });
    };

    // Get unique participants for this criteria
    const getUniqueParticipants = (criteriaName: string) => {
        const participantsSet = new Set(data?.filter((item) => item.criteria === criteriaName)?.map((item) => item.team_participant_no));
        return Array.from(participantsSet).sort((a, b) => parseFloat(a) - parseFloat(b));
    };

    // Create a structured data object for easy lookup
    const createParticipantData = (criteriaName: string) => {
        const filteredData = data?.filter((item) => item.criteria === criteriaName) ?? [];
        const participants = getUniqueParticipants(criteriaName);
        const judges = getUniqueJudges();

        const participantData: Record<
            string,
            {
                team_participant_no: string;
                total_score: string;
                total_rank: string;
                final_rank: string;
                judgeScores: Record<string, JudgeScoreTeam>;
            }
        > = {};

        // Initialize participant data structure
        participants.forEach((participantNo) => {
            participantData[participantNo] = {
                team_participant_no: participantNo,
                total_score: '0',
                total_rank: '0',
                final_rank: '0',
                judgeScores: {},
            };
        });

        // Populate with actual data
        filteredData.forEach((item) => {
            if (participantData[item.team_participant_no]) {
                participantData[item.team_participant_no].judgeScores[item.judge_name] = item;
                // Update totals (assuming all judges have same totals for a participant)
                participantData[item.team_participant_no].total_score = item.total_score;
                participantData[item.team_participant_no].total_rank = item.total_rank;
                participantData[item.team_participant_no].final_rank = item.final_rank;
            }
        });

        return { participantData, participants, judges };
    };

    const { participantData, participants, judges } = createParticipantData(criteriaName);

    if (participants.length === 0) {
        return (
            <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
                <p>No data available for {criteriaName}</p>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <div className="mb-6 p-4 text-center">
                <p className="text-2xl font-medium">Team Candidates</p>
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
                                    <div className="flex justify-around normal-case">
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
                        {participants.map((participantNo, index) => {
                            const participant = participantData[participantNo];

                            return (
                                <TableRow key={index}>
                                    <TableCell className="text-center font-medium whitespace-nowrap">{participantNo}</TableCell>

                                    {/* Loop through ALL judges for this participant */}
                                    {judges.map((judge) => {
                                        const judgeScore = participant.judgeScores[judge];

                                        return (
                                            <TableCell key={`${participantNo}-${judge}`} className="text-center whitespace-nowrap">
                                                {judgeScore ? (
                                                    <div className="flex justify-around">
                                                        <div className="font-medium">{parseInt(judgeScore.total)}%</div>
                                                        <div className="font-medium">{formatRank(judgeScore.rank)}</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400">-</div>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-center font-medium whitespace-nowrap">{participant.total_score || '0'}</TableCell>
                                    <TableCell className="text-center font-medium whitespace-nowrap">{participant.total_rank || '0'}</TableCell>
                                    <TableCell
                                        className={`text-center font-medium whitespace-nowrap ${getRankBgClass(
                                            participant.final_rank || '0',
                                            qualified,
                                        )}`}
                                    >
                                        {formatRank(participant.final_rank || '0')}
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
