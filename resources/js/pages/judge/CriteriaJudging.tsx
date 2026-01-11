import { Contests } from '@/api/contest';
import { Participant, Score } from '@/api/result';
import { CriteriaItem } from '@/components/criteria/CriteriaGroupWrapper';
import { CriteriaTabs } from '@/components/criteria/CriteriaTabs';
import { imageSrc } from '@/lib/src';

import { format } from 'date-fns';

export type ScoreTest = {
    id: number;
    organizer_id: number;
    contest_id: number;
    group_id: string;
    created_at: string;
    updated_at: string;
    judges: Score[];
    criteria_test: CriteriaTests[];
    contest: Contests;
};

export type CriteriaTests = {
    criteria: string;
    category: string;
    gender_category: string;
    items: CriteriaItem[];
    participants: Participant[];
};

type CriteriaJudgingProps = {
    data: ScoreTest[];
    loading: boolean;
};

const CriteriaJudging = ({ data }: CriteriaJudgingProps) => {
    return (
        <div className="h-full gap-10">
            <div className="space-y-4">
                {data?.map((contestant) => (
                    <div key={contestant.id} className="flex flex-col gap-2">
                        <div className="flex flex-col items-center justify-center">
                            {contestant.contest.contest_poster ? (
                                <img src={`${imageSrc}/${contestant.contest.contest_poster}`} className="w-44 rounded-md" alt="poster" />
                            ) : (
                                <div className="flex w-44 items-center justify-center rounded-md border-[1px] bg-gray-200 text-black">
                                    No Poster Available
                                </div>
                            )}
                            <div className="flex flex-col items-center justify-center">
                                <p className="text-2xl font-medium">{contestant.contest.contest_name}</p>
                                <div className="flex items-center justify-center gap-2 text-lg">
                                    <p>{format(new Date(contestant.contest.contest_date), 'MMMM d, yyyy')} </p>
                                    <p>|</p>
                                    <p>{contestant.contest.contest_venue}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <CriteriaTabs criteriaGroups={contestant.criteria_test} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CriteriaJudging;
