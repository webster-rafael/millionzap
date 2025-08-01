import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Contact, CreateContact } from "@/interfaces/contact-interface";

type ContactUpdatePayload = Partial<CreateContact> & { id: string };

interface CustomError extends Error {
  code?: string;
}

const API_URL = import.meta.env.VITE_BACKEND_URL;
const queryKey = ["contacts"];

const fetchContacts = async (): Promise<Contact[]> => {
  const response = await fetch(`${API_URL}/contacts`);
  if (!response.ok) throw new Error("Falha ao buscar contatos");
  return response.json();
};

const createContact = async (data: CreateContact): Promise<Contact> => {
  const response = await fetch(`${API_URL}/contacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
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

const updateContact = async (data: ContactUpdatePayload): Promise<Contact> => {
  const { id, ...payload } = data;
  const response = await fetch(`${API_URL}/contacts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Falha ao atualizar contato");
  return response.json();
};

const deleteContact = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/contacts/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Falha ao deletar contato");
};

export const useContacts = () => {
  const queryClient = useQueryClient();

  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
    isError: isErrorContacts,
  } = useQuery<Contact[]>({
    queryKey,
    queryFn: fetchContacts,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createContact,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar contato:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateContact,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar contato:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteContact,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar contato:", error);
    },
  });

  return {
    contacts,
    isLoadingContacts,
    isErrorContacts,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  };
};
