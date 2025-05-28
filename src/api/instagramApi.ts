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

const INSTAGRAM_SCOPES = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish',
    'instagram_business_manage_insights'
].join(',');

export const instagramApi = {
    // Initialize Instagram OAuth flow
    initiateAuth: async () => {
        const authUrl = `https://www.instagram.com/oauth/authorize?` +
            `enable_fb_login=0` +
            `&force_authentication=1` +
            `&client_id=${import.meta.env.VITE_INSTAGRAM_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(import.meta.env.VITE_INSTAGRAM_REDIRECT_URI)}` +
            `&response_type=code` +
            `&scope=${INSTAGRAM_SCOPES}`;

        return { authUrl };
    },

    // Get user's Instagram profile
    getProfile: async () => {
        const response = await axiosInstance.get('/api/instagram/profile');
        return response.data as InstagramProfile;
    },

    // Get user's Instagram media
    getMedia: async () => {
        const response = await axiosInstance.get('/api/instagram/media');
        return response.data as InstagramMedia[];
    },

    // Create a new Instagram post
    createPost: async (data: {
        image_url?: string;
        video_url?: string;
        caption?: string;
        media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM' | 'REEL' | 'STORY';
    }) => {
        const response = await axiosInstance.post('/api/instagram/media', data);
        return response.data;
    },

    // Get Instagram insights
    getInsights: async () => {
        const response = await axiosInstance.get('/api/instagram/insights');
        return response.data as InstagramInsights;
    }
}; 