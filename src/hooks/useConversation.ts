import type {
  Conversation,
  ConversationCreate,
} from "@/interfaces/conversation-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ConversationUpdatePayload = Partial<ConversationCreate> & { id: string };

const resourceUrl = "/conversations";
const queryKey = ["conversations"];

const fetchConversations = (): Promise<Conversation[]> => api.get(resourceUrl);

const createConversation = (data: ConversationCreate): Promise<Conversation> =>
  api.post(resourceUrl, data);

const updateConversation = (
  data: ConversationUpdatePayload,
): Promise<Conversation> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteConversation = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useConversations = () => {
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isErrorConversations,
  } = useQuery<Conversation[]>({
    queryKey,
    queryFn: fetchConversations,
    retry: true,
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
