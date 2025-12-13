import { Contests } from './contest';

export interface C {
    id: string; // change to optional and number type beta test
    score?: number;
    group_id: string;
    evaluation_criteria: string;
    contest?: { contest_scoring_type: string; contest_type: string }; //beta test
    contest_id: string;
}

export interface Criterion extends C {
    round?: number;
}

type Criteria = {
    id: number;
    evaluation_criteria: string;
    score: number;
    round: string;
};

export type MultipleCriterion = {
    round: string;
    id: number;
    evaluation_criteria: string;
    score: string;
    criteria: Criteria[];
    category?: string;
    criterion?: {
        id: number;
        evaluationCriterion: string;
        score: string | number;
    }[];
};

type Judges = {
    id: number;
    group_id: string;
    judge_id: number;
    contest_id: number;
};

export interface CriteriaInfos {
    id: string;
    contest_id: string;
    group_id: string;
    judges: Judges[];
    contest: Contests;
    scoring_method: string;
    gender_category: string;
}

export type CriteriaInfo = {
    criteria_list: CriteriaInfos[];
    message: string;
};

interface Score extends C {
    judges_id: number | null;
    round?: number;
}

export type MultipleScore = {
    criteria: Score[];
};

export type JudgingScore = {
    criteria: Score[];
};

export interface PointBasedCriteria extends CriteriaInfo {
    criteria: Criterion[];
}

export interface RankBasedCriteria extends CriteriaInfo {
    criteria: Criterion[];
}

export interface MultipleRoundCriteria extends CriteriaInfo {
    criteria_test: MultipleCriterion[];
}

export type JudgesCheck = {
    is_finished: boolean;
    message: string;
};
