import type {
  CreateQuickResponsePayload,
  QuickResponse,
  UpdateQuickResponsePayload,
} from "@/interfaces/quickresposnse-interface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + "/quick-responses";
const queryKey = ["quickResponses"];

const fetchQuickResponses = async (): Promise<QuickResponse[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error("Falha ao buscar respostas rápidas");
  return response.json();
};

const createQuickResponse = async (
  newResponse: CreateQuickResponsePayload,
): Promise<QuickResponse> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newResponse),
  });
  if (!response.ok) throw new Error("Falha ao criar resposta rápida");
  return response.json();
};

const updateQuickResponse = async (
  data: UpdateQuickResponsePayload,
): Promise<QuickResponse> => {
  const { id, ...payload } = data;
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Falha ao atualizar resposta rápida");
  return response.json();
};

const deleteQuickResponse = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (response.status === 204) {
    return;
  }
  if (!response.ok) throw new Error("Falha ao deletar resposta rápida");
  return;
};

export const useQuickResponses = () => {
  const queryClient = useQueryClient();

  const {
    data: responses = [],
    isLoading,
    isError,
  } = useQuery<QuickResponse[]>({
    queryKey,
    queryFn: fetchQuickResponses,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: createResponse, isPending: isCreating } = useMutation({
    mutationFn: createQuickResponse,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar resposta rápida:", error);
    },
  });

  const { mutate: updateResponse, isPending: isUpdating } = useMutation({
    mutationFn: updateQuickResponse,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar resposta rápida:", error);
    },
  });

  const { mutate: deleteResponse } = useMutation({
    mutationFn: deleteQuickResponse,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error("Erro ao deletar resposta rápida:", error);
    },
  });

  return {
    responses,
    isLoading,
    isError,
    createResponse,
    isCreating,
    updateResponse,
    isUpdating,
    deleteResponse,
  };
};
