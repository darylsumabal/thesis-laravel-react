import { z } from 'zod';

export const addAccountSchema = z
    .object({
        // name: z.string().min(1, {
        //   message: "Please enter a name",
        // }),
        name: z.string().min(1, {
            message: 'Please enter a username',
        }),
        contest_id: z.string(),
        panelRole: z.string().min(1, {
            message: 'Please select a panel',
        }),
        judgeNumber: z.string().optional(),
        email: z.string().email().min(1, {
            message: 'Please enter a valid email address',
        }),
        accountType: z.literal('JUDGE'),
        password: z.string().min(6, {
            message: 'Please must be at least 6 character',
        }),
        password_confirmation: z.string().min(6, {
            message: 'Please must be at least 6 character',
        }),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: 'Password and confirm password does not match',
        path: ['password_confirmation'],
    });

export const editAccountSchema = z.object({
    name: z.string(),
    panelRole: z.string(),
    judgeNumber: z.string(),
});

type EditAccountDefaultValues = {
    password: string;
    password_confirmation: string;
};

export const editAccountDefaultValue: EditAccountDefaultValues = {
    password: '',
    password_confirmation: '',
};

type DefaultValuesAccount = {
    // name: string;
    name: string;
    email: string;
    event: string;
    panelRole: string;
    contest_id: string;
    accountType: string;
    password: string;
    password_confirmation: string;
};

export const defaultValues: DefaultValuesAccount = {
    // name: "JUDGE ",
    name: 'JUDGE ',
    email: '',
    event: '',
    contest_id: '',
    panelRole: '',
    accountType: 'JUDGE',
    password: '',
    password_confirmation: '',
};
