import type {
  CreateWhatsAppConnection,
  WhatsAppConnection,
} from "@/interfaces/whatsappConnection-interface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + "/whatsapp-connections";
const queryKey = ["whatsappConnections"];

const fetchConnections = async (): Promise<WhatsAppConnection[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error("Falha ao buscar conexões WhatsApp");
  return response.json();
};

const createConnection = async (
  newConnection: CreateWhatsAppConnection,
): Promise<WhatsAppConnection> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newConnection),
  });
  if (!response.ok) throw new Error("Falha ao criar conexão WhatsApp");
  return response.json();
};

const updateConnection = async (
  connection: WhatsAppConnection,
): Promise<WhatsAppConnection> => {
  const { id, ...payload } = connection;
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Falha ao atualizar conexão WhatsApp");
  return response.json();
};

const deleteConnection = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (response.status === 204) return;
  if (!response.ok) throw new Error("Falha ao deletar conexão WhatsApp");
};

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
    whatsappConnections,
    isLoading,
    isError,
    createConnection: createConnectionMutation,
    isCreating,
    updateConnection: updateConnectionMutation,
    isUpdating,
    deleteConnection: deleteConnectionMutation,
  };
};
