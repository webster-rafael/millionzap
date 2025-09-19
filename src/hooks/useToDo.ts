import type { ToDo, CreateToDo, UpdateToDo } from "@/interfaces/todo-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ToDoUpdatePayload = UpdateToDo & { id: string };

const resourceUrl = "/todos";
const queryKey = ["todos"];

const fetchToDos = (): Promise<ToDo[]> => api.get(resourceUrl);

const createToDo = (data: CreateToDo): Promise<ToDo> =>
  api.post(resourceUrl, data);

const updateToDo = (data: ToDoUpdatePayload): Promise<ToDo> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteToDo = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

// Hook
export const useToDos = () => {
  const queryClient = useQueryClient();

  const {
    data: todos = [],
    isLoading: isLoadingTodos,
    isError: isErrorTodos,
  } = useQuery<ToDo[]>({
    queryKey,
    queryFn: fetchToDos,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createToDo,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar ToDo:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateToDo,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar ToDo:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteToDo,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar ToDo:", error);
    },
  });

  return {
    todos,
    isLoading: isLoadingTodos,
    isErrorTodos,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
