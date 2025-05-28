/* eslint-disable */
import { useQuery, useMutation } from '@tanstack/react-query';
import { getTikTokLoginUrl, getTikTokAccountInfo, type TikTokAccountInfo } from '../api/tiktokApi';
import { toast } from 'react-hot-toast';

export const useTikTokAccount = () => {
    const {
        data: accountInfo,
        isLoading,
        error,
        refetch
    } = useQuery<TikTokAccountInfo>({
        queryKey: ['tiktokAccount'],
        queryFn: getTikTokAccountInfo,
        retry: false,
    });

    const getLoginUrlMutation = useMutation({
        mutationFn: getTikTokLoginUrl,
        onSuccess: (url) => {
            window.location.href = url;
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to initiate TikTok login');
        },
    });

    const isConnected = !!accountInfo;

    return {
        accountInfo,
        isLoading,
        error,
        isConnected,
        connect: getLoginUrlMutation.mutate,
        isConnecting: getLoginUrlMutation.isPending,
        refetch,
    };
}; 