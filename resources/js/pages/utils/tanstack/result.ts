import {
    ActivityLog,
    createResultFinal,
    createResultSingleRound,
    createResultSingleRoundTeam,
    createResultTest,
    createResultTestTeam,
    fetchActivityLog,
    fetchFinal,
    fetchFinalResult,
    fetchFinalResultSingleRound,
    fetchFinalResultSingleRoundTeam,
    fetchFinalResultTeam,
    fetchFinalTeam,
    fetchJudgesGroup,
    fetchMajorAward,
    fetchMajorTeamAward,
    fetchResultFinal,
    fetchResultFinalTeam,
    fetchResultJudge,
    fetchResultJudgeTeam,
    fetchResultTest,
    fetchResultTestSystem,
    fetchResultTestSystemFinal,
    fetchResultTestSystemFinalTeam,
    fetchResultTestSystemTeam,
    fetchResultTestTeam,
    fetchTopResult,
    fetchTopResultTeam,
    JudgesGroups,
    S,
    updateJudgesGroup,
} from '@/api/result';
import { JudgeScore, MajorAward } from '@/components/table/TableResultTest';
import { JudgeScoreTeam } from '@/components/table/TableResultTestTeam';
import { JudgeScoreTest } from '@/components/table/TableResultType';
import { ApiMessageResponse, responseError, responseSuccess } from '@/lib/responseHandler';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';

const RESULT_QUERY_KEY = 'result';
const TABULATE_QUERY_KEY = 'tabulate';

// export const REFETCH_TIME = 60 * 1000;
export const STALE_TIME = 5 * 1000;

export const useCreateResultTest = (contest_id: number, group_id: string, resultType: string, roundType: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: () => createResultTest(contest_id, group_id, resultType, roundType),
        onSuccess: (response: AxiosResponse<S>) => {
            queryClient.invalidateQueries({
                queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY],
            });
            responseSuccess('Result created', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return { createResult: mutateAsync, pendingResult: isPending, ...rest };
};

export const useCreateResultSingleRound = (contest_id: number, group_id: string, resultType: string, roundType: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: () => createResultSingleRound(contest_id, group_id, resultType, roundType),
        onSuccess: (response: AxiosResponse<S>) => {
            queryClient.invalidateQueries({
                queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY],
            });
            responseSuccess('Result created', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        createResultSingleRound: mutateAsync,
        pendingResultSingleRound: isPending,
        ...rest,
    };
};

export const useCreateResultTestTeam = (contest_id: number, group_id: string, resultType: string, roundType: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: () => createResultTestTeam(contest_id, group_id, resultType, roundType),
        onSuccess: (response: AxiosResponse<S>) => {
            queryClient.invalidateQueries({
                queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY],
            });
            responseSuccess('Result created', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        createResultTeam: mutateAsync,
        pendingResultTeam: isPending,
        ...rest,
    };
};

export const useCreateResultSingleRoundTeam = (contest_id: number, group_id: string, resultType: string, roundType: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: () => createResultSingleRoundTeam(contest_id, group_id, resultType, roundType),
        onSuccess: (response: AxiosResponse<S>) => {
            queryClient.invalidateQueries({
                queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY],
            });
            responseSuccess('Result created', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        createResultSingleRoundTeam: mutateAsync,
        pendingResultSingleRoundTeam: isPending,
        ...rest,
    };
};

export const useCreateResultFinal = (contest_id: number, group_id: string, resultType: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: () => createResultFinal(contest_id, group_id, resultType),
        onSuccess: (response: AxiosResponse<S>) => {
            queryClient.invalidateQueries({
                queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY],
            });
            responseSuccess('Result created', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return { resultFinal: mutateAsync, pendingFinal: isPending, ...rest };
};

export const useResultTest = (contestId: number, groupId: string) => {
    const { data, isPending, ...rest } = useQuery<JudgeScore[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'result', 'prelim'],
        queryFn: () => fetchResultTest(contestId, groupId),
    });
    return { result: data, pendingResult: isPending, ...rest };
};

