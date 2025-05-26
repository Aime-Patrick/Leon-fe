import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTikTokVideos, uploadTikTokVideo, CreateVideoData, TikTokVideo } from '../api/tiktokApi';
import { toast } from 'react-hot-toast';

export const useTikTokVideos = (cursor?: string) => {
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useQuery({
        queryKey: ['tiktokVideos', cursor],
        queryFn: () => getTikTokVideos(cursor),
        getNextPageParam: (lastPage) => lastPage.nextCursor,
    });

    const uploadVideoMutation = useMutation({
        mutationFn: (data: CreateVideoData) => uploadTikTokVideo(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tiktokVideos'] });
            toast.success('Video uploaded successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to upload video');
        },
    });

    const videos = data?.pages.flatMap(page => page.videos) || [];
    const nextCursor = data?.pages[data.pages.length - 1]?.nextCursor;

    return {
        videos,
        isLoading,
        error,
        uploadVideo: uploadVideoMutation.mutate,
        isUploading: uploadVideoMutation.isPending,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        nextCursor,
    };
}; 