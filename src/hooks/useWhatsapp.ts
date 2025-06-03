import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { getMessages, sendMessage, getMessagesByPhoneNumber } from "../api/whatsappAPI";

export const useWhatsapp = () => {
  const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ["messages"],
        queryFn: getMessages,
    });

    const sendMessageMutation = useMutation({
        mutationFn: ({ to, message }: { to: string; message: string }) => sendMessage(to, message),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
        onError: (error) => {
            console.error("Error sending message:", error);
        }
    })
    const getMessagesByPhoneNumberMutation = useMutation({
        mutationFn: (phoneNumber: string) => getMessagesByPhoneNumber(phoneNumber),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
        },
        onError: (error) => {
            console.error("Error fetching messages by phone number:", error);
        }
    })

  return {
     data,
    isLoading,
    error,
    sendMessage: sendMessageMutation.mutate,
    sendMessageLoading: sendMessageMutation.isPending,
    sendMessageSuccess: sendMessageMutation.isSuccess,
    getMessagesByPhoneNumber: getMessagesByPhoneNumberMutation.mutate,
    getMessagesByPhoneNumberLoading: getMessagesByPhoneNumberMutation.isPending,
  };
};