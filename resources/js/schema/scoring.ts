import { z } from 'zod';

const scoring = z.object({
    id: z.number().optional(),
    evaluationCriterion: z.string().min(1, { message: 'Please enter a criterion' }),
    score: z
        .number()
        .min(1, {
            message: 'Score must be between 0 and 100',
        })
        .max(100, { message: 'Score must be between 0 and 100' }),
});

export const pointBasedSchema = scoring;

export const judgesSchema = z.object({
    id: z.number(),
});

export const formSchema = z.object({
    criteria: z.array(pointBasedSchema),
    judges: z.array(judgesSchema),
});

export type FormValues = z.infer<typeof formSchema>;

export const multipleRoundSchema = scoring;

// export const Schema = z.object({
//   judges: z.array(judgesSchema),
//   multiple: z.object({
//     criteria: z.array(
//       z.object({
//         qualified: z.number().min(1, {
//           message: "Please enter a qualified participant in this round!",
//         }),
//         round: z.number(),
//         criterion: z.array(multipleRoundSchema),
//       })
//     ),
//   }),
// });

// export type MultipleRound = z.infer<typeof Schema>;

export const CriteriaSchema = z
    .object({
        judges: z.array(judgesSchema),
        qualified: z.coerce.number().min(1, {
            message: 'Qualified participant must be at least 1',
        }),
        scoringMethod: z.string().optional(),
        preliminary: z.coerce.number().optional(),
        final: z.coerce.number().optional(),
        criteria: z.object({
            criteria: z.array(
                z.object({
                    criteria: z.string().min(1, {
                        message: 'Please enter a criteria name!',
                    }),
                    round: z.string().min(1, {
                        message: 'Please select a round!',
                    }),
                    category: z.string().min(1, {
                        message: 'Please select a category!',
                    }),
                    criterion: z.array(multipleRoundSchema),
                }),
            ),
        }),
    })
    .refine((data) => !!data.scoringMethod && data.scoringMethod.trim() !== '', {
        message: 'Scoring method is required',
        path: ['scoringMethod'],
    })
    .refine((data) => data.scoringMethod !== 'PrelimFinal' || (data.preliminary !== undefined && data.preliminary >= 1 && data.preliminary <= 100), {
        message: 'Preliminary scoring must be between 1 and 100',
        path: ['preliminary'],
    })
    // validate final
    .refine((data) => data.scoringMethod !== 'PrelimFinal' || (data.final !== undefined && data.final >= 1 && data.final <= 100), {
        message: 'Final scoring must be between 1 and 100',
        path: ['final'],
    });

export const CriteriaSchemaSr = z.object({
    judges: z.array(judgesSchema),
    qualified: z.coerce.number().min(1, {
        message: 'Qualified participant must be at least 1',
    }),
    // genderCategory: z.string().optional(),
    criteria: z.object({
        criteria: z.array(
            z.object({
                criteria: z.string().min(1, {
                    message: 'Please enter a criteria name!',
                }),
                round: z.string().min(1, {
                    message: 'Please select a round!',
                }),
                category: z.string().min(1, {
                    message: 'Please select a category!',
                }),
                criterion: z.array(multipleRoundSchema),
            }),
        ),
    }),
});

export const CriteriaAddSchema = z.object({
    judges: z.array(judgesSchema),
    criteria: z.object({
        criteria: z.array(
            z.object({
                criteria: z.string().min(1, {
                    message: 'Please enter a criteria name!',
                }),
                round: z.string().min(1, {
                    message: 'Please select a round!',
                }),
                category: z.string().min(1, {
                    message: 'Please select a category!',
                }),
                criterion: z.array(multipleRoundSchema),
            }),
        ),
    }),
});

export type CriteriaRound = z.infer<typeof CriteriaSchema>;
export type CriteriaRoundSr = z.infer<typeof CriteriaSchemaSr>;
export type CriteriaAddRound = z.infer<typeof CriteriaAddSchema>;
