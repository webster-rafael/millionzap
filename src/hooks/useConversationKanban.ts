import type { Conversation } from "@/interfaces/conversation-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type KanbanConversationUpdatePayload = {
  id: string;
  tagId?: string;
};

const resourceUrl = "/conversations/kanban";
const queryKey = ["conversations", "kanban"];

const fetchKanbanConversations = (): Promise<Conversation[]> =>
  api.get(resourceUrl);

const updateKanbanConversation = (
  data: KanbanConversationUpdatePayload,
): Promise<Conversation> => {
  const { id, ...payload } = data;
  return api.put(`/conversations/${id}`, payload);
};

export const useKanbanConversations = () => {
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading: isLoadingConversations,
    isError: isErrorConversations,
  } = useQuery<Conversation[]>({
    queryKey,
    queryFn: fetchKanbanConversations,
    refetchInterval: 5000,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateKanbanConversation,
    onSuccess,
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
