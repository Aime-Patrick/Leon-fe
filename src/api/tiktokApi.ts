import axiosInstance from "../utils/axios";

export interface TikTokAccountInfo {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    followersCount: number;
    followingCount: number;
    likesCount: number;
    videoCount: number;
    lastUpdated: string;
}

export interface TikTokVideo {
    id: string;
    description: string;
    createTime: string;
    coverImageUrl: string;
    videoUrl: string;
    duration: number;
    height: number;
    width: number;
    shareCount: number;
    commentCount: number;
    likeCount: number;
    viewCount: number;
    privacyLevel: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
}

export interface TikTokVideoStats {
    videoId: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    saveCount: number;
    lastUpdated: string;
}

export interface CreateVideoData {
    description: string;
    video?: File;
    coverImage?: File;
    privacyLevel: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
}


export const getTikTokLoginUrl = async (): Promise<string> => {
    const response = await axiosInstance.get(`/api/tiktok/auth/login`);
    return response.data;
};

export const getTikTokAccountInfo = async (): Promise<TikTokAccountInfo> => {
    const response = await axiosInstance.get(`/api/tiktok/account`);
    return response.data;
};

export const uploadTikTokVideo = async (data: CreateVideoData): Promise<TikTokVideo> => {
    if (!data.video) {
        throw new Error('Video file is required');
    }

    const formData = new FormData();
    formData.append('description', data.description);
    formData.append('video', data.video);
    if (data.coverImage) {
        formData.append('coverImage', data.coverImage);
    }
    formData.append('privacyLevel', data.privacyLevel);

    const response = await axiosInstance.post(`/api/tiktok/videos`, formData);
    return response.data;
};

export const getTikTokVideos = async (cursor?: string): Promise<{ videos: TikTokVideo[]; nextCursor?: string }> => {
    const response = await axiosInstance.get(`/api/tiktok/videos`, {
        params: { cursor },
    });
    return response.data;
};

export const getTikTokVideoStats = async (videoId: string): Promise<TikTokVideoStats> => {
    const response = await axiosInstance.get(`/api/tiktok/videos/${videoId}/stats`);
    return response.data;
}; 