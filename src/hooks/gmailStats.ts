import { useQuery } from '@tanstack/react-query';
import { gmailStats } from '../api/gmail.api';

export const userGmailStats = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["gmailStats"],
        queryFn: gmailStats,
        refetchInterval: 1000,
        refetchOnWindowFocus: false,
    });

    return {
        data,
        isLoading,
        error
    }
}