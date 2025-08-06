import type {
  Conversation,
  ConversationCreate,
} from "@/interfaces/conversation-interface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ConversationUpdatePayload = Partial<ConversationCreate> & { id: string };

const API_URL = import.meta.env.VITE_BACKEND_URL;
const queryKey = ["conversations"];

const fetchConversations = async (): Promise<Conversation[]> => {
  const response = await fetch(`${API_URL}/conversations`);
  if (!response.ok) throw new Error("Falha ao buscar conversas");
  return response.json();
};

const createConversation = async (
  data: ConversationCreate,
): Promise<Conversation> => {
  const response = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Falha ao criar conversa");
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

const deleteConversation = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/conversations/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Falha ao deletar conversa");
};

export const useConversations = () => {
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isErrorConversations,
  } = useQuery<Conversation[]>({
    queryKey,
    queryFn: fetchConversations,
    refetchInterval: 5000,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createConversation,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar conversa:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateConversation,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar conversa:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteConversation,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar conversa:", error);
    },
  });

  return {
    conversations,
    isLoadingConversations,
    isErrorConversations,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
