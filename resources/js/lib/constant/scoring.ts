import { Contests } from '@/api/contest';

type ScoringField<T, R = string> = {
    label: string;
    value: (item: T) => R;
};

export const SCORING_FIELDS: ScoringField<Contests>[] = [
    {
        label: 'Contest Name',
        value: (item) => item.contest_name,
    },
    {
        label: 'Contest Description',
        value: (item) => item.contest_description,
    },
    {
        label: 'Contest Organizer',
        value: (item) => item.contest_organizer,
    },
    {
        label: 'Contest Venue',
        value: (item) => item.contest_venue,
    },
    {
        label: 'Scoring Type',
        value: (item) => item.contest_scoring_type,
    },
    {
        label: 'Contest Type',
        value: (item) => item.contest_type,
    },
];

type Criteria = {
    evaluationCriterion: string;
    score: number;
};

type Judges = {
    id: number;
};

export type ScoringDataPointBased = {
    criteria: Criteria[];
    judges: Judges[];
};

type RoundCriteria = {
    round: number;
    criterion: Criteria[];
};

type RoundCriterias = {
    criteria: string;
    criterion: Criteria[];
};

type Multiple = {
    criteria: RoundCriteria[];
};

export type ScoringDataMultipleRound = {
    judges: Judges[];
    multiple: Multiple;
};

type TestCriteria = {
    criteria: RoundCriterias[];
};

export type ScoringDataRound = {
    judges?: Judges[];
    criteria: TestCriteria;
};

export type DeleteCriteriaPayload = {
    criteria: {
        criteria: string;
        round: string;
    }[];
};
