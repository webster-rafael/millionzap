import type {
  ContactList,
  CreateContactList,
} from "@/interfaces/contactList-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ContactListUpdatePayload = Partial<CreateContactList> & { id: string };

const resourceUrl = "/contact-lists";
const queryKey = ["contactLists"];

const fetchContactLists = (): Promise<ContactList[]> => api.get(resourceUrl);

const createContactList = (data: CreateContactList): Promise<ContactList> =>
  api.post(resourceUrl, data);

const updateContactList = (
  data: ContactListUpdatePayload,
): Promise<ContactList> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const fetchContactListById = (id: string): Promise<ContactList> =>
  api.get(`${resourceUrl}/${id}`);

const deleteContactList = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useContactLists = () => {
  const queryClient = useQueryClient();

  const {
    data: contactLists = [],
    isLoading: isLoadingContactLists,
    isError: isErrorContactLists,
  } = useQuery<ContactList[]>({
    queryKey,
    queryFn: fetchContactLists,
    refetchInterval: 1000,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: createContactList,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar lista de contatos:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateContactList,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar lista de contatos:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteContactList,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar lista de contatos:", error);
    },
  });

  return {
    contactLists,
    isLoadingContactLists,
    isErrorContactLists,
    createContactList: create,
    isCreating,
    updateContactList: update,
    isUpdating,
    removeContactList: remove,
    fetchContactListById,
  };
};
