import { Contest } from '@/api/contest';
import { Event } from '@/api/event';
import ActionDialog from '@/components/ActionDialog';
import CardContent from '@/components/card/CardContent';
import AppLayout from '@/layouts/app-layout';
import { ADD_CONTEST, COMBOBOX_INPUT_EVENT_TYPE, EVENTS_FIELDS, FIELD_NAME_UPCOMING_EVENT } from '@/lib/constant/event';
import { AddEventContestSchema, defaultValues } from '@/schema/event';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import IndexContestTable from '../contest/IndexTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Event & Contest List',
        href: '/event/event-list',
    },
];

type PROPS = { event: Event[]; eventId: number; contest: Contest; archiveContest: Contest };

export default function IndexCard() {
    const { event, eventId, contest, archiveContest } = usePage<PROPS>().props;
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleCreateContest = async ({ data }: { id: string | null; data: FormData }) => {
        // Format the date if needed
        if (data.date) {
            const formatDate = format(new Date(data.date), 'yyyy-MM-dd');
            data.append('date', formatDate);
        }

        // Append other fields
        for (const key in data) {
            if (key !== 'date') {
                const value = data[key as keyof typeof data];
                if (value !== undefined && value !== null) {
                    // If it's a file
                    if (value instanceof File) {
                        data.append(key, value);
                    } else {
                        data.append(key, value.toString());
                    }
                }
            }
        }

        router.post(`/event/event-list/${eventId}`, data, {
            onSuccess: () => {
                toast.success('Contest created successfully!');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                router.reload({ only: ['contest'] });
            },
            onError: (error) => {
                console.log(error);
                toast.error('An error occurred');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Event & Contest List" />
            {event.map((item) => (
                <div className="flex justify-around gap-4 sm:flex-col xl:flex-row" key={item.id}>
                    <>
                        <CardContent
                            key={item.id}
                            item={{
                                id: item.id,
                                poster: item.poster,
                            }}
                            className="w-160 py-10"
                            fullItem={item}
                            fields={EVENTS_FIELDS}
                            eventEdit={true}
                        >
                            <ActionDialog
                                // isPending={pendingCreate}
                                buttonTitle="Create Contest Category"
                                buttonSaveTitle="Create"
                                dialogTitle="Create Contest Category"
                                dialogDescription="Create Contest Category Info"
                                dialogInputLabel={ADD_CONTEST}
                                schema={AddEventContestSchema}
                                defaultValues={defaultValues}
                                fieldNames={FIELD_NAME_UPCOMING_EVENT}
                                comboboxField={COMBOBOX_INPUT_EVENT_TYPE}
                                mutate={handleCreateContest}
                                useFormData={true}
                                showButton={true}
                                id={item.id}
                                icon={<Plus />}
                            />
                        </CardContent>
                        <IndexContestTable contest={contest} eventId={eventId} archiveContest={archiveContest} />
                    </>
                </div>
            ))}
        </AppLayout>
    );
}
