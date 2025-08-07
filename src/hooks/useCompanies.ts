import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Company, CreateCompany } from "@/interfaces/company-interface";

type CompanyUpdatePayload = Partial<CreateCompany> & { id: string };

interface CustomError extends Error {
  code?: string;
}

const API_URL = import.meta.env.VITE_BACKEND_URL;
const queryKey = ["companies"];

const fetchCompanies = async (): Promise<Company[]> => {
  const response = await fetch(`${API_URL}/companies`);
  if (!response.ok) throw new Error("Falha ao buscar empresas");
  return response.json();
};

const createCompany = async (data: CreateCompany): Promise<Company> => {
  const response = await fetch(`${API_URL}/companies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error = new Error(
      errorData?.message || "Falha ao criar empresa",
    ) as CustomError;
    error.code = errorData?.code;
    throw error;
  }

  return response.json();
};

const updateCompany = async (data: CompanyUpdatePayload): Promise<Company> => {
  const { id, ...payload } = data;
  const response = await fetch(`${API_URL}/companies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error("Falha ao atualizar empresa");
  return response.json();
};

const deleteCompany = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/companies/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Falha ao deletar empresa");
};

export const useCompanies = () => {
  const queryClient = useQueryClient();

  const {
    data: companies = [],
    isLoading: isLoadingCompanies,
    isError: isErrorCompanies,
  } = useQuery<Company[]>({
    queryKey,
    queryFn: fetchCompanies,
    refetchInterval: 1000,
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
