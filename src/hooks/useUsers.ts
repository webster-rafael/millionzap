import type { User, UserCreate } from "@/interfaces/user-interface";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";

type UserUpdatePayload = {
  id: string;
  data: Partial<UserCreate>;
};

const resourceUrl = "/users";
const queryKey = ["users"];

const fetchUsers = (): Promise<User[]> => api.get(resourceUrl);

const createUser = (newUser: UserCreate): Promise<User> =>
  api.post(resourceUrl, newUser);

const updateUser = ({ id, data }: UserUpdatePayload): Promise<User> => {
  return api.put(`${resourceUrl}/${id}`, data);
};

const deleteUser = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

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
