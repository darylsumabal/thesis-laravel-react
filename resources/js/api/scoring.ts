import { Contests } from './contest';

export type Scoring = {
    contest: Contests[];
    message: string;
};

export type JudgesData = {
    id: string;
    name: string;
    judge_number: string;
    role: string;
    contest: {
        contest_name: string;
    };
};
