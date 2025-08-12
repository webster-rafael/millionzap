import type { Contact, CreateContact } from "@/interfaces/contact-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ContactUpdatePayload = Partial<CreateContact> & { id: string };

const resourceUrl = "/contacts";
const queryKey = ["contacts"];

const fetchContacts = (): Promise<Contact[]> => api.get(resourceUrl);

const createContact = (data: CreateContact): Promise<Contact> =>
  api.post(resourceUrl, data);

const updateContact = (data: ContactUpdatePayload): Promise<Contact> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteContact = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useContacts = () => {
  const queryClient = useQueryClient();

  const {
    data: contacts = [],
    isLoading: isLoadingContacts,
    isError: isErrorContacts,
  } = useQuery<Contact[]>({
    queryKey,
    queryFn: fetchContacts,
    refetchInterval: 1000,
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
