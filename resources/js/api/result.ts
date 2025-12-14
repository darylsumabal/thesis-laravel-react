export type TeamParticipant = {
    id: number;
    organizer_id: number;
    contest_id: number;
    team_participant_no: string;
    team_name: string;
    team_description: string;
    team_captain: string;
    poster_url: string;
};

export type Participant = {
    id: number;
    participant_no: string;
    age: string;
    first_name: string;
    description: string;
    last_name: string;
    gender: string;
    poster_url: string;
};

export type OverAllScore = {
    id: string;
    score: string;
    rank: string;
};

type JudgesScore = {
    id: number;
    score: number;
    judge_name: string;
    criteria: string;
    rank: number;
    total: number;
    total_score: number;
    total_rank: number;
    final_rank: number;
};

export type Score = {
    id: string;
    participant: Participant;
    total_scores: { [key: string]: string };
    overall_scores: OverAllScore;
    judges_score: JudgesScore[];
};

export type ScoreTest = {
    id: string;
    criteria: string;
    participant: Participant;
    participant_gender: string;
    judge_name: string;
    total_scores: { [key: string]: string };
    overall_scores: OverAllScore;
    judges_score: JudgesScore[];
};

export type ScoreTeam = {
    id: string;
    participant: TeamParticipant;
    total_scores: { [key: string]: string };
    overall_scores: OverAllScore;
    judges_score: JudgesScore[];
};

type Judges = {
    id: string;
    name: string;
    judge_number: string;
    role: string;
};

export type JudgesGroup = {
    id: string;
    is_finished: number;
    round: number | string;
    contest?: { contest_scoring_type: string; contest_type: string };
    judges: Judges;
    isJudgeFinished: number;
    judge: Judges;
};
type J = JudgesGroup[];

type MultipleJudges = {
    round: number;
    isRoundFinished: boolean;
    judge_group: J;
    isJudgeFinished: boolean;
};

export type S = {
    judge_group: J;
    message: string;
    is_finished: boolean;
    // all_judges_finished: boolean;
};

export type JudgesGroups = {
    // rounds: {
    preliminary: S;
    final: S;
    // };
};

export type M = {
    rounds: MultipleJudges[];
};

export type ActivityLog = {
    action: string;
    changes: {
        before: {
            score: number;
            updated_at: string;
        };
        after: {
            score: number;
            updated_at: string;
        };
    };
    model_data: {
        round: 'Final';
        criteria: string;
        evaluation_criteria: string;
        score: number;
    };
    judge: {
        name: string;
        email: string;
        role: string;
    };
    participant: {
        id: 2;
        contest_id: 1;
        participant_no: string;
        first_name: string;
        last_name: string;
        team_participant_no: string;
        team_name: string;
        gender: string;
    };
    updated_at: string;
};
