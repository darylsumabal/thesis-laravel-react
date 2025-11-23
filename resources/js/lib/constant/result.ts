import { ComboboxData } from '@/components/ActionCombobox';
import { OverAllScore, Participant, TeamParticipant } from '@/api/result';

type ResultFields<T, R = string | number> = {
    label: string;
    value: (item: T) => R;
};

export const RESULT_FIELDS: ResultFields<Participant>[] = [
    {
        label: 'Participant No',
        value: (item) => item.participant_no,
    },
    {
        label: 'First Name',
        value: (item) => item.first_name,
    },
    {
        label: 'Last Name',
        value: (item) => item.last_name,
    },
    {
        label: 'Gender',
        value: (item) => item.gender,
    },
];

export const RESULT_FIELDS_TEAMS: ResultFields<TeamParticipant>[] = [
    {
        label: 'Team No',
        value: (item) => item.team_participant_no,
    },
    {
        label: 'Team Name',
        value: (item) => item.team_name,
    },
    {
        label: 'Team Description',
        value: (item) => item.team_description,
    },
];

export const OVERALL_SCORE_FIELDS: ResultFields<OverAllScore>[] = [
    {
        label: 'Total Score',
        value: (item) => item?.score,
    },
];

export const COMBOBOX_RESULT_TYPE: ComboboxData[] = [
    {
        label: 'TABLE',
        value: 'TABLE',
    },
    {
        label: 'CARD',
        value: 'CARD',
    },
];

export const COMBOBOX_FILTER_CHART_TYPE: ComboboxData[] = [
    {
        label: 'CRITERIA 1',
        value: 'CRITERIA 1',
    },
    {
        label: 'CRITERIA 2',
        value: 'CRITERIA 2',
    },
    {
        label: 'CRITERIA 3',
        value: 'CRITERIA 3',
    },
];
