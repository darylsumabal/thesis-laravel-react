import ActionForm from '@/components/ActionForm';
import { Card } from '@/components/ui/card';
import { FIELD_EVENT, FIELD_NAME_EVENT, FormValues, UPCOMING_EVENT_DATA } from '@/lib/constant/event';
import { AddEventSchema, defaultValuesAddEvent } from '@/schema/event';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

export default function Index() {
    const form = useForm<FormValues>({
        resolver: zodResolver(AddEventSchema),
        defaultValues: defaultValuesAddEvent,
    });
    const [loading, setLoading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleOnSubmitAddEvent = (data: z.infer<typeof AddEventSchema>) => {
        const formData = new FormData();
        setLoading(true);
        // Format the date if needed
        if (data.date) {
            const formatDate = format(new Date(data.date), 'yyyy-MM-dd');
            formData.append('date', formatDate);
        }

        // Append other fields
        for (const key in data) {
            if (key !== 'date') {
                const value = data[key as keyof typeof data];
                if (value !== undefined && value !== null) {
                    // If it's a file
                    if (value instanceof File) {
                        formData.append(key, value);
                    } else {
                        formData.append(key, value.toString());
                    }
                }
            }
        }
        const promise = new Promise((resolve, reject) => {
            router.post(`/event`, formData, {
                forceFormData: true,
                preserveScroll:true,
                onSuccess: (page) => {
                    setLoading(false);
                    resolve(page);
                    router.reload({ only: ['event'] });
                    toast.success('Event created successfully');
                    form.reset();
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                },
                onError: (error) => {
                    setLoading(false);
                    toast.error('An error occurred');
                    console.log(error);
                    reject(error);
                },
            });
        });
        toast.promise(promise, {
            loading: 'Loading...',
            success: 'Event created successfully!',
            error: 'Failed to create.',
        });
    };

    return (
        <div className="flex w-full flex-col gap-2 lg:flex-row">
            <Card className="w-full p-10">
                <ActionForm
                    fields={FIELD_EVENT}
                    fieldNames={FIELD_NAME_EVENT}
                    buttonText="Create Event"
                    onSubmit={handleOnSubmitAddEvent}
                    // submitCombobox={isSubmit}
                    form={form}
                    fileInputRef={fileInputRef}
                    isPending={loading}
                />
            </Card>

            <div className="flex w-full justify-center">
                <Card className="w-96 p-6">
                    <div className="flex w-full flex-col space-y-4">
                        <div>
                            {(() => {
                                const poster = form.watch('poster');
                                return (
                                    <img
                                        src={
                                            poster instanceof File
                                                ? URL.createObjectURL(poster)
                                                : 'https://dummyimage.com/1920x1080/ededed/000000&text=Image'
                                        }
                                        alt=""
                                        className="h-96 w-full rounded-md border-[1px] border-slate-950"
                                    />
                                );
                            })()}
                        </div>
                        <div className="space-y-2">
                            <div className="flex max-h-72 flex-col gap-2 overflow-y-scroll">
                                {UPCOMING_EVENT_DATA.map((item, index) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <h3 className="font-medium">{item.title}:</h3>
                                        <p className="w-full break-words whitespace-pre-wrap">{form.watch(item.fieldNames) as string}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
