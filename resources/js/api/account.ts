export type Account = {
    id: string;
    name: string;
    email: string;
    accountType: string;
    role:string,
    judge_number:string
    contest?: {
        contest_name: string;
        contest_scoring_type: string;
        contest_type: string;
    };
    contest_scoring_type?: string;
    contest_id?: string;
    group_id?: string;
    contest_type?: string;
};

export type AccountType = {
    account: Account[];
    flash: {
        success: string;
    };
};