export const useResultTestTeam = (contestId: number, groupId: string) => {
    const { data, isPending, ...rest } = useQuery<JudgeScoreTeam[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'result', 'prelim', 'team'],
        queryFn: () => fetchResultTestTeam(contestId, groupId),
    });
    return { result: data, pendingResult: isPending, ...rest };
};

export const useResultJudge = (contestId: number, groupId: string, judgeId: string) => {
    const { data, isPending, ...rest } = useQuery<JudgeScore[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'result', 'judges', 'asd'],
        queryFn: () => fetchResultJudge(contestId, groupId, judgeId),
    });
    return { judgeData: data, pendingResult: isPending, ...rest };
};

export const useResultJudgeTeam = (contestId: number, groupId: string, judgeId: string) => {
    const { data, isPending, ...rest } = useQuery<JudgeScore[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'result', 'judges', 'team'],
        queryFn: () => fetchResultJudgeTeam(contestId, groupId, judgeId),
    });
    return { judgeData: data, pendingResult: isPending, ...rest };
};

export const useFinalResultTeam = (groupId: string, contestId: number) => {
    const { data, isPending, ...rest } = useQuery<MajorAward[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'final', 'result'],
        queryFn: () => fetchFinalResultTeam(groupId, contestId),
    });
    return { finalTopResult: data, pendingResultFinal: isPending, ...rest };
};

export const useFinalResult = (groupId: string, contestId: number) => {
    const { data, isPending, ...rest } = useQuery<MajorAward[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'final', 'result'],
        queryFn: () => fetchFinalResult(groupId, contestId),
    });
    return { finalTopResult: data, pendingResultFinal: isPending, ...rest };
};

export const useFinalResultSingleRound = (groupId: string, contestId: number, criteria: string) => {
    const { data, isPending, ...rest } = useQuery<MajorAward[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'final', 'result', 'single'],
        queryFn: () => fetchFinalResultSingleRound(groupId, contestId, criteria),
    });
    return {
        finalTopSingleResult: data,
        pendingResultSingle: isPending,
        ...rest,
    };
};

export const useFinalResultSingleRoundTeam = (groupId: string, contestId: number, criteria: string) => {
    const { data, isPending, ...rest } = useQuery<MajorAward[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'final', 'result', 'team', 'single'],
        queryFn: () => fetchFinalResultSingleRoundTeam(groupId, contestId, criteria),
    });
    return {
        finalTopSingleResult: data,
        pendingResultSingle: isPending,
        ...rest,
    };
};

export const useFinalTeam = (groupId: string, contestId: number) => {
    const { data, isPending, ...rest } = useQuery<MajorAward[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'final', 'result', 'team'],
        queryFn: () => fetchFinalTeam(groupId, contestId),
    });
    return { finalResults: data, pendingFinal: isPending, ...rest };
};

export const useFinal = (groupId: string, contestId: number) => {
    const { data, isPending, ...rest } = useQuery<MajorAward[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'final', 'result', 'singles'],
        queryFn: () => fetchFinal(groupId, contestId),
    });
    return { finalResults: data, pendingFinal: isPending, ...rest };
};

export const useMajorAward = (groupId: string, contestId: number) => {
    const { data, isPending, ...rest } = useQuery<MajorAward[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'major', 'award'],
        queryFn: () => fetchMajorAward(groupId, contestId),
    });
    return { award: data, pendingResult: isPending, ...rest };
};

export const useMajorTeamAward = (groupId: string, contestId: number) => {
    const { data, isPending, ...rest } = useQuery<MajorAward[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'major', 'award', 'team'],
        queryFn: () => fetchMajorTeamAward(groupId, contestId),
    });
    return { award: data, pendingResult: isPending, ...rest };
};

