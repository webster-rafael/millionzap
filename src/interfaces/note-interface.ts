export interface Note {
  id: string;
  content: string;
  userId: string;
  contactId: string;
  createdAt: Date;
}
export interface NoteCreateInput {
  content: string;
  userId: string;
  contactId: string;
}
