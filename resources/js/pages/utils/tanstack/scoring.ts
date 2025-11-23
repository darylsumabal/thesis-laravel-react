import {
    addCriteria,
    createCriteriaRound,
    deleteCriteria,
    deleteJudges,
    fetchJudges,
    fetchJudgesCategory,
    fetchPercentage,
    fetchPrelimFinal,
    fetchQualified,
    fetchScoring,
    fetchScoringMethod,
    fetchScoringTable,
    JudgesData,
    Scoring,
    updateCriteria,
    updateJudges,
    updatePrelimFinal,
    updateQualified,
} from '@/api/scoring';
import { DeleteCriteriaPayload, ScoringDataRound } from '@/lib/constant/scoring';
import { ApiMessageResponse, responseError, responseSuccess } from '@/lib/responseHandler';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

const SCORING_QUERY_KEY = 'scoring';

export const useScoringTable = (scoringType: string[], organizer: number) => {
    const { data, ...rest } = useQuery<Scoring>({
        queryKey: [SCORING_QUERY_KEY, scoringType.join(','), 'sda'],
        queryFn: () => fetchScoringTable(scoringType, organizer),
        enabled: !!scoringType && !!organizer,
    });
    return { scoring: data, ...rest };
};

export const useScoring = (scoringType: string[], organizer: number, contestId: string) => {
    const { data, ...rest } = useQuery<Scoring>({
        queryKey: [contestId, scoringType.join(',')],
        queryFn: () => fetchScoring(scoringType, organizer, contestId),
        enabled: !!scoringType && !!contestId && !!organizer,
    });
    return { scoring: data, ...rest };
};

export const useScoringMethod = (contestId: number, groupId: string) => {
    const { data, ...rest } = useQuery<'Final' | 'PrelimFinal'>({
        queryKey: [contestId, 'scoring_method'],
        queryFn: () => fetchScoringMethod(contestId, groupId),
        enabled: !!contestId && !!groupId,
    });
    return { scoringMethod: data, ...rest };
};

export const useJudges = () => {
    const { data, ...rest } = useQuery<JudgesData[]>({
        queryKey: [SCORING_QUERY_KEY, 'all judges'],
        queryFn: fetchJudges,
    });
    return { judges: data, ...rest };
};

export const useJudgesCategory = (contestId: string) => {
    const { data, ...rest } = useQuery<JudgesData[]>({
        queryKey: [SCORING_QUERY_KEY, contestId, 'judge-categories'],
        queryFn: () => fetchJudgesCategory(contestId),
        enabled: !!contestId,
    });
    return { judgesCategory: data, ...rest };
};

export const useQualified = (contestId: string, groupId: string) => {
    const { data, ...rest } = useQuery<number>({
        queryKey: [contestId, groupId, 'qualified'],
        queryFn: () => fetchQualified(contestId, groupId),
        enabled: !!contestId && !!groupId,
    });
    return { qualified: data, ...rest };
};

export const usePercentage = (contestId: string, groupId: string) => {
    const { data, ...rest } = useQuery({
        queryKey: [contestId, groupId, 'percentage'],
        queryFn: () => fetchPercentage(contestId, groupId),
        enabled: !!contestId && !!groupId,
    });
    return { percentage: data, ...rest };
};

// export const useCreateCriteria = (organizerId: number) => {
//   const queryClient = useQueryClient();

//   const { mutateAsync, ...rest } = useMutation({
//     mutationFn: (payload: { id: number; data: ScoringDataPointBased }) =>
//       createCriteria(organizerId, payload.id, payload.data),
//     onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
//       queryClient.invalidateQueries({ queryKey: [SCORING_QUERY_KEY] });
//       responseSuccess("Criteria created successfully", response);
//     },
//     onError: (error: AxiosError<ApiMessageResponse>) => {
//       responseError("An error occurred", error);
//     },
//   });
//   return { createCriteria: mutateAsync, ...rest };
// };

export const useCreateCriteriaRound = (organizerId: number) => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { id: number; data: ScoringDataRound }) => createCriteriaRound(organizerId, payload.id, payload.data),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({ queryKey: [SCORING_QUERY_KEY] });
            responseSuccess('Criteria created successfully', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred', error);
        },
    });

    return { createCriteria: mutateAsync, ...rest };
};

export const useAddCriteria = (contestId: number, groupId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { id: number; data: ScoringDataRound }) => addCriteria(contestId, groupId, payload.data),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({ queryKey: [SCORING_QUERY_KEY, 'add'] });
            responseSuccess('Criteria added successfully', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred', error);
        },
    });

    return { addCriteria: mutateAsync, pendingAddCriteria: isPending, ...rest };
};

export const useUpdateCriteria = (contestId: number, groupId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { id: number; data: ScoringDataRound }) => updateCriteria(contestId, groupId, payload.data),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({ queryKey: [SCORING_QUERY_KEY, 'sad'] });
            responseSuccess('Criteria updated successfully', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred', error);
        },
    });

    return { updateCriteria: mutateAsync, ...rest };
};

export const useDeleteCriteria = (contestId: number, groupId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: DeleteCriteriaPayload) => deleteCriteria(contestId, groupId, payload),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({ queryKey: [SCORING_QUERY_KEY, 'sad'] });
            responseSuccess('Criteria updated successfully', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred', error);
        },
    });

    return { deleteCriteria: mutateAsync, ...rest };
};

export const useUpdateJudges = (contestId: number, groupId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: { judges: { id: number }[] } }) => updateJudges(contestId, groupId, payload.data),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({
                queryKey: [SCORING_QUERY_KEY, 'judges'],
            });
            responseSuccess('Criteria updated judges', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred', error);
        },
    });

    return { updateJudges: mutateAsync, pendingJudges: isPending, ...rest };
};

export const useDeleteJudges = (contestId: number, groupId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (judgeId: number) => deleteJudges(contestId, groupId, judgeId),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({
                queryKey: [SCORING_QUERY_KEY, 'judges'],
            });
            responseSuccess('Criteria deleted judge successfully', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred', error);
        },
    });

    return { deleteJudges: mutateAsync, ...rest };
};

export const useUpdateQualified = (contestId: number, groupId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: { qualified: number } }) => updateQualified(contestId, groupId, payload.data),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({
                queryKey: [SCORING_QUERY_KEY, 'qualified'],
            });
            responseSuccess('Qualified participants updated successfully.', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred', error);
        },
    });

    return { updateQualified: mutateAsync, pendingQualified: isPending, ...rest };
};

export const usePrelimFinal = (contestId: string, groupId: string) => {
    const { data, ...rest } = useQuery<{
        prelimFinal: string;
        roundScore: { round: string; percentage: string }[];
    }>({
        queryKey: [SCORING_QUERY_KEY, 'prelimFinal'],
        queryFn: () => fetchPrelimFinal(contestId, groupId),
    });
    return { prelimFinal: data, ...rest };
};

export const useUpdatePrelimFinal = (contestId: number, groupId: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: (payload: { data: { preliminary: number; final: number } }) => updatePrelimFinal(contestId, groupId, payload.data),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({
                queryKey: [SCORING_QUERY_KEY, 'prelimFinal'],
            });
            responseSuccess('Preliminary and Final updated successfully.', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred', error);
        },
    });

    return {
        updatePrelimFinal: mutateAsync,
        pendingPrelimFinal: isPending,
        ...rest,
    };
};
