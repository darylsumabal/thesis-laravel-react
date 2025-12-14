import { ComboboxField } from '@/components/ActionForm';
import { Field } from '@/components/CardWrap';

export const ADD_ACCOUNT: Field[] = [
    // {
    //   label: "NAME",
    //   inputType: "text",
    // },
    {
        label: 'NAME',
        inputType: 'text',
    },
    {
        label: 'EMAIL',
        inputType: 'email',
    },
    // {
    //   label: "ACCOUNT TYPE",
    //   inputType: "text",
    // },
    {
        label: 'PANEL',
        inputType: 'combobox',
    },
    {
        label: 'JUDGE NUMBER',
        inputType: 'number',
    },
    {
        label: 'EVENT',
        inputType: 'combobox',
    },
    {
        label: 'PASSWORD',
        inputType: 'password',
    },
    {
        label: 'PASSWORD CONFIRMATION',
        inputType: 'password',
    },
];

export const COMBOBOX_INPUT_PANEL: ComboboxField[] = [
    {
        label: 'Panel',
        data: [
            {
                label: 'SELECT',
                value: '',
            },
            {
                label: 'Judge',
                value: 'Judge',
            },
            {
                label: 'Chairman',
                value: 'Chairman',
            },
        ],
    },
];

export const EDIT_ACCOUNT: Field[] = [
    {
        label: 'PASSWORD',
        inputType: 'password',
    },
    {
        label: 'PASSWORD CONFIRMATION',
        inputType: 'password',
    },
];

export const FIELD_EDIT_ACCOUNT = {
    PASSWORD: 'password',
    'PASSWORD CONFIRMATION': 'password_confirmation',
} as const;

export const FIELD_NAME_ADD_ACCOUNT = {
    // NAME: "name",
    NAME: 'name',
    EMAIL: 'email',
    // "ACCOUNT TYPE": "accountType",
    'JUDGE NUMBER': 'judgeNumber',
    EVENT: 'event',
    PANEL: 'panelRole',
    PASSWORD: 'password',
    'PASSWORD CONFIRMATION': 'password_confirmation',
} as const;

export const COMBOBOX_INPUT_ACCOUNT_TYPE: ComboboxField[] = [
    {
        label: 'ACCOUNT TYPE',
        data: [
            {
                label: 'SELECT',
                value: '',
            },
            {
                label: 'JUDGE',
                value: 'JUDGE',
            },
        ],
    },
];
