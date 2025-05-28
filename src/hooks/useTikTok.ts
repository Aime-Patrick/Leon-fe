import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';
import type { TikTokVideo } from '../types/tiktok';

export const useTikTok = () => {
  const useVideos = (isAuthenticated: boolean) => {
    return useQuery({
      queryKey: ['tiktok', 'videos'],
      queryFn: async () => {
        const response = await axiosInstance.get('/api/tiktok/videos');
        return response.data as { videos: TikTokVideo[] };
      },
      enabled: isAuthenticated,
    });
  };

  const useSearchVideos = (query: string, isAuthenticated: boolean) => {
    return useQuery({
      queryKey: ['tiktok', 'search', query],
      queryFn: async () => {
        const response = await axiosInstance.get(`/api/tiktok/search?query=${encodeURIComponent(query)}`);
        return response.data as { videos: TikTokVideo[] };
      },
      enabled: isAuthenticated && query.length > 0,
    });
  };

  return {
    useVideos,
    useSearchVideos,
  };
}; 