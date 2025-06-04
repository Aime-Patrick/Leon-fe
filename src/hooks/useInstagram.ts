import {useQuery } from '@tanstack/react-query';
import { instagramApi } from '../api/instagramApi';

export const useInstagram = () => {

    const useProfile = () => {
        return useQuery({
            queryKey: ['instagramProfile'],
            queryFn: () => instagramApi.getProfile(),
        });
    };

    const useMedia = () => {
        return useQuery({
            queryKey: ['instagramMedia'],
            queryFn: () => instagramApi.getMedia(),
        });
    };


    const useInsights = () => {
        return useQuery({
            queryKey: ['instagramInsights'],
            queryFn: () => instagramApi.getInsights(),
        });
    };

    return {
        useProfile,
        useMedia,
        useInsights,
    };
};