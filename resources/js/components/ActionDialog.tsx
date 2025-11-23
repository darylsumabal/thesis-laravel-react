import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { format } from 'date-fns';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z, ZodSchema } from 'zod';
import ActionForm, { ComboboxField } from './ActionForm';

export type Field = {
    label: string;
    inputType: 'email' | 'file' | 'password' | 'text' | 'date' | 'combobox' | 'textarea' | 'number' | 'test';
};

export type DefaultValues = {
    [key: string]: string | File | null;
};

type DialogProps<TSchema extends ZodSchema> = {
    buttonTitle: string;
    dialogTitle: string;
    dialogDescription: string;
    dialogInputLabel: Field[];
    buttonSaveTitle: string;
    schema: z.ZodEffects<z.ZodObject<z.ZodRawShape>> | z.ZodObject<z.ZodRawShape>;
    defaultValues: DefaultValues;
    fieldNames: Record<string, keyof z.infer<TSchema>>;
    mutate?: UseMutateAsyncFunction<AxiosResponse | void, Error, z.infer<TSchema>, unknown>;
    comboboxField?: ComboboxField[];
    open?: boolean;
    handleClose?: () => void;
    showButton: boolean;
    id?: string;
    useFormData: boolean;
    isPending: boolean;
    icon?: React.ReactNode;
};

const ActionDialog = <TSchema extends ZodSchema>(props: DialogProps<TSchema>) => {
    const {
        buttonTitle,
        buttonSaveTitle,
        dialogDescription,
        dialogInputLabel,
        dialogTitle,
        schema,
        defaultValues,
        fieldNames,
        comboboxField,
        mutate,
        open,
        handleClose,
        showButton,
        id,
        useFormData,
        isPending,
        icon,
    } = props;

    const [isSubmit, setIsSubmit] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [isOpen, setIsOpen] = useState(open);

    useEffect(() => {
        if (open !== undefined) {
            setIsOpen(open);
        }
    }, [open]);

    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: defaultValues,
    });

    const { watch, setValue } = form;

    const nameValue = watch('name');

    const contestType = form.watch('contest_type');

    useEffect(() => {
        if (contestType === 'Team') {
            // Automatically set contest_gender_category to "Team"
            setValue('contest_gender_category', 'Team');
        } else {
            // Clear it or reset if not Team
            setValue('contest_gender_category', '');
        }
    }, [contestType, setValue]);
    useEffect(() => {
        if (nameValue) {
            const cleanedName = nameValue.replace(/\s+/g, '').toLowerCase();
            setValue('email', `${cleanedName}@gmail.com`);
        }
    }, [nameValue, setValue]);

    const handleOnSubmit = async (data: z.infer<typeof schema>) => {
        const formData = new FormData();

        try {
            if (useFormData) {
                // Append all fields to formData correctly
                for (const key in data) {
                    const value = data[key as keyof typeof data];
                    if (value !== undefined && value !== null) {
                        // For the date field, format properly if needed
                        if (key === 'contest_date' && typeof value === 'string') {
                            const formattedDate = format(new Date(value), 'yyyy-MM-dd');
                            formData.append(key, formattedDate);
                        } else if ((key === 'poster' && value instanceof File) || (key === 'contest_poster' && value instanceof File)) {
                            formData.append(key, value); // ✅ Only append if it's a File
                        }
                        // Handle poster string (existing path) - DON'T append it
                        else if ((key === 'poster' && typeof value === 'string') || (key === 'contest_poster' && typeof value === 'string')) {
                            // Skip - don't send existing poster path
                            continue;
                        } else {
                            formData.append(key, value);
                        }
                    }
                }

                await mutate?.({ id: id || null, data: formData });
                setIsOpen(false);
                setIsSubmit(false);
                form.reset();
            } else {
                await mutate?.({ id: id || null, data });
            }

            if (handleClose) handleClose();
        } catch (error) {
            console.log(error);
        }
    };

    const handleResetCloseDialog = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            form.reset();
            if (handleClose) handleClose();
        }
    };

    return (
        <Dialog onOpenChange={handleResetCloseDialog} open={isOpen}>
            {showButton ? (
                <DialogTrigger asChild>
                    <Button variant="default" className="w-fit cursor-pointer" onClick={() => setIsOpen(true)}>
                        {icon} {buttonTitle}
                    </Button>
                </DialogTrigger>
            ) : (
                <DialogTrigger asChild />
            )}

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div>
                        <ActionForm
                            isPending={isPending}
                            fields={dialogInputLabel}
                            fieldNames={fieldNames}
                            comboboxField={comboboxField}
                            buttonText={buttonSaveTitle}
                            onSubmit={handleOnSubmit}
                            submitCombobox={isSubmit}
                            form={form}
                            fileInputRef={fileInputRef}
                            contestType={contestType}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ActionDialog;
