import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';

export const useAuth = () => {
    const { data: user, isLoading } = useQuery({
        queryKey: ['auth'],
        queryFn: async () => {
            try {
                const response = await axiosInstance.get('/api/auth/me');
                return response.data;
            } catch (error) {
                return null;
            }
        }
    });

    return {
        isAuthenticated: !!user,
        user,
        isLoading
    };
}; 