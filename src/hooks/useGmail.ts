// hooks/useGmail.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ComposeEmail, EmailFolder } from '../types/gmail';
import { gmailApi } from '../api/gmail.api'; // <-- Import your API module

export const useGmail = () => {
    const queryClient = useQueryClient();

    const useEmails = (folder: EmailFolder, isAuthenticated: boolean, maxResults: number = 10, pageToken?: string) => {
        return useQuery({
            queryKey: ['emails', folder, pageToken],
            queryFn: () => gmailApi.getEmails(folder, maxResults, pageToken),
            enabled: isAuthenticated,
        });
    };

    const useEmailDetails = (messageId: string | undefined) => {
        return useQuery({
            queryKey: ['email', messageId],
            queryFn: () => gmailApi.getEmailDetails(messageId!),
            enabled: !!messageId,
        });
    };

    const useSendEmail = () => {
        return useMutation({
            mutationFn: (email: ComposeEmail) => gmailApi.sendEmail(email),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['emails'] });
            },
        });
    };

    const useToggleStar = () => {
        return useMutation({
            mutationFn: ({ messageId, isStarred }: { messageId: string; isStarred: boolean }) =>
                gmailApi.toggleStar(messageId, isStarred),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['emails'] });
            },
        });
    };

    const useMoveToTrash = () => {
        return useMutation({
            mutationFn: (messageId: string) => gmailApi.moveToTrash(messageId),
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
