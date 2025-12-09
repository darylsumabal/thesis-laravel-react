import axios from 'axios';

export type Account = {
    id: string;
    name: string;
    email: string;
    accountType: string;
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

export const createJudge = async (data: FormData) => {
    return await axios.post('register/judge', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const createAccount = async (data: FormData) => {
    return await axios.post('accounts', data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const fetchAccount = async () => {
    const response = await axios.get('accounts/judge');
    const { data } = response;
    return data;
};

export const deleteAccount = async (id: string) => {
    return await axios.delete(`accounts/${id}`);
};

export const updateAccount = async (data: { password: string; password_confirmation: string }, id: string) => {
    return await axios.put(`accounts/${id}`, data);
};

export const googleLogin = async () => {
    return await axios.get('auth/google');
};
