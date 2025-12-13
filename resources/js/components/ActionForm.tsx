import { cn } from '@/lib/utils';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, Path, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import ActionCombobox from './ActionCombobox';
import { Field } from './CardWrap';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Popover, PopoverContent } from './ui/popover';
import { Textarea } from './ui/textarea';

export type ComboboxField = {
    label: string;
    data: {
        value: string;
        label: string;
    }[];
};

type FormProps<TSchema extends z.ZodType<any, any, any>> = {
    fields: Field[];
    fieldNames: Record<string, string>;
    comboboxField?: ComboboxField[];
    buttonText: string;
    onSubmit: (data: z.infer<TSchema>) => Promise<void>;
    submitCombobox?: boolean;
    form: UseFormReturn<z.infer<TSchema>>;
    fileInputRef?: React.RefObject<HTMLInputElement | null>;
    isPending: boolean;
    contestType?: string;
};

const ActionForm = <TSchema extends z.ZodType<any, any, any>>({
    fields,
    fieldNames,
    comboboxField,
    buttonText,
    form,
    fileInputRef,
    onSubmit,
    submitCombobox,
    isPending,
    contestType,
}: FormProps<TSchema>) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-8">
                <div className="grid w-full items-center gap-4">
                    {fields.map((input, index) => (
                        <FormField
                            key={index}
                            control={form.control}
                            name={fieldNames[input.label] as Path<z.infer<TSchema>>}
                            render={({ field }) => (
                                <div className="flex flex-col space-y-1.5">
                                    {input.inputType === 'date' && (
                                        <FormItem className="flex w-full flex-col">
                                            <FormLabel>{input.label}</FormLabel>
                                            <Popover open={isOpen} onOpenChange={setIsOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={'outline'}
                                                            className={cn(
                                                                'bg-transparent pl-3 text-left font-normal',
                                                                !field.value && 'text-muted-foreground',
                                                            )}
                                                        >
                                                            {typeof field.value === 'string' && field.value ? (
                                                                format(new Date(field.value), 'MMMM d, yyyy')
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="p-0" align="center">
                                                    <Calendar
                                                        className="w-full"
                                                        mode="single"
                                                        selected={typeof field.value === 'string' && field.value ? new Date(field.value) : undefined}
                                                        onSelect={(date) => {
                                                            if (date) {
                                                                field.onChange(format(new Date(date), 'MMMM d, yyyy'));
                                                            }
                                                            setIsOpen(false);
                                                        }}
                                                        disabled={(date) => {
                                                            const today = new Date();
                                                            today.setHours(0, 0, 0, 0);
                                                            return date < today;
                                                        }}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    {input.inputType === 'combobox' &&
                                        comboboxField?.map((i) => {
                                            if (i.label === 'GENDER CATEGORY' && contestType === 'Team') {
                                                return null;
                                            }

                                            if (i.label.toLocaleLowerCase() === input.label.toLocaleLowerCase())
                                                return (
                                                    <FormItem key={i.label}>
                                                        <FormLabel htmlFor={i.label.toLocaleLowerCase()} className="font-medium">
                                                            {i.label}
                                                        </FormLabel>
                                                        <Controller
                                                            name={field.name}
                                                            control={form.control}
                                                            render={({ field }) => (
                                                                <ActionCombobox
                                                                    data={i.data}
                                                                    values={typeof field.value === 'string' ? field.value : ''}
                                                                    onSelect={(selectedValue: string) => field.onChange(selectedValue)}
                                                                    submit={submitCombobox}
                                                                />
                                                            )}
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                );
                                        })}
                                    {input.inputType === 'file' && (
                                        <FormItem>
                                            <FormLabel htmlFor={input.label} className="font-medium">
                                                {input.label}
                                            </FormLabel>
                                            <Input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".xlsx, image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0] ?? null;
                                                    field.onChange(file);
                                                }}
                                                id={input.label}
                                                autoComplete="off"
                                                value={undefined}
                                            />
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                    {input.inputType === 'textarea' && (
                                        <FormItem>
                                            <FormLabel className="font-medium" htmlFor={input.label}>
                                                {input.label}
                                            </FormLabel>
                                            <Textarea {...field} id={input.label} value={typeof field.value === 'string' ? field.value : ''} />
                                            <FormMessage />
                                        </FormItem>
                                    )}

                                    {input.inputType !== 'file' &&
                                        input.inputType !== 'combobox' &&
                                        input.inputType !== 'date' &&
                                        input.inputType !== 'textarea' &&
                                        input.inputType !== 'test' && (
                                            <FormItem>
                                                <FormLabel htmlFor={input.label} className="font-medium">
                                                    {input.label}
                                                </FormLabel>
                                                <Input
                                                    // readOnly={isFieldReadOnly(field.value)}
                                                    type={input.inputType}
                                                    {...field}
                                                    id={input.label}
                                                    value={typeof field.value === 'string' ? field.value : ''}
                                                    autoComplete="off"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                </div>
                            )}
                        />
                    ))}
                </div>
                <div className="mt-10">
                    <Button type="submit" disabled={isPending} className="w-full cursor-pointer">
                        {isPending && <Loader2 className="animate-spin" />}

                        {buttonText}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default ActionForm;
