import { COMBOBOX_INPUT_CRITERIA_TYPE } from '@/lib/constant/contest';
import { CriteriaRound } from '@/schema/scoring';
import { Loader2 } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { FieldArrayWithId, useFieldArray, UseFormReturn } from 'react-hook-form';
import ActionCombobox from '../ActionCombobox';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '../ui/table';

type TableProps = {
    id: string;
    onSubmit: (data: CriteriaRound) => Promise<void>;
    fieldRound: FieldArrayWithId<{
        judges: { id: number }[];
        multiple: CriteriaRound;
    }>[];
    roundScoring: boolean;
    removeRound: (fieldRounds: number) => void;
    idx: number;
    form: UseFormReturn<CriteriaRound>;
    watchScore: (idx: number) => ReactNode;
    isPending: boolean;
    multipleRound: boolean;
    edit?: boolean;
    buttonTitle?: string;
    isWeighted?: boolean;
};

const TableCardCriteria = ({
    id,
    onSubmit,
    fieldRound,
    removeRound,
    idx,
    form,
    watchScore,
    roundScoring,
    isPending,
    multipleRound,
    edit = false,
    buttonTitle = 'Create Criteria',
    isWeighted,
}: TableProps) => {
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: `criteria.criteria.${idx}.criterion`,
    });
    const roundValue = form.watch(`criteria.criteria.${idx}.round`);
    const handleAddRow = () => {
        append({
            evaluationCriterion: '',
            score: 0,
        });
    };
    useEffect(() => {
        if (roundValue === 'Final') {
            form.setValue(`criteria.criteria.${idx}.weighted`, 0);
        }
    }, [roundValue, idx, form]);

    return (
        <Card className="border-2 p-2" key={id}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                {roundScoring && fieldRound.length > 1 && idx > 0 && (
                    <Button className="cursor-pointer text-xs" size={'sm'} type="button" onClick={() => removeRound(fieldRound.length - 1)}>
                        Remove Criteria
                    </Button>
                )}
                <div className="mt-4 space-y-4">
                    <div className="flex justify-between gap-4">
                        <div className="w-full">
                            <FormField
                                control={form.control}
                                name={`criteria.criteria.${idx}.criteria`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <div className="space-y-2">
                                                <FormLabel>Enter a contest name</FormLabel>
                                                <Input {...field} value={field.value || ''} placeholder="Contest Name" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="flex w-full gap-2">
                            {isWeighted && roundValue !== 'Final' && (
                                <div className="w-full space-y-2">
                                    <FormField
                                        control={form.control}
                                        name={`criteria.criteria.${idx}.weighted`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="space-y-2">
                                                        <FormLabel>Contest Weight</FormLabel>
                                                        <Input
                                                            {...field}
                                                            value={field.value || ''}
                                                            onChange={(e) => {
                                                                const val = e.target.value; // ensures number type
                                                                if (val === '') {
                                                                    // allow clearing the input
                                                                    field.onChange('');
                                                                    return;
                                                                }
                                                                const num = Number(val);
                                                                if (num >= 0) {
                                                                    field.onChange(num);
                                                                }
                                                            }}
                                                            placeholder="Contest Weight"
                                                            type="number"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                            {multipleRound && edit && (
                                <div className="w-full space-y-2">
                                    <FormField
                                        control={form.control}
                                        name={`criteria.criteria.${idx}.round`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <div className="space-y-2">
                                                        <FormLabel>Select a round</FormLabel>
                                                        <ActionCombobox
                                                            data={COMBOBOX_INPUT_CRITERIA_TYPE}
                                                            values={typeof field.value === 'string' ? field.value : ''}
                                                            onSelect={(selectedValue) => field.onChange(selectedValue)}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Evaluation Criterion</TableHead>
                                    <TableHead>Score</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`criteria.criteria.${idx}.criterion.${index}.evaluationCriterion`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="text" {...field} value={field.value ?? ''} placeholder="Enter criterion" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`criteria.criteria.${idx}.criterion.${index}.score`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                {...field}
                                                                type="text"
                                                                value={field.value || ''}
                                                                placeholder="Enter score"
                                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                                                min={1}
                                                                max={100}
                                                                maxLength={3}
                                                                minLength={1}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell>Total</TableCell>
                                    <TableCell className="text-right">{watchScore(idx)}/100</TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>
                </div>

                <div className="flex justify-between py-4">
                    <div className="flex flex-col gap-2 lg:flex-row">
                        <Button variant="default" type="button" className="cursor-pointer" size="sm" onClick={() => handleAddRow()}>
                            Add Row
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="cursor-pointer"
                            type="button"
                            onClick={() => fields.length > 1 && remove(fields.length - 1)}
                        >
                            Delete Row
                        </Button>
                    </div>

                    <div>
                        {idx === fieldRound.length - 1 && (
                            <Button variant="default" type="submit" size="sm" disabled={isPending} className="cursor-pointer">
                                {isPending && <Loader2 className="animate-spin" />}
                                {buttonTitle}
                            </Button>
                        )}
                    </div>
                </div>
            </form>
        </Card>
    );
};

export default TableCardCriteria;
