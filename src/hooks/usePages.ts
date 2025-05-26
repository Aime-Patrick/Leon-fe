import { useQuery } from '@tanstack/react-query';
import { getPages } from '../api/facebookApi';


export const usePage = () => {
    const { data: pages, isLoading: isPagesLoading, error:pageError } = useQuery({
        queryKey: ['facebook-pages'],
        queryFn: getPages,
    });

    return {
        pages,
        isPagesLoading,
        pageError
    }
}