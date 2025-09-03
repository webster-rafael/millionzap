import type { Note, NoteCreateInput } from "@/interfaces/note-interface";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type NoteUpdatePayload = Partial<NoteCreateInput> & { id: string };

const resourceUrl = "/notes";

const fetchNotes = (contactId: string): Promise<Note[]> =>
  api.get(`${resourceUrl}/contact/${contactId}`);

const createNote = (contactId: string, data: NoteCreateInput): Promise<Note> =>
  api.post(`${resourceUrl}/${contactId}`, data);

const updateNote = async (data: NoteUpdatePayload): Promise<Note> => {
  const { id, ...payload } = data;
  return api.put(`${resourceUrl}/${id}`, payload);
};

const deleteNote = (id: string): Promise<void> =>
  api.delete(`${resourceUrl}/${id}`);

export const useNotes = (contactId: string) => {
  const queryClient = useQueryClient();

  const queryKey = ["notes", contactId];

  const {
    data: notes = [],
    isLoading: isLoadingNotes,
    isError: isErrorNotes,
  } = useQuery<Note[]>({
    queryKey,
    queryFn: () => fetchNotes(contactId),
    enabled: !!contactId,
    refetchInterval: 1000,
  });

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  const { mutate: create, isPending: isCreating } = useMutation({
    mutationFn: (data: NoteCreateInput) => createNote(contactId, data),
    onSuccess,
    onError: (error) => {
      console.error("Erro ao criar nota:", error);
    },
  });

  const { mutate: update, isPending: isUpdating } = useMutation({
    mutationFn: updateNote,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao atualizar nota:", error);
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: deleteNote,
    onSuccess,
    onError: (error) => {
      console.error("Erro ao deletar nota:", error);
    },
  });

  return {
    notes,
    isLoadingNotes,
    isErrorNotes,
    createNote: create,
    isCreating,
    updateNote: update,
    isUpdating,
    removeNote: remove,
  };
};
