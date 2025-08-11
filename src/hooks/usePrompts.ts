import type { Prompt, PromptCreate } from "@/interfaces/prompt-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const resourceUrl = "/prompts";
const queryKey = ["prompts"];

const fetchPrompts = (): Promise<Prompt[]> => api.get(resourceUrl);

const createPrompt = (newPrompt: PromptCreate): Promise<Prompt> =>
  api.post(resourceUrl, newPrompt);

const updatePrompt = (prompt: Prompt): Promise<Prompt> => {
  const { id, ...payload } = prompt;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deletePrompt = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

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
