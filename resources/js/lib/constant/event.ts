import { Event } from '@/api/event';
import { ComboboxField } from '@/components/ActionForm';
import { Field } from '@/components/CardWrap';

type EventFields<T, R = string> = {
    label: string;
    value: (item: T) => R;
};

export const EVENTS_FIELDS: EventFields<Event>[] = [
    {
        label: 'Event Name/Title',
        value: (item) => item.name,
    },
    {
        label: 'Event Organizer',
        value: (item) => item.organizer,
    },
    {
        label: 'Description',
        value: (item) => item.description,
    },
    {
        label: 'Event Date',
        value: (item) => {
            const formattedDate = new Date(item.date).toLocaleDateString('en-PH', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
            return formattedDate;
        },
    },
    {
        label: 'Venue',
        value: (item) => item.venue,
    },
    {
        label: 'Address',
        value: (item) => item.address,
    },
];
// FIELDS
export const FIELD_EVENT: Field[] = [
    {
        label: 'EVENT TITLE/NAME',
        inputType: 'text',
    },
    {
        label: 'DESCRIPTION',
        inputType: 'textarea',
    },
    {
        label: 'EVENT DATE',
        inputType: 'date',
    },
    {
        label: 'EVENT HEAD ORGANIZER',
        inputType: 'text',
    },
    {
        label: 'VENUE',
        inputType: 'text',
    },
    {
        label: 'ADDRESS',
        inputType: 'text',
    },
    {
        label: 'POSTER',
        inputType: 'file',
    },
];

export const FIELD_NAME_EVENT = {
    'EVENT TITLE/NAME': 'name',
    DESCRIPTION: 'description',
    'EVENT DATE': 'date',
    'EVENT HEAD ORGANIZER': 'organizer',
    VENUE: 'venue',
    ADDRESS: 'address',
    POSTER: 'poster',
} as const;

export type FormValues = {
    name: string;
    description: string;
    date: string;
    organizer: string;
    venue: string;
    address: string;
    poster?: File | null;
};

export type EventData = {
    title: string;
    fieldNames: keyof FormValues;
};

export const UPCOMING_EVENT_DATA: EventData[] = [
    {
        title: 'Event Name/Title',
        fieldNames: 'name',
    },
    {
        title: 'Description',
        fieldNames: 'description',
    },
    {
        title: 'Event Date',
        fieldNames: 'date',
    },
    {
        title: 'Head Organizer',
        fieldNames: 'organizer',
    },
    {
        title: 'Venue',
        fieldNames: 'venue',
    },
];

export const FIELD_NAME_UPCOMING_EVENT = {
    'CONTEST CATEGORY': 'contest_name',
    DESCRIPTION: 'contest_description',
    'CONTEST ORGANIZER': 'contest_organizer',
    'TYPE OF SCORING': 'contest_scoring_type',
    'GENDER CATEGORY': 'contest_gender_category',
    'TYPE OF CONTEST': 'contest_type',
    'CONTEST DATE': 'contest_date',
    VENUE: 'contest_venue',
    POSTER: 'contest_poster',
} as const;

export const ADD_CONTEST: Field[] = [
    {
        label: 'CONTEST CATEGORY',
        inputType: 'text',
    },
    {
        label: 'DESCRIPTION',
        inputType: 'textarea',
    },
    {
        label: 'CONTEST ORGANIZER',
        inputType: 'text',
    },
    {
        label: 'TYPE OF SCORING',
        inputType: 'combobox',
    },
    {
        label: 'TYPE OF CONTEST',
        inputType: 'combobox',
    },
    {
        label: 'GENDER CATEGORY',
        inputType: 'combobox',
    },
    {
        label: 'CONTEST DATE',
        inputType: 'date',
    },
    {
        label: 'VENUE',
        inputType: 'text',
    },
    {
        label: 'POSTER',
        inputType: 'file' as const,
    },
];

export const COMBOBOX_INPUT_EVENT_TYPE: ComboboxField[] = [
    {
        label: 'TYPE OF SCORING',
        data: [
            {
                label: 'SELECT',
                value: '',
            },
            {
                label: 'Point Based Single Round',
                value: 'Point Based Single Round',
            },
            {
                label: 'Point Based Multiple Round',
                value: 'Point Based Multiple Round',
            },
            {
                label: 'Rank Based Single Round',
                value: 'Rank Based Single Round',
            },
            {
                label: 'Rank Based Multiple Round',
                value: 'Rank Based Multiple Round',
            },
        ],
    },
    {
        label: 'TYPE OF CONTEST',
        data: [
            {
                label: 'SELECT',
                value: '',
            },
            {
                label: 'Individual',
                value: 'Individual',
            },
            {
                label: 'Team',
                value: 'Team',
            },
        ],
    },
    {
        label: 'GENDER CATEGORY',
        data: [
            {
                label: 'SELECT',
                value: '',
            },
            {
                label: 'Male Only',
                value: 'Male Only',
            },
            {
                label: 'Female Only',
                value: 'Female Only',
            },
            {
                label: 'Male & Female',
                value: 'Male & Female',
            },
            {
                label: 'Mixed',
                value: 'Mixed',
            },
        ],
    },
];
