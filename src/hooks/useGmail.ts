import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gmailApi, Email, ComposeEmail, EmailDetails, EmailFolder } from '../api/gmail.api';

export const useGmail = () => {
    const queryClient = useQueryClient();

    const useEmails = (folder: EmailFolder = 'inbox', enabled: boolean = true) => {
        return useQuery({
            queryKey: ['emails', folder],
            queryFn: () => gmailApi.getEmails(folder),
            enabled,
            refetchInterval: 30000, // Refetch every 30 seconds
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
            mutationFn: gmailApi.sendEmail,
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