
import type { Contact } from "./contact-interface";
interface ContactListOnContact {
  contactId: string;
  contactListId: string;
  contact: Contact;
}

export interface ContactList {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt?: string | null;
  contactCount?: number;
  contacts: ContactListOnContact[];
}

export interface CreateContactList {
  name: string;
  description?: string | null;
  companyId: string;
  isActive: boolean;
  contactIds?: string[];
}