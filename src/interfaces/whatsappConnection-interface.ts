export interface WhatsAppConnection {
  id: string;
  name: string;
  isDefault: boolean;
  greetingMessage?: string | null;
  conclusionMessage?: string | null;
  outOfOfficeHoursMessage?: string | null;
  reviewMessage?: string | null;
  token?: string | null;
  queueId?: string | null;
  integrationId?: string | null;
  userId?: string | null;
  promptId?: string | null;
  transferQueueId?: string | null;
  timeToTransfer?: string | null;
  expiresInactiveMessage?: string | null;
  companyId?: string | null;
  session: string;
  instanceName?: string | null;
  instanceId?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWhatsAppConnection {
  name: string;
  isDefault: boolean;
  greetingMessage?: string | null;
  conclusionMessage?: string | null;
  outOfOfficeHoursMessage?: string | null;
  reviewMessage?: string | null;
  token?: string | null;
  queueId?: string | null;
  companyId?: string | null;
  promptId?: string | null;
  transferQueueId?: string | null;
  timeToTransfer?: string | null;
  expiresInactiveMessage?: string | null;
  session: string;
  instanceName?: string | null;
  instanceId?: string | null;
  status: string;
}
