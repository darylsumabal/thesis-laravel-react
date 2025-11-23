import { z } from 'zod';

const criteria = z.object({
    judges_id: z.number(),
    participant_id: z.number(),
    contest_id: z.number(),
    group_id: z.string(),
});

const evaluationCriteria = z.object({
    evaluation_criteria: z.string(),
    score: z
        .number()
        .min(1, {
            message: 'Score must be minimum of 1',
        })
        .max(100, {
            message: 'Score must be max of 100',
        }),
});

export const pointBasedSchema = z.object({
    criteria: z.array(criteria.merge(evaluationCriteria)),
});

export type PointBasedCriteria = z.infer<typeof pointBasedSchema>;

export const multipleBasedSchema = z.object({
    criteria: z.array(
        criteria.merge(
            evaluationCriteria.extend({
                round: z.number(),
            }),
        ),
    ),
});

export type MultipleBasedCriteria = z.infer<typeof multipleBasedSchema>;

export const editCriteriaSchema = z.object({
    evaluation_criteria: z.string().min(1, {
        message: 'Please enter a criteria',
    }),
});

type EditAccountDefaultValues = {
    evaluation_criteria: string;
};

export const editCriteriaDefaultValue: EditAccountDefaultValues = {
    evaluation_criteria: '',
};

const criteriaTest = z.object({
    judges_id: z.number(),
    participant_id: z.number(),
    round: z.string(),
    participant_type: z.string(),
    contest_id: z.number(),
    group_id: z.string(),
    criteria: z.string(),
    evaluation_criteria: z.string(),
});

export const PointBasedSchemaTest = z.object({
    criteria: z.record(
        z.string(),
        z.record(
            z.string(),
            criteriaTest.merge(
                z.object({
                    score: z.coerce.number().min(1, {
                        message: 'Score must at least 1',
                    }),
                }),
            ),
        ),
    ),
});

export type pointBasedSchemaTest = z.infer<typeof PointBasedSchemaTest>;
