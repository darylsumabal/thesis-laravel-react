import { z } from 'zod';

export const AddEventSchema = z.object({
    name: z
        .string()
        .min(1, {
            message: 'Please enter a event name',
        })
        .max(255, {
            message: 'Event name too long 255 character is the maximum',
        }),
    description: z
        .string()
        .min(1, {
            message: 'Please enter a event description',
        })
        .max(255, {
            message: 'Event description too long 255 character is the maximum',
        }),
    date: z.string().min(1, {
        message: 'Please enter a date',
    }),
    organizer: z.string().min(1, {
        message: 'Please enter a event organizer',
    }),
    venue: z.string().min(1, {
        message: 'Please enter a event venue',
    }),
    address: z.string().min(1, {
        message: 'Please enter a event address',
    }),
    poster: z.any().optional(),
    // .refine((file) => file === null || file instanceof File, {
    //   message: "Please upload a valid image",
    // })
    // .refine((file) => file !== null, {
    //   message: "No image uploaded. Please upload an image.",
    // }),
});

export const AddEventContestSchema = z.object({
    contest_name: z.string().min(1, {
        message: 'Please enter a contest category',
    }),
    contest_description: z.string().min(1, {
        message: 'Please enter a description',
    }),
    contest_organizer: z.string().min(1, {
        message: 'Please enter a description',
    }),
    contest_scoring_type: z.string().min(1, {
        message: 'Please select a scoring type',
    }),
    contest_type: z.string().min(1, {
        message: 'Please select a contest type',
    }),
    contest_gender_category: z.string().min(1, {
        message: 'Please select a gender category',
    }),
    contest_date: z.string().min(1, {
        message: 'Please select a date',
    }),
    contest_venue: z.string().min(1, {
        message: 'Please enter a venue',
    }),
    contest_poster: z.any().optional(),
});

type DefaultValuesEvent = {
    contest_name: string;
    contest_description: string;
    contest_scoring_type: string;
    contest_type: string;
    contest_organizer: string;
    contest_gender_category: string;
    contest_date: string;
    contest_venue: string;
    contest_poster: File | null;
};

export const defaultValues: DefaultValuesEvent = {
    contest_name: '',
    contest_description: '',
    contest_organizer: '',
    contest_scoring_type: '',
    contest_type: '',
    contest_gender_category: '',
    contest_date: '',
    contest_venue: '',
    contest_poster: null,
};

type DefaultValuesAddEvent = {
    name: string;
    description: string;
    date: string;
    organizer: string;
    venue: string;
    address: string;
    poster: File | null;
};

export const defaultValuesAddEvent: DefaultValuesAddEvent = {
    name: '',
    description: '',
    date: '',
    organizer: '',
    venue: '',
    address: '',
    poster: null,
};
