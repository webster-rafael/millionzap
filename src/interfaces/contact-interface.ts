export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  whatsappId?: string | null;
  companyId?: string | null;
  isCostumer?: boolean | null;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContact {
  name: string;
  phone: string;
  email?: string | null;
  whatsappId?: string | null;
  isCostumer?: boolean | null;
  tags?: string[];
}
