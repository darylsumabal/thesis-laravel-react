import { formatRank, getRankBgClass } from '@/pages/utils/function/rank';
import { usePage } from '@inertiajs/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { JudgeScoreTest } from './TableResultType';

export type JudgeScoreTypeTeam = {
    id: number;
    criteria: string;
    rank: string;
    total: string;
    participant_no: string;
    participant_id: number;
    participant_gender: string;
    evaluation_criteria?: string;
    total_score: string;
    score: string;
    round_score: string;
    total_rank: string;
    total_points: string;
    final_rank: string;
    judge_name: string;
    judges_score: JudgeScoreTypeTeam[];
};

export default function TableResultTypeTeam({ criteriaName, routeCardSr }: { criteriaName: string; routeCardSr: boolean }) {
    const { tableResultTypeMultiple, qualified } = usePage().props;

    const data = tableResultTypeMultiple?.flatMap((r) => r.judges_score) ?? [];

    const filteredData = data.filter((item) => item.criteria === criteriaName);
    console.log(tableResultTypeMultiple);
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
                rank: string;
                total: number;
                total_points: string;
                score: string;
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
                rank: '0',
                score: '0',
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
                participantData[item.participant_no].rank = item.rank;
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
                                        {routeCardSr ? participant.total_points || '0' : participant.total_rank || '0'}
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
