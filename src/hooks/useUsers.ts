import type { User, UserCreate } from "@/interfaces/user-interface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CustomError extends Error {
  code?: string;
}

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL + "/users";
const queryKey = ["users"];

const fetchUsers = async (): Promise<User[]> => {
  const response = await fetch(API_BASE_URL);
  if (!response.ok) throw new Error("Falha ao buscar usuários");
  return response.json();
};

const createUser = async (newUser: UserCreate): Promise<User> => {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newUser),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error = new Error(
      errorData?.message || "Falha ao criar contato",
    ) as CustomError;
    error.code = errorData?.code;
    throw error;
  }
  return response.json();
};

const updateUser = async (user: User): Promise<User> => {
  const { id, ...payload } = user;
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Falha ao atualizar usuário");
  return response.json();
};

const deleteUser = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (response.status === 204) return;
  if (!response.ok) throw new Error("Falha ao deletar usuário");
};

export const useUsers = () => {
  const queryClient = useQueryClient();

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery<User[]>({
    queryKey,
    queryFn: fetchUsers,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: createUserMutation, isPending: isCreating } = useMutation({
    mutationFn: createUser,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar usuário:", error);
    },
  });

  const { mutate: updateUserMutation, isPending: isUpdating } = useMutation({
    mutationFn: updateUser,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar usuário:", error);
    },
  });

  const { mutate: deleteUserMutation } = useMutation({
    mutationFn: deleteUser,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      console.error("Erro ao deletar usuário:", error);
    },
  });

  return {
    users,
    isLoading,
    isError,
    createUser: createUserMutation,
    isCreating,
    updateUser: updateUserMutation,
    isUpdating,
    deleteUser: deleteUserMutation,
  };
};
