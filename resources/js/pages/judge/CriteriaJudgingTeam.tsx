import { Contests } from '@/api/contest';
import { Score, TeamParticipant } from '@/api/result';
import { CriteriaItem } from '@/components/criteria/CriteriaGroupWrapper';
import { CriteriaTabsTeam } from '@/components/criteria/CriteriaTabsTeam';
import { imageSrc } from '@/lib/src';
import { format } from 'date-fns';

export type ScoreTestTeam = {
    id: number;
    organizer_id: number;
    contest_id: number;
    group_id: string;
    created_at: string;
    updated_at: string;
    judges: Score[];
    criteria_test: CriteriaTestsTeam[];
    contest: Contests;
};

export type CriteriaTestsTeam = {
    criteria: string;

    category: string;
    items: CriteriaItem[];
    participants: TeamParticipant[];
};
type CriteriaJudgingProps = {
    data: ScoreTestTeam[];
    loading: boolean;
};

const CriteriaJudgingTeam = ({ data }: CriteriaJudgingProps) => {
    return (
        <div className="h-full gap-10">
            <div className="space-y-4">
                {data?.map((contestant) => (
                    <div key={contestant.id} className="flex flex-col gap-2">
                        <div className="flex flex-col items-center justify-center">
                            {contestant.contest.contest_poster ? (
                                <img src={`${imageSrc}/${contestant.contest.contest_poster}`} className="w-44 rounded-md" alt="poster" />
                            ) : (
                                <img
                                    src={`${imageSrc}/${contestant.contest.contest_poster}`}
                                    className="w-44 rounded-md bg-gray-200 text-black"
                                    alt="image"
                                />
                            )}
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-2xl font-medium">{contestant.contest.contest_name}</p>
                                <div className="flex items-center justify-center gap-2 text-lg">
                                    <p>{format(new Date(contestant.contest.contest_date), 'MMMM d, yyyy')} </p>
                                    <p>|</p>
                                    <p>{contestant.contest.event.venue}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <CriteriaTabsTeam criteriaGroups={contestant.criteria_test} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CriteriaJudgingTeam;
