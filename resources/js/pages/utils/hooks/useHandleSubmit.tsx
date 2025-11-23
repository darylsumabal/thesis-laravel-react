import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { AxiosResponse } from 'axios';
import { format } from 'date-fns';
import { useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

type D = {
    [key: string]: string | Blob | undefined;
};

type SubmitParams<T extends D> = {
    data: T;
    mutationFn?: UseMutateAsyncFunction<
        AxiosResponse,
        unknown,
        {
            data: FormData;
            id: string;
        }
    >;
    mutationFnT?: UseMutateAsyncFunction<
        AxiosResponse,
        unknown,
        {
            data: FormData;
        }
    >;
    form: UseFormReturn<T>;
    id?: string;
};

const useHandleOnSubmit = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isSubmit, setIsSubmit] = useState(false);

    const handleOnSubmit = async <T extends D>({ data, mutationFn, form, id }: SubmitParams<T>) => {
        const formData = new FormData();

        const formatDate = format(new Date(), 'yyyy-MM-dd');

        for (const key in data) {
            if (key !== data.date) {
                const value = data[key as keyof typeof data];
                // if (value !== undefined) {
                //   formData.append(key, value);
                // }
                if (key === 'poster_url' && !(value instanceof File)) {
                    continue;
                }

                if (value instanceof File) {
                    formData.append(key, value);
                } else {
                    // ✅ Otherwise, treat as normal text
                    formData.append(key, String(value));
                }
            }
        }
        formData.append('date', formatDate);

        if (mutationFn) await mutationFn({ data: formData, id: id || '' });

        form.reset();
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setIsSubmit(true);
    };

    const handleOnSubmits = async <T extends D>({ data, mutationFnT, form }: SubmitParams<T>) => {
        const formData = new FormData();
        //
        const formatDate = format(new Date(data.date as string), 'yyyy-MM-dd');

        for (const key in data) {
            if (key !== data.date) {
                const value = data[key as keyof typeof data];
                if (value !== undefined) formData.append(key, value);
            }
        }
        formData.append('date', formatDate);

        if (mutationFnT) await mutationFnT({ data: formData });

        form.reset();
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsSubmit(true);
    };

    const handleOnSubmitTest = async <T extends D>({ data, mutationFnT, form }: SubmitParams<T>) => {
        const formData = new FormData();

        const formatDate = format(new Date(), 'yyyy-MM-dd');

        for (const key in data) {
            if (key !== data.date) {
                const value = data[key as keyof typeof data];
                if (value !== undefined) formData.append(key, value);
            }
        }
        formData.append('date', formatDate);

        if (mutationFnT) await mutationFnT({ data: formData });

        form.reset();
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsSubmit(true);
    };

    return {
        handleOnSubmits,
        handleOnSubmit,
        handleOnSubmitTest,
        isSubmit,
        fileInputRef,
    };
};

export default useHandleOnSubmit;
