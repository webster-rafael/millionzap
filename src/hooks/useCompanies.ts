import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Company, CreateCompany } from "@/interfaces/company-interface";
import { api } from "@/services/api";

type CompanyUpdatePayload = Partial<CreateCompany> & { id: string };

const resourceUrl = "/companies";
const queryKey = ["companies"];

const fetchCompanies = (): Promise<Company[]> => api.get(resourceUrl);

const createCompany = (data: CreateCompany): Promise<Company> =>
  api.post(resourceUrl, data);

const updateCompany = (data: CompanyUpdatePayload): Promise<Company> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteCompany = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useCompanies = () => {
  const queryClient = useQueryClient();

  const {
    data: companies = [],
    isLoading: isLoadingCompanies,
    isError: isErrorCompanies,
  } = useQuery<Company[]>({
    queryKey,
    queryFn: fetchCompanies,
    refetchInterval: 5000,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createCompany,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar empresa:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateCompany,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar empresa:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteCompany,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar empresa:", error);
    },
  });

  return {
    companies,
    isLoadingCompanies,
    isErrorCompanies,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
