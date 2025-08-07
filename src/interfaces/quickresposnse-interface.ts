export interface QuickResponse {
  id: string;
  shortcut: string;
  title: string;
  message: string;
  queueId: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  companyId: string;
}

export interface CreateQuickResponsePayload {
  shortcut: string;
  title: string;
  message: string;
  queueId: string;
  companyId: string;
}

export type UpdateQuickResponsePayload = Partial<CreateQuickResponsePayload> & {
  id: string;
};
