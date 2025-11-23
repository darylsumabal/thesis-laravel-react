import {
    archivedContest,
    archivedRestoreContest,
    Contest,
    createParticipants,
    createPoster,
    createTeamParticipants,
    deleteContest,
    deleteParticipant,
    deleteTeamParticipant,
    fetchArchivedContest,
    fetchContest,
    fetchContestTable,
    fetchPoster,
    importParticipants,
    importTeamParticipants,
    indexParticipants,
    indexTeamParticipants,
    updateContest,
    updateParticipant,
    updateTeamParticipant,
} from '@/api/contest';
import { Participant, TeamParticipant } from '@/api/result';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';

import { ApiMessageResponse, responseError, responseSuccess } from '@/lib/responseHandler';
import { CRITERIA_QUERY_KEY } from './criteria';

export const CONTEST_QUERY_KEY = 'contest';

export const usePoster = (contestId: number) => {
    const { data, isPending, ...rest } = useQuery<{ poster_url: string }>({
        queryKey: ['poster'],
        queryFn: () => fetchPoster(contestId),
    });
    return { poster: data, pendingAccount: isPending, ...rest };
};

export const useContestTable = (organizerId: number, eventId: number) => {
    const { data, ...rest } = useQuery<Contest>({
        queryKey: [CONTEST_QUERY_KEY, 'sd'],
        queryFn: () => fetchContestTable(organizerId, eventId),
        enabled: !!organizerId,
    });
    return { contest: data, ...rest };
};

export const useArchiveContestTable = (organizerId: number, eventId: number) => {
    const { data, ...rest } = useQuery<Contest>({
        queryKey: [CONTEST_QUERY_KEY, 'sds'],
        queryFn: () => fetchArchivedContest(organizerId, eventId),
        enabled: !!organizerId,
    });
    return { contestArchived: data, ...rest };
};

export const useContest = (id: string, organizerId: number) => {
    const { data, ...rest } = useQuery<Contest>({
        queryKey: [CONTEST_QUERY_KEY, id, 'ag'],
        queryFn: () => fetchContest(id, organizerId),
        enabled: !!organizerId && !!id,
    });
    return { contest: data, ...rest };
};

export const useParticipant = (contestId: string, participantId: string) => {
    const { data, isPending, ...rest } = useQuery<Participant[]>({
        queryKey: [CRITERIA_QUERY_KEY],
        queryFn: () => indexParticipants(contestId, participantId),
    });
    return { participant: data, pendingParticipant: isPending, ...rest };
};

export const useTeamParticipant = (contestId: string, participantId: string) => {
    const { data, isPending, ...rest } = useQuery<TeamParticipant[]>({
        queryKey: [CRITERIA_QUERY_KEY],
        queryFn: () => indexTeamParticipants(contestId, participantId),
    });
    return { teamParticipant: data, pendingTeamParticipant: isPending, ...rest };
};

export const useCreateParticipant = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData; id: string }) => createParticipants(payload.data, payload.id),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>, variables) => {
            const contestId = Number(variables.id);
            queryClient.invalidateQueries({
                queryKey: [CRITERIA_QUERY_KEY, contestId, 'participants'],
            });
            responseSuccess('Participant Added', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        createParticipant: mutateAsync,
        pendingParticipant: isPending,
        ...rest,
    };
};

export const useUpdateParticipant = (contestId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData; id: string }) => updateParticipant(payload.data, contestId, payload.id),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({
                queryKey: [CRITERIA_QUERY_KEY],
            });
            responseSuccess('Participant Added', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        updateParticipant: mutateAsync,
        pendingParticipant: isPending,
        ...rest,
    };
};

export const useUpdateTeamParticipant = (contestId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData; id: string }) => updateTeamParticipant(payload.data, contestId, payload.id),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({
                queryKey: [CRITERIA_QUERY_KEY],
            });
            responseSuccess('Participant Added', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        updateTeamParticipant: mutateAsync,
        pendingTeamParticipant: isPending,
        ...rest,
    };
};

