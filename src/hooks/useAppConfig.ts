import { useQuery } from '@tanstack/react-query';
import { getAppConfig } from '../api/appConfigApi';

export const useAppConfig = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["AppConfig"],
        queryFn: getAppConfig,
        refetchInterval: 1000,
        refetchOnWindowFocus: false,
    });

    return {
        data,
        isLoading,
        error
    }
}