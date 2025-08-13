import type {
  CreateQuickResponsePayload,
  QuickResponse,
  UpdateQuickResponsePayload,
} from "@/interfaces/quickresposnse-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type QuickResponseUpdatePayload = Partial<UpdateQuickResponsePayload> & {
  id: string;
};

const resourceUrl = "/quick-responses";
const queryKey = ["quickResponses"];

const fetchQuickResponses = (): Promise<QuickResponse[]> =>
  api.get(resourceUrl);

const createQuickResponse = (
  data: CreateQuickResponsePayload,
): Promise<QuickResponse> => api.post(resourceUrl, data);

const updateQuickResponse = (
  data: QuickResponseUpdatePayload,
): Promise<QuickResponse> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteQuickResponse = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useQuickResponses = () => {
  const queryClient = useQueryClient();

  const {
    data: quickResponses = [],
    isLoading: isLoadingQuickResponses,
    isError: isErrorQuickResponses,
  } = useQuery<QuickResponse[]>({
    queryKey,
    queryFn: fetchQuickResponses,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createQuickResponse,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar resposta rápida:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateQuickResponse,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar resposta rápida:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteQuickResponse,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar resposta rápida:", error);
    },
  });

  return {
    quickResponses,
    isLoadingQuickResponses,
    isErrorQuickResponses,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
