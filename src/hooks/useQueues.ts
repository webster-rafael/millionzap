import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Queue, QueueCreate } from "@/interfaces/queues-interface";
import { api } from "@/services/api";

type QueueUpdatePayload = Partial<QueueCreate> & { id: string };

const resourceUrl = "/queues";
const queryKey = ["queues"];

const fetchQueues = (): Promise<Queue[]> => api.get(resourceUrl);

const createQueue = (data: QueueCreate): Promise<Queue> =>
  api.post(resourceUrl, data);

const updateQueue = (data: QueueUpdatePayload): Promise<Queue> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteQueue = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useQueues = () => {
  const queryClient = useQueryClient();

  const {
    data: queues = [],
    isLoading: isLoadingQueues,
    isError: isErrorQueues,
  } = useQuery<Queue[]>({
    queryKey,
    queryFn: fetchQueues,
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
