import { Field } from '@/components/CardWrap';

export const FIELD_RESET_PASSWORD: Field[] = [
    {
        label: 'VERIFICATION CODE',
        inputType: 'text',
    },
    {
        label: 'EMAIL',
        inputType: 'email',
    },
    {
        label: 'PASSWORD',
        inputType: 'password',
    },
    {
        label: 'CONFIRM PASSWORD',
        inputType: 'password',
    },
];

export const FIELD_NAME_RESET_PASSWORD = {
    EMAIL: 'email',
    'VERIFICATION CODE': 'token',
    PASSWORD: 'password',
    'CONFIRM PASSWORD': 'password_confirmation',
} as const;
