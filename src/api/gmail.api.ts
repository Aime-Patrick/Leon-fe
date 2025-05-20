import axiosInstance from "../utils/axios";

const BASE_URL = '/api/gmail';

export interface Email {
    id: string;
    from: string;
    subject: string;
    snippet: string;
    date: string;
    isRead: boolean;
    isStarred?: boolean;
}

export interface ComposeEmail {
    to: string;
    subject: string;
    body: string;
}

export interface EmailDetails extends Email {
    body: string;
}

export type EmailFolder = 'inbox' | 'sent' | 'trash' | 'starred';

const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('gmail_access_token')}`
});

export const gmailApi = {
    getEmails: async (folder: EmailFolder = 'inbox'): Promise<Email[]> => {
        const response = await axiosInstance.get(`${BASE_URL}/messages`, {
            headers: getAuthHeader(),
            params: { folder }
        });
        return response.data.messages;
    },

    getEmailDetails: async (messageId: string): Promise<EmailDetails> => {
        const response = await axiosInstance.get(`${BASE_URL}/messages/${messageId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    },

    sendEmail: async (email: ComposeEmail): Promise<void> => {
        await axiosInstance.post(`${BASE_URL}/send`, email, {
            headers: getAuthHeader()
        });
    },

    toggleStar: async (messageId: string, isStarred: boolean): Promise<void> => {
        await axiosInstance.post(`${BASE_URL}/messages/${messageId}/star`, 
            { isStarred },
            { headers: getAuthHeader() }
        );
    },

    moveToTrash: async (messageId: string): Promise<void> => {
        await axiosInstance.post(`${BASE_URL}/messages/${messageId}/trash`, {}, {
            headers: getAuthHeader()
        });
    }
}; 