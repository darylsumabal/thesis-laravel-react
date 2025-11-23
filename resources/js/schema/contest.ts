import z from 'zod';

export const addParticipantSchema = z.object({
    participant_no: z.string().min(1, {
        message: 'Please enter a participant no',
    }),
    first_name: z.string().min(1, {
        message: 'Please enter a first name',
    }),
    last_name: z.string().min(1, {
        message: 'Please enter a last name',
    }),
    description: z.string(),
    age: z.string().refine(
        (val) => {
            if (!val || val.trim() === '') return true;
            const num = Number(val);
            return num >= 1 && num <= 120;
        },
        { message: 'Age must be less than 120' },
    ),
    gender: z.string().min(1, {
        message: 'Please enter a gender',
    }),
    poster_url: z.any().optional(),
    // .refine((file) => file === null || file instanceof File, {
    //   message: "Please upload a valid image",
    // })
    // .refine((file) => file !== null, {
    //   message: "No image uploaded. Please upload an image",
    // }),
});

type DefaultValuesParticipants = {
    participant_no: string;
    first_name: string;
    last_name: string;
    description: string;
    age: string;
    gender: string;
    poster_url: File | null;
};

export const defaultValuesParticipants: DefaultValuesParticipants = {
    participant_no: '',
    first_name: '',
    last_name: '',
    description: '',
    age: '',
    gender: '',
    poster_url: null,
};

const excelFile = z.object({
    excel_file: z
        .any()
        .refine((file) => file === null || file instanceof File, {
            message: 'Please upload a valid .xlsx file',
        })
        .refine((file) => file !== null, {
            message: 'No .xlsx file uploaded. Please upload an .xlsx file',
        }),
});

export const addImportParticipantSchema = excelFile;

export const defaultValuesImportParticipant = {
    excel_file: null,
};

export const addImportTeamParticipantSchema = excelFile;

export const defaultValuesImportTeamParticipant = {
    excel_file: null,
};

export const addTeamParticipantSchema = z.object({
    team_participant_no: z.string().min(1, {
        message: 'Please enter a team participant number',
    }),
    team_name: z.string().min(1, {
        message: 'Please enter a team name',
    }),
    team_description: z.string(),
    team_captain: z.string(),
    poster_url: z.any().optional(),
    // .refine((file) => file === null || file instanceof File, {
    //   message: "Please upload a valid image",
    // })
    // .refine((file) => file !== null, {
    //   message: "No image uploaded. Please upload an image",
    // }),
});

type DefaultValuesTeamsParticipant = {
    team_participant_no: string;
    team_name: string;
    team_description: string;
    team_captain: string;
    poster_url: File | null;
};

export const defaultValuesTeamsParticipant: DefaultValuesTeamsParticipant = {
    team_participant_no: '',
    team_name: '',
    team_description: '',
    team_captain: '',
    poster_url: null,
};

export const EditContestSchema = z.object({
    contest_name: z.string().min(1, {
        message: 'Please enter a contest category',
    }),
    contest_description: z.string().min(1, {
        message: 'Please enter a description',
    }),
    contest_organizer: z.string().min(1, {
        message: 'Please enter a description',
    }),
    contest_date: z.string().min(1, {
        message: 'Please select a date',
    }),
    contest_venue: z.string().min(1, {
        message: 'Please enter a venue',
    }),
    contest_poster: z.any().optional(),
});
