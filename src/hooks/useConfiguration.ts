import type {
  Configuration,
  CreateConfiguration,
} from "@/interfaces/configuration-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ConfigurationUpdatePayload = Partial<CreateConfiguration> & { id: string };

const resourceUrl = "/configurations";
const queryKey = ["configurations"];

const fetchConfigurations = (): Promise<Configuration[]> =>
  api.get(resourceUrl);

const createConfiguration = (
  data: CreateConfiguration,
): Promise<Configuration> => api.post(resourceUrl, data);

const updateConfiguration = (
  data: ConfigurationUpdatePayload,
): Promise<Configuration> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteConfiguration = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useConfigurations = () => {
  const queryClient = useQueryClient();

  const {
    data: configurations = [],
    isLoading: isLoadingConfigurations,
    isError: isErrorConfigurations,
  } = useQuery<Configuration[]>({
    queryKey,
    queryFn: fetchConfigurations,
    refetchInterval: 1000,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createConfiguration,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar configuração:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateConfiguration,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar configuração:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteConfiguration,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar configuração:", error);
    },
  });

  return {
    configurations,
    isLoadingConfigurations,
    isErrorConfigurations,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
