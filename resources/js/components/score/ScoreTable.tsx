import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRank, getRankBgClass } from '@/pages/utils/function/rank';
import { usePage } from '@inertiajs/react';

export type ParticipantScore = {
    participant_id: number;
    participant_gender: string;
    participant_no: string;
    total: number;
    final_rank: string;
    scores: {
        score: string;
        round_score: string;
        id: string;
        criteria: string;
    }[];
};

export const ScoreTable = ({ data, gender }: { data: ParticipantScore[]; gender: 'Male' | 'Female' }) => {
    const { qualified, percentage } = usePage().props;
    const prelimPercentage = percentage?.find((p: { round: string }) => p.round === 'Preliminary')?.percentage || 0;
    const finalPercentage = percentage?.find((p: { round: string }) => p.round === 'Final')?.percentage || 0;

    return (
        <div className="w-full">
            <h2 className="mb-2 p-4 text-center text-2xl font-bold">{gender} Candidates</h2>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-xs font-bold tracking-wider uppercase">Contestant No.</TableHead>
                            <TableHead className="text-center text-xs font-bold tracking-wider uppercase">
                                <p>Preliminary Round</p>
                                <div className="flex justify-evenly">
                                    <div>%</div>
                                    <div>{prelimPercentage}%</div>
                                </div>
                            </TableHead>
                            <TableHead className="p-2 text-center text-xs font-bold tracking-wider uppercase">
                                <p>Final Round</p>
                                <div className="flex justify-evenly">
                                    <div>%</div>
                                    <div>{finalPercentage}%</div>
                                </div>
                            </TableHead>
                            <TableHead className="text-center text-xs font-bold tracking-wider uppercase">Total %</TableHead>
                            <TableHead className="text-center text-xs font-bold tracking-wider uppercase">Final Rank</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.map((participant) => (
                            <TableRow key={participant.participant_id}>
                                <TableCell className="text-center font-medium whitespace-nowrap">{participant.participant_no}</TableCell>
                                {/* {participant.scores.map((i) => (
                    <TableCell
                      key={i.id}
                      className="whitespace-nowrap font-medium  text-center"
                    >
                      <div className="flex justify-evenly">
                        <div>{i.score}</div>
                        <div>{i.round_score}</div>
                      </div>
                    </TableCell>
                  ))} */}
                                {[...participant.scores]
                                    .sort((a) => (a.criteria === 'Preliminary' ? -1 : 1)) // ✅ Preliminary first
                                    .map((i) => (
                                        <TableCell key={i.id} className="text-center font-medium whitespace-nowrap">
                                            <div className="flex justify-evenly">
                                                <div>{i.score}</div>
                                                <div>{i.round_score}</div>
                                            </div>
                                        </TableCell>
                                    ))}
                                <TableCell className="text-center font-medium whitespace-nowrap">{participant.total}</TableCell>
                                <TableCell
                                    className={`text-center font-medium whitespace-nowrap ${getRankBgClass(participant.final_rank, qualified)}`}
                                >
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

export default ScoreTable;
