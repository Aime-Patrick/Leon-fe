import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axios';
import type {  ComposeEmail, EmailFolder } from '../types/gmail';
const normalizeFolder = (folder: EmailFolder): EmailFolder => {
  return folder.toUpperCase() as EmailFolder;
};

export const useGmail = () => {
    const queryClient = useQueryClient();

    const useEmails = (folder: EmailFolder = 'INBOX', enabled: boolean = true) => {
        return useQuery({
            queryKey: ['emails', folder],
            queryFn: async () => {
                const normalizedFolder = normalizeFolder(folder);
                const response = await axiosInstance.get(`/api/gmail/emails/${normalizedFolder}`);
                return response.data;
            },
            enabled,
            refetchInterval: 30000, // Refetch every 30 seconds
        });
    };

    const useEmailDetails = (messageId: string | undefined) => {
        return useQuery({
            queryKey: ['email', messageId],
            queryFn: async () => {
                const response = await axiosInstance.get(`/api/gmail/emails/${messageId}`);
                return response.data;
            },
            enabled: !!messageId,
        });
    };

    const useSendEmail = () => {
        return useMutation({
            mutationFn: async (email: ComposeEmail) => {
                // Convert string[] to string if needed
                const emailToSend = {
                    ...email,
                    to: Array.isArray(email.to) ? email.to.join(', ') : email.to
                };
                const response = await axiosInstance.post('/api/gmail/send', emailToSend);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['emails'] });
            },
        });
    };

    const useToggleStar = () => {
        return useMutation({
            mutationFn: async ({ messageId, isStarred }: { messageId: string; isStarred: boolean }) => {
                const response = await axiosInstance.put(`/api/gmail/emails/${messageId}/star`, { isStarred });
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['emails'] });
            },
        });
    };

    const useMoveToTrash = () => {
        return useMutation({
            mutationFn: async (messageId: string) => {
                const response = await axiosInstance.delete(`/api/gmail/emails/${messageId}`);
                return response.data;
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['emails'] });
            },
        });
    };

    return {
        useEmails,
        useEmailDetails,
        useSendEmail,
        useToggleStar,
        useMoveToTrash,
    };
}; 