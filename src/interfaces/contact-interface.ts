import type { Note } from "@/interfaces/note-interface";

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  image?: string | null;
  notes?: Note[];
  whatsappId?: string | null;
  companyId: string;
  isCustomer?: boolean | null;
  userId?: string | null;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContact {
  name: string;
  phone: string;
  email?: string | null;
  image?: string | null;
  notes?: Note[];
  isCustomer?: boolean | null;
  whatsappId?: string | null;
  tags?: string[];
  companyId: string;
  userId?: string | null;
}
