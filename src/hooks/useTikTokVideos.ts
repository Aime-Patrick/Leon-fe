import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTikTokVideos, uploadTikTokVideo, type CreateVideoData} from '../api/tiktokApi';
import { toast } from 'react-hot-toast';

export const useTikTokVideos = (cursor?: string) => {
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['tiktokVideos', cursor],
        queryFn: () => getTikTokVideos(cursor),
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


    return {
        videos:data,
        isLoading,
        error,
        uploadVideo: uploadVideoMutation.mutate,
        isUploading: uploadVideoMutation.isPending,
    };
}; 