export const useTopResult = (groupId: string, contestId: number) => {
    const { data, isPending, ...rest } = useQuery<MajorAward[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'top', 'result'],
        queryFn: () => fetchTopResult(groupId, contestId),
    });
    return { top: data, pendingResult: isPending, ...rest };
};

export const useTopResultTeam = (groupId: string, contestId: number) => {
    const { data, isPending, ...rest } = useQuery<MajorAward[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'team', 'result'],
        queryFn: () => fetchTopResultTeam(groupId, contestId),
    });
    return { top: data, pendingResult: isPending, ...rest };
};

export const useResultTestSystemFinal = (contestId: number, groupId: string) => {
    const { data, isPending, ...rest } = useQuery<JudgeScoreTest[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'agag', 'final round', 'hh'],
        queryFn: () => fetchResultTestSystemFinal(contestId, groupId),
    });
    return { result: data, pendingResult: isPending, ...rest };
};

export const useResultTestSystemFinalTeam = (contestId: number, groupId: string) => {
    const { data, isPending, ...rest } = useQuery<JudgeScoreTest[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'agag', 'final round', 'eam'],
        queryFn: () => fetchResultTestSystemFinalTeam(contestId, groupId),
    });
    return { result: data, pendingResult: isPending, ...rest };
};

export const useResultTestSystem = (contestId: number, groupId: string) => {
    const { data, isPending, ...rest } = useQuery<JudgeScoreTest[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'asdggg'],
        queryFn: () => fetchResultTestSystem(contestId, groupId),
    });
    return { result: data, pendingResult: isPending, ...rest };
};

export const useResultTestSystemTeam = (contestId: number, groupId: string) => {
    const { data, isPending, ...rest } = useQuery<JudgeScoreTest[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'team'],
        queryFn: () => fetchResultTestSystemTeam(contestId, groupId),
    });
    return { result: data, pendingResult: isPending, ...rest };
};

export const useResultFinal = (groupId: string, contestId: number) => {
    const { data, isPending, ...rest } = useQuery<JudgeScoreTest[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'final'],
        queryFn: () => fetchResultFinal(groupId, contestId),
    });
    return { final: data, pendingResult: isPending, ...rest };
};

export const useResultFinalTeam = (groupId: string, contestId: number) => {
    const { data, isPending, ...rest } = useQuery<JudgeScoreTest[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: [TABULATE_QUERY_KEY, RESULT_QUERY_KEY, 'final', 'team', 'sd'],
        queryFn: () => fetchResultFinalTeam(groupId, contestId),
    });
    return { final: data, pendingResult: isPending, ...rest };
};

export const useJudgesGroup = (contest_id: number, group_id: string) => {
    const { data, ...rest } = useQuery<JudgesGroups>({
        queryKey: [contest_id, group_id],
        queryFn: () => fetchJudgesGroup(contest_id, group_id),
        refetchOnMount: 'always',
        // refetchInterval: REFETCH_TIME,
        staleTime: STALE_TIME,
    });
    return { judgesGroup: data, ...rest };
};

export const useUpdateJudgeScore = (contest_id: number, group_id: string) => {
    const queryClient = useQueryClient();

    const { mutateAsync, isPending, ...rest } = useMutation({
        mutationFn: ({ judgeId, criteria }: { judgeId: number; criteria: string }) => updateJudgesGroup(contest_id, group_id, judgeId, criteria),
        onSuccess: (response: AxiosResponse<S>) => {
            queryClient.invalidateQueries({
                queryKey: [contest_id, group_id],
            });
            responseSuccess('Result created', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return {
        updateJudge: mutateAsync,
        pendingUpdate: isPending,
        ...rest,
    };
};

export const useActivityLog = (groupId: string) => {
    const { data, isPending, ...rest } = useQuery<ActivityLog[]>({
        // queryKey: ["points", contest_id, group_id, "sad"],
        queryKey: ['activity'],
        queryFn: () => fetchActivityLog(groupId),
    });
    return { activity: data, pendingActivity: isPending, ...rest };
};
