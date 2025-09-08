import type { MessageInstagram } from "@/interfaces/messageInstagram-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface MessageInstagramCreate {
  conversationInstagramId: string;
  userId?: string | null;
  content: string;
  messageType: string;
  plataform?: string | null;
  direction: string;
  timestamp: string;
  companyId?: string | null;
}

export interface MessageInstagramUpdate
  extends Partial<MessageInstagramCreate> {
  id: string;
}

const resourceUrl = "/messages-instagram";
const queryKey = ["messagesInstagram"];

const fetchMessagesInstagram = (): Promise<MessageInstagram[]> =>
  api.get(resourceUrl);

const createMessageInstagram = (
  data: MessageInstagramCreate,
): Promise<MessageInstagram> => api.post(resourceUrl, data);

const updateMessageInstagram = (
  data: MessageInstagramUpdate,
): Promise<MessageInstagram> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteMessageInstagram = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useMessagesInstagram = () => {
  const queryClient = useQueryClient();

  const {
    data: messagesInstagram = [],
    isLoading: isLoadingMessagesInstagram,
    isError: isErrorMessagesInstagram,
  } = useQuery<MessageInstagram[]>({
    queryKey,
    queryFn: fetchMessagesInstagram,
    retry: true,
    refetchInterval: 5000,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createMessageInstagram,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar mensagem Instagram:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateMessageInstagram,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar mensagem Instagram:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteMessageInstagram,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar mensagem Instagram:", error);
    },
  });

  return {
    messagesInstagram,
    isLoadingMessagesInstagram,
    isErrorMessagesInstagram,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
