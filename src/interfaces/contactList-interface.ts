import type { Contact } from "./contact-interface";

export interface Campaign {
  id?: string;
  body: string;
  title?: string | null;
  imageUrl?: string | null;
  footer?: string | null;
}
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
  campaign?: Campaign | null;
}

export interface CreateContactList {
  name: string;
  description?: string | null;
  companyId: string;
  isActive: boolean;
  contactIds?: string[];
  campaign?: Campaign | null;
}

export type UpdateContactList = Partial<
  Omit<CreateContactList, "companyId">
> & {
  id: string;
};
