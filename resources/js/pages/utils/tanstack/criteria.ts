import {
    archivedCriteria,
    archivedRestoreCriteria,
    CriteriaInfo,
    deleteCriteria,
    fetchJudgesCriteria,
    fetchMultipleBasedCriteria,
    fetchParticipant,
    fetchScoreArchivedCriteriaTable,
    fetchScoreCriteria,
    fetchScoreCriteriaTable,
    fetchTeamParticipant,
    MultipleRoundCriteria,
    updateCriteria,
    updateMultipleBasedCriteria,
    updateRankCriteria,
} from '@/api/criteria';
import { Participant, TeamParticipant } from '@/api/result';
import { ApiMessageResponse, responseError, responseSuccess } from '@/lib/responseHandler';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

export const CRITERIA_QUERY_KEY = 'criteria';

export const useMultipleRoundCriteria = (group_id: string) => {
    const { data, ...rest } = useQuery<MultipleRoundCriteria[]>({
        queryKey: [CRITERIA_QUERY_KEY, group_id],
        queryFn: () => fetchMultipleBasedCriteria(group_id),
    });

    return { criteria: data, ...rest };
};

export const useJudgesCriteria = (group_id: string) => {
    const { data, ...rest } = useQuery<
        {
            judge: {
                id: number;
                name: string;
                role: string;
            };
        }[]
    >({
        queryKey: [CRITERIA_QUERY_KEY, group_id, 'judgessa'],
        queryFn: () => fetchJudgesCriteria(group_id),
    });

    return { judgesCriteria: data, ...rest };
};

export const useScoreCriteria = (organizerId: number, contestId: string, groupId: string) => {
    const { data, ...rest } = useQuery<CriteriaInfo>({
        queryKey: [CRITERIA_QUERY_KEY, contestId],
        queryFn: () => fetchScoreCriteria(organizerId, contestId, groupId),
        enabled: !!organizerId,
    });

    return { criteria: data, ...rest };
};

export const useScoreCriteriaTable = (organizerId: number) => {
    const { data, ...rest } = useQuery<CriteriaInfo>({
        queryKey: [CRITERIA_QUERY_KEY, 'sd'],
        queryFn: () => fetchScoreCriteriaTable(organizerId),
        enabled: !!organizerId,
    });

    return { criteria: data, ...rest };
};

export const useScoreArchivedCriteriaTable = (organizerId: number) => {
    const { data, ...rest } = useQuery<CriteriaInfo>({
        queryKey: [CRITERIA_QUERY_KEY],
        queryFn: () => fetchScoreArchivedCriteriaTable(organizerId),
        enabled: !!organizerId,
    });

    return { archivedCriteria: data, ...rest };
};

export const useParticipants = (contestId: number) => {
    const { data, isPending, ...rest } = useQuery<Participant[]>({
        queryKey: [CRITERIA_QUERY_KEY, contestId, 'participants'],
        queryFn: () => fetchParticipant(contestId),
    });

    return { participants: data ?? [], pendingParticipant: isPending, ...rest };
};

export const useParticipantTeam = (contestId: number) => {
    const { data, isPending, ...rest } = useQuery<TeamParticipant[]>({
        queryKey: [CRITERIA_QUERY_KEY, contestId, 'teamParticipants'],
        queryFn: () => fetchTeamParticipant(contestId),
    });

    return { teamParticipants: data ?? [], pendingTeam: isPending, ...rest };
};

export const useUpdateCriteria = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { evaluation_criteria: string; id: string }) => updateCriteria(payload.evaluation_criteria, payload.id),
        onSuccess: (response: AxiosResponse<CriteriaInfo>) => {
            queryClient.invalidateQueries({ queryKey: [CRITERIA_QUERY_KEY] });
            responseSuccess('Criteria edited successfully', response);
        },
    });

    return { updateCriteria: mutateAsync, ...rest };
};

export const useUpdateRankCriteria = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { evaluation_criteria: string; id: string }) => updateRankCriteria(payload.evaluation_criteria, payload.id),
        onSuccess: (response: AxiosResponse<CriteriaInfo>) => {
            queryClient.invalidateQueries({ queryKey: [CRITERIA_QUERY_KEY] });
            responseSuccess('Criteria edited successfully', response);
        },
    });

    return { updateCriteria: mutateAsync, ...rest };
};

export const useUpdateMultipleCriteria = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { evaluation_criteria: string; id: number }) => updateMultipleBasedCriteria(payload.evaluation_criteria, payload.id),
        onSuccess: (response: AxiosResponse<CriteriaInfo>) => {
            queryClient.invalidateQueries({ queryKey: [CRITERIA_QUERY_KEY] });
            responseSuccess('Criteria edited successfully', response);
        },
    });

    return { updateCriteria: mutateAsync, ...rest };
};

export const useDeleteCriteria = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => deleteCriteria(payload.id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [CRITERIA_QUERY_KEY] });
            responseSuccess('Criteria edited successfully', response);
        },
        onError: (response: AxiosError<ApiMessageResponse>) => {
            responseError('Failed to delete criteria', response);
        },
    });

    return {
        deleteCriteria: mutateAsync,
        pendingDelete: isPending,
        ...rest,
    };
};

export const useArchivedCriteria = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => archivedCriteria(payload.id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [CRITERIA_QUERY_KEY] });
            responseSuccess('Criteria edited successfully', response);
        },
        onError: (response: AxiosError<ApiMessageResponse>) => {
            responseError('Failed to delete criteria', response);
        },
    });

    return {
        archivedCriteria: mutateAsync,
        pendingArchivedCriteria: isPending,
        ...rest,
    };
};

export const useArchivedRestoreCriteria = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { id: string }) => archivedRestoreCriteria(payload.id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: [CRITERIA_QUERY_KEY] });
            responseSuccess('Criteria edited successfully', response);
        },
        onError: (response: AxiosError<ApiMessageResponse>) => {
            responseError('Failed to delete criteria', response);
        },
    });

    return {
        restoreArchivedCriteria: mutateAsync,
        pendingRestoreArchivedCriteria: isPending,
        ...rest,
    };
};
