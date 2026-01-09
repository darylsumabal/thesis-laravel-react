import { FIELD_EDIT_CONTEST, FIELD_NAME_EDIT_CONTEST } from '@/lib/constant/contest';
import { FIELD_EVENT, FIELD_NAME_EVENT } from '@/lib/constant/event';
import { cn } from '@/lib/utils';
import { EditContestSchema } from '@/schema/contest';
import { AddEventSchema } from '@/schema/event';
import { router, usePage } from '@inertiajs/react';
import { MoreHorizontal } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import ActionDialog from '../ActionDialog';
import ActionPopover from '../ActionPopover';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { imageSrc } from '@/lib/src';

type CardContentProps<T extends { id: string; poster: string }, U> = {
    tanstack?: boolean;
    item: T;
    fullItem?: U;
    fields: {
        label: string;
        value: (item: U) => React.ReactNode;
    }[];
    children?: React.ReactNode;
    className?: string;
    eventEdit?: boolean;
    contestEdit?: boolean;
    participantType?: 'individual' | 'team';
};

const CardContent = <T extends { id: string; poster: string }, U>({
    tanstack,
    item,
    fullItem,
    fields,
    children,
    className,
    eventEdit = false,
    contestEdit = false,
    participantType,
}: CardContentProps<T, U>) => {
    const itemToUse = fullItem || item;

    const { event, eventId, contest } = usePage().props;

    const defaultValuesAddEvent = eventEdit
        ? {
              name: event[0]?.name || '',
              description: event[0]?.description || '',
              date: event[0]?.date || '',
              organizer: event[0]?.organizer || '',
              venue: event[0]?.venue || '',
              address: event[0]?.address || '',
              poster: event[0]?.poster || null,
          }
        : null;

    const defaultValuesContestEvent = contestEdit
        ? {
              contest_name: contest[0]?.contest_name || '',
              contest_description: contest[0]?.contest_description || '',
              contest_organizer: contest[0]?.contest_organizer || '',
              contest_date: contest[0]?.contest_date || '',
              contest_venue: contest[0]?.contest_venue || '',
              contest_poster: contest[0]?.contest_poster || null,
          }
        : null;

    const handleUpdateEvent = async ({ id, data }) => {
        router.post(`/event/update/${id}`, data, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Event updated successfully!');
                router.reload({ only: ['event'] });
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('An error occurred');
            },
        });
    };

    const handleUpdateContest = async ({ id, data }) => {
        router.post(`/contest/update/${id}`, data, {
            preserveScroll: true,
            onSuccess: () => {
                router.reload({ only: ['contest'] });
                toast.success('Contest updated successfully!');
            },
            onError: (errors) => {
                console.error(errors);
                toast.error('An error occurred');
            },
        });
    };

    return (
        <Card className={cn('h-fit border-2 p-6', className)}>
            <div className="flex w-full flex-col space-y-4">
                {tanstack && <ActionPopover id={item.id} tanstack={tanstack} participantType={participantType} item={itemToUse} />}
                {eventEdit && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="flex w-full justify-end">
                                <Button variant="ghost" className="h-4 cursor-pointer p-0">
                                    <MoreHorizontal />
                                </Button>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-2" align="end">
                            <div className="flex w-full flex-col gap-2">
                                <div>
                                    <h4 className="text-xs leading-none font-medium">Actions</h4>
                                </div>
                                <ActionDialog
                                    id={eventId}
                                    // isPending={isPending}
                                    useFormData={true}
                                    buttonSaveTitle="Save"
                                    buttonTitle="Edit"
                                    dialogTitle="Edit an event"
                                    dialogDescription="Event Info"
                                    dialogInputLabel={FIELD_EVENT}
                                    schema={AddEventSchema}
                                    defaultValues={defaultValuesAddEvent}
                                    fieldNames={FIELD_NAME_EVENT}
                                    mutate={handleUpdateEvent}
                                    showButton={true}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
                {contestEdit && (
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="flex w-full justify-end">
                                <Button variant="ghost" className="h-4 cursor-pointer p-0">
                                    <MoreHorizontal />
                                </Button>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-2" align="end">
                            <div className="flex w-full flex-col gap-2">
                                <div>
                                    <h4 className="text-xs leading-none font-medium">Actions</h4>
                                </div>
                                <ActionDialog
                                    id={contest[0]?.id}
                                    // isPending={pendingUpdate}
                                    useFormData={true}
                                    buttonSaveTitle="Save"
                                    buttonTitle="Edit"
                                    dialogTitle="Edit an contest"
                                    dialogDescription="Contest Info"
                                    dialogInputLabel={FIELD_EDIT_CONTEST}
                                    schema={EditContestSchema}
                                    defaultValues={defaultValuesContestEvent}
                                    fieldNames={FIELD_NAME_EDIT_CONTEST}
                                    mutate={handleUpdateContest}
                                    showButton={true}
                                />
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
                <div>
                    {item.poster ? (
                        <img
                            // src={`${urlSrc}${item.poster}`}
                            src={`${imageSrc}/${item.poster}`}
                            // src={`/storage/${item.poster}`}
                            alt={`${item.poster}`}
                            className="w-full rounded-md border-[1px] object-fill xl:h-96"
                        />
                    ) : (
                        <div className="flex w-full items-center justify-center rounded-md border-[1px] bg-gray-200 text-black xl:h-96">
                            No Poster Available
                        </div>
                    )}
                </div>
                <div className="space-y-2 overflow-x-scroll">
                    {fields.map(({ label, value }) => {
                        const fieldValue = value(itemToUse as U);
                        if (fieldValue === null || fieldValue === undefined || (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
                            return null;
                        }
                        return (
                            <div className="flex gap-2" key={label}>
                                <h3 className="font-medium">{label}:</h3>
                                <p className="w-fit">{fieldValue}</p>
                            </div>
                        );
                    })}
                </div>

                <div>{children}</div>
            </div>
        </Card>
    );
};

export default CardContent;
