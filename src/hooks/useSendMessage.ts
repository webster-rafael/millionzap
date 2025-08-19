import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Conversation } from "@/interfaces/conversation-interface";

const API_URL = import.meta.env.VITE_SEND_MESSAGE_WEBHOOK;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const queryKey = ["conversations"];

export type SendMessagePayload = {
  recipientNumber: string;
  conversationId: string;
  timestamp: number;
  type: "text" | "audio";
  messageBody?: string;
  audioBase64?: string;
  instance: string;
};

const sendMessageApi = async (data: SendMessagePayload) => {
  const instanceName = data.instance;
  let body: Record<string, unknown> = {};

  if (data.type === "audio" && data.audioBase64) {
    const fileName = `audio_${Date.now()}.m4a`;
    const uploadResp = await fetch(`${BACKEND_URL}/media/audios/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "sk_live_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890aBcDeF",
      },
      body: JSON.stringify({
        fileName,
        data: data.audioBase64,
        mimeType: "audio/aac",
      }),
    });

    if (!uploadResp.ok) throw new Error("Falha ao enviar áudio para o backend");
    const uploadData = await uploadResp.json();
    const audioUrl = uploadData.url;

    body = {
      type: "audio",
      recipientNumber: data.recipientNumber,
      audioUrl,
      conversationId: data.conversationId,
      timestamp: data.timestamp,
    };
  } else {
    body = {
      type: "text",
      recipientNumber: data.recipientNumber,
      messageBody: data.messageBody || "",
      conversationId: data.conversationId,
      timestamp: data.timestamp,
      instance: instanceName,
    };
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error("Falha ao enviar mensagem");
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

      const previousConversations =
        queryClient.getQueryData<Conversation[]>(queryKey);

      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        content:
          newMessageData.type === "audio" && newMessageData.audioBase64
            ? "[Áudio enviado]"
            : newMessageData.messageBody || "",
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
              : convo,
          ) || []
        );
      });

      return { previousConversations };
    },

    onError: (err, _newMessage, context) => {
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
