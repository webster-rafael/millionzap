import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Queue, QueueCreate } from "@/interfaces/queues-interface";
import { useAuth } from "@/hooks/useAuth";

type QueueUpdatePayload = Partial<QueueCreate> & { id: string };

const API_URL = import.meta.env.VITE_BACKEND_URL;

const fetchQueues = async (): Promise<Queue[]> => {
  const token = localStorage.getItem("@million-token");
  const response = await fetch(`${API_URL}/queues`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Falha ao buscar filas");
  return response.json();
};

const createQueue = async (data: QueueCreate): Promise<Queue> => {
  const token = localStorage.getItem("@million-token");
  const response = await fetch(`${API_URL}/queues`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Falha ao criar fila");
  return response.json();
};

const updateQueue = async (data: QueueUpdatePayload): Promise<Queue> => {
  const token = localStorage.getItem("@million-token");
  const { id, ...payload } = data;
  const response = await fetch(`${API_URL}/queues/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Falha ao atualizar fila");
  return response.json();
};

const deleteQueue = async (id: string): Promise<void> => {
  const token = localStorage.getItem("@million-token");
  const response = await fetch(`${API_URL}/queues/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Falha ao deletar fila");
  return;
};

export const useQueues = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const queryKey = ["queues", user?.id];

  const {
    data: queues = [],
    isLoading: isLoadingQueues,
    isError: isErrorQueues,
  } = useQuery<Queue[]>({
    queryKey: queryKey,
    queryFn: fetchQueues,
    enabled: !!user?.id,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createQueue,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar fila:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateQueue,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar fila:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteQueue,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar fila:", error);
    },
  });

  return {
    queues,
    isLoadingQueues,
    isErrorQueues,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
