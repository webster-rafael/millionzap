import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Tags, CreateTags } from "@/interfaces/tag-interface";

type TagsUpdatePayload = Partial<CreateTags> & { id: string };

const API_URL = import.meta.env.VITE_BACKEND_URL;
const queryKey = ["tags"];

const fetchTags = async (): Promise<Tags[]> => {
  const token = localStorage.getItem("@million-token");
  const response = await fetch(`${API_URL}/tags`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Falha ao buscar tags");
  return response.json();
};

const createTag = async (data: CreateTags): Promise<Tags> => {
  const token = localStorage.getItem("@million-token");
  const response = await fetch(`${API_URL}/tags`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Falha ao criar tag");
  return response.json();
};

const updateTag = async (data: TagsUpdatePayload): Promise<Tags> => {
  const token = localStorage.getItem("@million-token");
  const { id, ...payload } = data;
  const response = await fetch(`${API_URL}/tags/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Falha ao atualizar tag");
  return response.json();
};

const deleteTag = async (id: string): Promise<void> => {
  const token = localStorage.getItem("@million-token");
  const response = await fetch(`${API_URL}/tags/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Falha ao deletar tag");
};

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
