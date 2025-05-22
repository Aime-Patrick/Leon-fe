import axiosInstance from '../utils/axios';
import type { Email, EmailDetails, ComposeEmail, EmailFolder } from '../types/gmail';

const BASE_URL = '/api/gmail';

export const gmailApi = {
    getEmails: async (folder: EmailFolder = 'inbox', maxResults: number = 10, pageToken?: string): Promise<{ emails: Email[], pagination: { nextPageToken?: string, resultSizeEstimate?: number } }> => {
        const params = new URLSearchParams();
        if (maxResults) params.append('maxResults', maxResults.toString());
        if (pageToken) params.append('pageToken', pageToken);
        
        const response = await axiosInstance.get(`${BASE_URL}/messages/${folder}?${params.toString()}`);
        return {
            emails: response.data.data || [],
            pagination: response.data.pagination || {}
        };
    },

    getEmailDetails: async (messageId: string): Promise<EmailDetails> => {
        const response = await axiosInstance.get(`${BASE_URL}/messages/${messageId}`);
        return response.data.data;
    },

    sendEmail: async (email: ComposeEmail): Promise<void> => {
        await axiosInstance.post(`${BASE_URL}/send`, email);
    },

    toggleStar: async (messageId: string, isStarred: boolean): Promise<void> => {
        await axiosInstance.post(`${BASE_URL}/messages/${messageId}/star`, 
            { isStarred }
        );
    },

    moveToTrash: async (messageId: string): Promise<void> => {
        await axiosInstance.post(`${BASE_URL}/messages/${messageId}/trash`, {});
    }
};

export const gmailStats = async() => {
    try {
        const response = await axiosInstance.get('/api/gmail/stats');
        return response.data;
    } catch (error) {
        throw error;
    }
};