import { AccountType, createAccount, createJudge, deleteAccount, fetchAccount, updateAccount } from '@/api/account';
import { ApiMessageResponse, responseError, responseSuccess } from '@/lib/responseHandler';

import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';

const ACCOUNT_QUERY_KEY = 'account';

export const useCreateJudge = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData }) => createJudge(payload.data),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({ queryKey: [ACCOUNT_QUERY_KEY] });
            responseSuccess('Account created successfully!', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return { createJudge: mutateAsync, ...rest };
};

export const useCreateAccount = () => {
    const queryClient = useQueryClient();

    const { mutateAsync, ...rest } = useMutation({
        mutationFn: (payload: { data: FormData }) => createAccount(payload.data),
        onSuccess: (response: AxiosResponse<ApiMessageResponse>) => {
            queryClient.invalidateQueries({ queryKey: [ACCOUNT_QUERY_KEY] });
            responseSuccess('Account created successfully!', response);
        },
        onError: (error: AxiosError<ApiMessageResponse>) => {
            responseError('An error occurred!', error);
        },
    });

    return { createAccount: mutateAsync, ...rest };
};

export const useAccount = () => {
    const { data, isPending, ...rest } = useQuery<AccountType>({
        queryKey: [ACCOUNT_QUERY_KEY],
        queryFn: fetchAccount,
    });
    return { account: data, pendingAccount: isPending, ...rest };
};

export const useDeleteAccount = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: { id: string }) => deleteAccount(payload.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACCOUNT_QUERY_KEY] });
            toast.success('Account deleted successfully');
        },
        onError: () => {
            toast.error('An error occurred');
        },
    });
};

export const useUpdateAccount = () => {
    const queryClient = new QueryClient();

    return useMutation({
        mutationFn: (payload: { data: { password: string; password_confirmation: string }; id: string }) => updateAccount(payload.data, payload.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [ACCOUNT_QUERY_KEY] });
            toast.success('Account edited successfully');
        },
        onError: () => {
            toast.error('An error occurred');
        },
    });
};
