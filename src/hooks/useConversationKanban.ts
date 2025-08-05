import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Conversation } from "@/interfaces/conversation-interface";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const KANBAN_CONVERSATIONS_KEY = ["conversations", "kanban"];

type ConversationUpdatePayload = {
  id: string;
  tagId?: string;
};

const fetchKanbanConversations = async (): Promise<Conversation[]> => {
  const response = await fetch(`${API_URL}/conversations/kanban`);
  if (!response.ok) throw new Error("Falha ao buscar conversas para o Kanban");
  return response.json();
};

const updateConversation = async (
  data: ConversationUpdatePayload,
): Promise<Conversation> => {
  const { id, ...payload } = data;
  const response = await fetch(`${API_URL}/conversations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Falha ao atualizar conversa");
  return response.json();
};

export const useKanbanConversations = () => {
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isErrorConversations,
  } = useQuery<Conversation[]>({
    queryKey: KANBAN_CONVERSATIONS_KEY,
    queryFn: fetchKanbanConversations,
    refetchInterval: 5000,
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KANBAN_CONVERSATIONS_KEY });
    },
    onError: (error) => {
      console.error("Erro ao atualizar conversa no Kanban:", error);
    },
  });

  return {
    conversations,
    isLoadingConversations,
    isErrorConversations,
    update,
    isUpdating,
  };
};
