import type { Prompt, PromptCreate } from "@/interfaces/prompt-interface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + "/prompts";
const queryKey = ["prompts"];

const fetchPrompts = async (): Promise<Prompt[]> => {
  const token = localStorage.getItem("@million-token");
  const response = await fetch(API_BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Falha ao buscar prompts");
  return response.json();
};

const createPrompt = async (newPrompt: PromptCreate): Promise<Prompt> => {
  const token = localStorage.getItem("@million-token");
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(newPrompt),
  });
  if (!response.ok) throw new Error("Falha ao criar prompt");
  return response.json();
};

const updatePrompt = async (prompt: Prompt): Promise<Prompt> => {
  const token = localStorage.getItem("@million-token");
  const { id, ...payload } = prompt;
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Falha ao atualizar prompt");
  return response.json();
};

const deletePrompt = async (id: string): Promise<void> => {
  const token = localStorage.getItem("@million-token");
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (response.status === 204) return;
  if (!response.ok) throw new Error("Falha ao deletar prompt");
};

export const usePrompts = () => {
  const queryClient = useQueryClient();

  const {
    data: prompts = [],
    isLoading,
    isError,
  } = useQuery<Prompt[]>({
    queryKey,
    queryFn: fetchPrompts,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: createPromptMutation, isPending: isCreating } = useMutation({
    mutationFn: createPrompt,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar prompt:", error);
    },
  });

  const { mutate: updatePromptMutation, isPending: isUpdating } = useMutation({
    mutationFn: updatePrompt,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar prompt:", error);
    },
  });

  const { mutate: deletePromptMutation } = useMutation({
    mutationFn: deletePrompt,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error("Erro ao deletar prompt:", error);
    },
  });

  return {
    prompts,
    isLoading,
    isError,
    createPrompt: createPromptMutation,
    isCreating,
    updatePrompt: updatePromptMutation,
    isUpdating,
    deletePrompt: deletePromptMutation,
  };
};
