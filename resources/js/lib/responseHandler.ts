
import { AxiosError, AxiosResponse } from 'axios';
import { toast } from 'sonner';
export interface ApiMessageResponse {
    message: string;
    errors?: Record<string, string[]>;
}
export const responseSuccess = (message: string, response: AxiosResponse<{ message: string }>) => {
    const res = response.data?.message || message;
    toast.success(res);
};

export const responseError = (message: string, error: AxiosError<ApiMessageResponse>) => {
    const err = error?.response?.data.message || message;
    toast.error(err);
};
