import type {
  CreateWhatsAppConnection,
  WhatsAppConnection,
} from "@/interfaces/whatsappConnection-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const resourceUrl = "/connections";
const queryKey = ["whatsappConnections"];

const fetchConnections = (): Promise<WhatsAppConnection[]> =>
  api.get(resourceUrl);

const createConnection = (
  newConnection: CreateWhatsAppConnection,
): Promise<WhatsAppConnection> => api.post(resourceUrl, newConnection);

const updateConnection = (
  connection: WhatsAppConnection,
): Promise<WhatsAppConnection> => {
  const { id, ...payload } = connection;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteConnection = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useWhatsAppConnections = () => {
  const queryClient = useQueryClient();

  const {
    data: whatsappConnections = [],
    isLoading,
    isError,
  } = useQuery<WhatsAppConnection[]>({
    queryKey,
    queryFn: fetchConnections,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: createConnectionMutation, isPending: isCreating } =
    useMutation({
      mutationFn: createConnection,
      onSuccess,
      onError: (error) => {
        console.error("Erro ao criar conexão:", error);
      },
    });

  const { mutate: updateConnectionMutation, isPending: isUpdating } =
    useMutation({
      mutationFn: updateConnection,
      onSuccess,
      onError: (error) => {
        console.error("Erro ao atualizar conexão:", error);
      },
    });

  const { mutate: deleteConnectionMutation } = useMutation({
    mutationFn: deleteConnection,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error("Erro ao deletar conexão:", error);
    },
  });

  return {
    connections: whatsappConnections,
    isLoadingConnection: isLoading,
    isErrorConnection: isError,
    createConnection: createConnectionMutation,
    isCreating,
    updateConnection: updateConnectionMutation,
    isUpdating,
    deleteConnection: deleteConnectionMutation,
  };
};
