export interface QuickResponse {
  id: string;
  shortcut: string;
  title: string;
  message: string;
  queueId: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface CreateQuickResponsePayload {
  shortcut: string;
  title: string;
  message: string;
  queueId: string;
}

export type UpdateQuickResponsePayload = Partial<CreateQuickResponsePayload> & {
  id: string;
};
