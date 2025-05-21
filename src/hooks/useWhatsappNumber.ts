import { useQuery } from '@tanstack/react-query';
import { getWhatsappUsers } from '../api/whatsappAPI';


export const useWhatsappStats = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["stats"],
        queryFn: getWhatsappUsers,
        refetchInterval: 1000,
        refetchOnWindowFocus: false,
    });

    return {
        whatsappStats:data,
        whatsappStatsLoading:isLoading,
        whatsappStatsError:error
    }
}