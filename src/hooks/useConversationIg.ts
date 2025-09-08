import type {
  ConversationInstagram,
  ConversationCreate,
} from "@/interfaces/conversationInstagram-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ConversationInstagramUpdatePayload = Partial<ConversationCreate> & {
  id: string;
};

const resourceUrl = "/conversations-instagram";
const queryKey = ["conversationsInstagram"];

const fetchConversationsInstagram = (): Promise<ConversationInstagram[]> =>
  api.get(resourceUrl);

const createConversationInstagram = (
  data: ConversationCreate,
): Promise<ConversationInstagram> => api.post(resourceUrl, data);

const updateConversationInstagram = (
  data: ConversationInstagramUpdatePayload,
): Promise<ConversationInstagram> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteConversationInstagram = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useConversationsInstagram = () => {
  const queryClient = useQueryClient();

  const {
    data: conversationsInstagram = [],
    isLoading: isLoadingConversationsInstagram,
    isError: isErrorConversationsInstagram,
  } = useQuery<ConversationInstagram[]>({
    queryKey,
    queryFn: fetchConversationsInstagram,
    retry: true,
    refetchInterval: 5000,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createConversationInstagram,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar conversa Instagram:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateConversationInstagram,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar conversa Instagram:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteConversationInstagram,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar conversa Instagram:", error);
    },
  });

  return {
    conversationsInstagram,
    isLoadingConversationsInstagram,
    isErrorConversationsInstagram,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
