
import {
    archiveEvent,
    createContest,
    createEvent,
    deleteEvent,
    Events,
    fetchArchivedEvent,
    fetchEvent,
    fetchEventTable,
    restoreArchiveEvent,
    updateEvent,
} from '@/api/event';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';


import { ApiMessageResponse, responseError, responseSuccess } from '@/lib/responseHandler';
import { CONTEST_QUERY_KEY } from './contest';

const EVENT_QUERY_KEY = 'event';

export const useCreateEvent = (organizerId: number) => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData }) => createEvent(payload.data, organizerId),
        onSuccess: () => {
            toast.success('Event created successfully!');
            // responseSuccess("Criteria edited successfully", response);
            queryClient.invalidateQueries({ queryKey: [EVENT_QUERY_KEY] });
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            toast.error('An error occurred!');
            return error;
        },
    });

    return { createEvent: mutateAsync, ...rest };
};

export const useUpdateEvent = (eventId: number) => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData }) => updateEvent(payload.data, eventId),
        onSuccess: () => {
            toast.success('Event updated successfully!');
            queryClient.invalidateQueries({ queryKey: [EVENT_QUERY_KEY] });
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            toast.error('An error occurred!');
            return error;
        },
    });

    return { updateEvent: mutateAsync, ...rest };
};

export const useEventTable = (organizerId: number) => {
    const { data, isPending, ...rest } = useQuery<Events>({
        queryKey: [EVENT_QUERY_KEY, 'sad'],
        // refetchInterval: 1000,
        queryFn: () => fetchEventTable(organizerId),
        enabled: !!organizerId,
    });

    return {
        eventTable: data,
        pendingEvent: isPending,
        ...rest,
    };
};

export const useEvent = (id: string, organizerId: number) => {
    const { data, ...rest } = useQuery<Events>({
        queryKey: [EVENT_QUERY_KEY, 'es'],
        // refetchInterval: 1000,
        queryFn: () => fetchEvent(id, organizerId),
        enabled: !!organizerId,
    });

    return {
        event: data,
        ...rest,
    };
};

export const useArchived = (organizerId: number) => {
    const { data, isPending, ...rest } = useQuery<Events>({
        queryKey: [EVENT_QUERY_KEY],
        // refetchInterval: 1000,
        queryFn: () => fetchArchivedEvent(organizerId),
        enabled: !!organizerId,
    });

    return {
        archivedEvent: data,
        pendingArchived: isPending,
        ...rest,
    };
};

export const useDeleteEvent = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => deleteEvent(payload.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [EVENT_QUERY_KEY, 'sad'] });
            toast.success('Event deleted successfully');
        },
        onError: () => {
            toast.error('An error occurred!');
        },
    });

    return {
        deleteEvent: mutateAsync,
        ...rest,
    };
};

export const useArchivedEvent = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => archiveEvent(payload.id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [EVENT_QUERY_KEY],
            });
            toast.success('Event deleted successfully');
        },
        onError: () => {
            toast.error('An error occurred!');
        },
    });

    return {
        archivedEvent: mutateAsync,
        ...rest,
    };
};

export const useRestoreArchivedEvent = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => restoreArchiveEvent(payload.id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [EVENT_QUERY_KEY],
            });
            toast.success('Event restore successfully');
        },
        onError: () => {
            toast.error('An error occurred!');
        },
    });

    return {
        restoreArchivedEvent: mutateAsync,
        ...rest,
    };
};

export const useCreateContest = (organizerId: number) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData; id: string }) => createContest(payload.data, payload.id, organizerId),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({ queryKey: [EVENT_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [CONTEST_QUERY_KEY, 'sd'] });
            responseSuccess('Contest created successfully', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred', error);
        },
    });

    return { createContest: mutateAsync, pendingCreate: isPending, ...rest };
};
