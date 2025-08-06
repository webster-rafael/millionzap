import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Conversation } from "@/interfaces/conversation-interface";

const API_URL = import.meta.env.VITE_SEND_MESSAGE_WEBHOOK;
const queryKey = ["conversations"];

type SendMessagePayload = {
  recipientNumber: string;
  messageBody: string;
  conversationId: string;
  timestamp: number;
};

const sendMessageApi = async (data: SendMessagePayload) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Falha ao enviar mensagem");
  }

  return response.json();
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  const {
    mutate: send,
    isPending: isSending,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: sendMessageApi,

    onMutate: async (newMessageData) => {
      await queryClient.cancelQueries({ queryKey });

      const previousConversations = queryClient.getQueryData<Conversation[]>(queryKey);

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content: newMessageData.messageBody,
        timestamp: newMessageData.timestamp,
        status: "PENDING",
        direction: "OUTBOUND",
        createdAt: new Date(),
      };

      queryClient.setQueryData<Conversation[]>(queryKey, (old) => {
        return (
          old?.map((convo) =>
            convo.id === newMessageData.conversationId
              ? {
                  ...convo,
                  messages: [...(convo.messages || []), optimisticMessage],
                }
              : convo
          ) || []
        );
      });

      return { previousConversations };
    },

    onError: (err, newMessage, context) => {
      if (context?.previousConversations) {
        queryClient.setQueryData(queryKey, context.previousConversations);
      }
      console.error("Erro ao enviar mensagem:", err);
    },

   
  });

  return {
    send,
    isSending,
    isError,
    isSuccess,
  };
};
