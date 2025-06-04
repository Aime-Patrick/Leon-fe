import axiosInstance from "../utils/axios";

export interface InstagramProfile {
    id: string;
    username: string;
    account_type: string;
}

export interface InstagramMedia {
    id: string;
    media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL' | 'STORY';
    media_url: string;
    permalink: string;
    thumbnail_url?: string;
    caption?: string;
    timestamp: string;
    username: string;
}

export interface InstagramInsights {
    engagement: number;
    impressions: number;
    reach: number;
    saved: number;
    profile_views: number;
    follower_count: number;
}


export const instagramApi = {


    // Get user's Instagram profile
    getProfile: async () => {
        try {
            const response = await axiosInstance.get('/api/instagram/profile');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },

    // Get user's Instagram media
    getMedia: async () => {
        try {
            const response = await axiosInstance.get('/api/instagram/media');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },

    // Create a new Instagram post
    createPost: async (data: {
        image_url?: string;
        video_url?: string;
        caption?: string;
        media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL' | 'STORY';
    }) => {
        try {
            const response = await axiosInstance.post('/api/instagram/media', data);
            return response.data;
        }
        catch (error) {
            throw error;
        }
    },

    // Get Instagram insights
    getInsights: async () => {
        try {
            const response = await axiosInstance.get('/api/instagram/insights');
            return response.data;
        }
        catch (error) {
            throw error;
        }
    }
}; 