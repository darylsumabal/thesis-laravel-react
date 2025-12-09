import { formatRank, getRankBgClass } from '@/pages/utils/function/rank';
import { usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

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

export default function TableResultType({ criteriaName, gender, routeCardSr }: { criteriaName: string; gender: string; routeCardSr: boolean }) {
    const { result, qualified } = usePage().props;
    const data = result?.flatMap((r) => r.judges_score) ?? [];
    // const filteredData = data.filter((item) => item.criteria === criteriaName);
    const filteredData = data.filter((item) => item.criteria === criteriaName && item.participant_gender.toLowerCase() === gender.toLowerCase());

    const getUniqueJudges = () => [...new Set(data?.map((item) => item.judge_name))];

    const getUniqueParticipants = () => {
        const participantsSet = new Set(filteredData.map((item) => item.participant_no));
        return Array.from(participantsSet).sort((a, b) => parseFloat(a) - parseFloat(b));
    };

    const createParticipantData = () => {
        const participants = getUniqueParticipants();
        const judges = getUniqueJudges();

        const participantData: Record<
            string,
            {
                participant_no: string;
                total_score: string;
                total_rank: string;
                final_rank: string;
                total: number;
                score: string;
                total_points: string;
                judgeScores: Record<string, JudgeScoreTest>;
            }
        > = {};

        // Initialize structure
        participants.forEach((participantNo) => {
            participantData[participantNo] = {
                participant_no: participantNo,
                total_score: '0',
                total_rank: '0',
                final_rank: '0',
                total: 0,
                score: '',
                total_points: '0',
                judgeScores: {},
            };
        });

        // Populate scores
        filteredData.forEach((item) => {
            if (participantData[item.participant_no]) {
                participantData[item.participant_no].judgeScores[item.judge_name] = item;

                participantData[item.participant_no].total_score = item.total_score;
                participantData[item.participant_no].total_rank = item.total_rank;
                participantData[item.participant_no].final_rank = item.final_rank;
                participantData[item.participant_no].total = item.total;
                participantData[item.participant_no].score = item.score;
                participantData[item.participant_no].total_points = item.total_points;
            }
        });

        return { participantData, participants, judges };
    };

    const { participantData, participants, judges } = createParticipantData();

    if (participants.length === 0) {
        return (
            <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
                <p>No data available</p>
            </div>
        );
    }

    return (
        <div className="mb-12">
            <div className="mb-6 p-4 text-center">
                <p className="text-2xl font-medium capitalize">{gender} Candidates</p>
            </div>
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-xs font-bold tracking-wider uppercase">Contestant No.</TableHead>

                            {judges.map((judge) => (
                                <TableHead className="p-2 text-center text-xs font-medium uppercase">
                                    <div>{judge}</div>
                                    <div className="flex justify-around font-bold uppercase">
                                        {routeCardSr ? <p>Total Points</p> : <p>Total Rank</p>}
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="text-center text-xs font-bold tracking-wider uppercase">
                                {routeCardSr ? <>Total Points</> : <>Total Rank</>}
                            </TableHead>
                            <TableHead className="text-center text-xs font-bold tracking-wider uppercase">Final Rank</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {participants.map((participantNo, index) => {
                            const participant = participantData[participantNo];
                     
                            return (
                                <TableRow key={index}>
                                    <TableCell className="text-center font-medium whitespace-nowrap">{participantNo}</TableCell>

                                    {judges.map((judge) => {
                                        const judgeScore = participant.judgeScores[judge];

                                        return (
                                            <TableCell key={`${participantNo}-${judge}`} className="whitespace-nowrap">
                                                {judgeScore ? (
                                                    <div className="flex justify-around">
                                                        <div className="font-medium">
                                                            {routeCardSr ? formatRank(String(judgeScore.total)) : formatRank(judgeScore.rank)}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400">-</div>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                    <TableCell className="text-center font-medium whitespace-nowrap">
                                        {routeCardSr ? participant.total_score || '0' : participant.total_rank || '0'}
                                    </TableCell>
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
