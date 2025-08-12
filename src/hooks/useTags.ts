import type { Tags, CreateTags } from "@/interfaces/tag-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type TagsUpdatePayload = Partial<CreateTags> & { id: string };

const resourceUrl = "/tags";
const queryKey = ["tags"];

const fetchTags = (): Promise<Tags[]> => api.get(resourceUrl);

const createTag = (data: CreateTags): Promise<Tags> =>
  api.post(resourceUrl, data);

const updateTag = (data: TagsUpdatePayload): Promise<Tags> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteTag = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useTags = () => {
  const queryClient = useQueryClient();

  const {
    data: tags = [],
    isLoading: isLoadingTags,
    isError: isErrorTags,
  } = useQuery<Tags[]>({
    queryKey,
    queryFn: fetchTags,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createTag,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar tag:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateTag,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar tag:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteTag,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar tag:", error);
    },
  });

  return {
    tags,
    isLoadingTags,
    isErrorTags,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