export const useCreatePoster = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData; id: string }) => createPoster(payload.data, payload.id),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>, variables) => {
            const contestId = Number(variables.id);
            queryClient.invalidateQueries({
                queryKey: [CRITERIA_QUERY_KEY, contestId, 'participants', 'poster'],
            });
            responseSuccess('Participant Added', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        createPoster: mutateAsync,
        pendingPoster: isPending,
        ...rest,
    };
};

export const useImportParticipants = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData; id: string }) => importParticipants(payload.data, payload.id),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>, variables) => {
            const contestId = Number(variables.id);
            queryClient.invalidateQueries({
                queryKey: [CRITERIA_QUERY_KEY, contestId, 'participants'],
            });
            responseSuccess('Participant Uploaded', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        createImportParticipant: mutateAsync,
        pendingImport: isPending,
        ...rest,
    };
};

export const useImportTeamParticipants = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData; id: string }) => importTeamParticipants(payload.data, payload.id),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>, variables) => {
            const contestId = Number(variables.id);
            queryClient.invalidateQueries({
                queryKey: [CRITERIA_QUERY_KEY, contestId, 'teamParticipants'],
            });
            responseSuccess('Team Participant Uploaded', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        createImportTeamParticipant: mutateAsync,
        pendingImport: isPending,
        ...rest,
    };
};

export const useCreateTeamParticipants = (organizerId: number) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData; id: string }) => createTeamParticipants(payload.data, payload.id, organizerId),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>, variables) => {
            const contestId = Number(variables.id);

            queryClient.invalidateQueries({
                queryKey: [CRITERIA_QUERY_KEY, contestId, 'teamParticipants'],
            });
            responseSuccess('Team Participant Added', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        createTeamParticipant: mutateAsync,
        pendingTeam: isPending,
        ...rest,
    };
};

export const useDeleteContest = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => deleteContest(payload.id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [CONTEST_QUERY_KEY, 'sds'],
            });

            toast.success('Contest Deleted!');
        },
        onError: () => {
            toast.error('An error occurred');
        },
    });
    return { deleteContest: mutateAsync, pendingDelete: isPending, ...rest };
};

export const useArchivedContest = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => archivedContest(payload.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CONTEST_QUERY_KEY] });

            toast.success('Archived successfully!');
        },
        onError: () => {
            toast.error('An error occurred');
        },
    });
    return { archivedContest: mutateAsync, pendingDelete: isPending, ...rest };
};

export const useRestoreArchivedContest = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => archivedRestoreContest(payload.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [CONTEST_QUERY_KEY] });

            toast.success('Contest archived restore successfully');
        },
        onError: () => {
            toast.error('An error occurred');
        },
    });
    return {
        restoreArchivedContest: mutateAsync,
        pendingDelete: isPending,
        ...rest,
    };
};

export const useDeleteParticipant = (contestId: number) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => deleteParticipant(contestId, payload.id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [CRITERIA_QUERY_KEY, contestId, 'participants'],
            });
            toast.success('Participant Deleted');
        },
        onError: () => {
            toast.error('An error occurred');
        },
    });
    return { deleteParticipant: mutateAsync, pendingDelete: isPending, ...rest };
};

export const useDeleteTeamParticipant = (contestId: number) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => deleteTeamParticipant(contestId, payload.id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [CRITERIA_QUERY_KEY, contestId, 'teamParticipants'],
            });
            toast.success('Participant Deleted');
        },
        onError: () => {
            toast.error('An error occurred');
        },
    });
    return {
        deleteTeamParticipant: mutateAsync,
        pendingDelete: isPending,
        ...rest,
    };
};

export const useUpdateContest = (contestId: number) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData }) => updateContest(payload.data, contestId),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({
                queryKey: [CONTEST_QUERY_KEY],
            });
            responseSuccess('Contest updated successfully', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred', error);
        },
    });

    return { updateContest: mutateAsync, pendingUpdate: isPending, ...rest };
};
