export interface ConversationInstagram {
  id: string;
  name: string;
  username: string;
  image: string;
  userId?: string | null;
  queueId?: string | null;
  tagId?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  user?: UserInfo | null;
  messages?: MessageInstagramInfo[];
  companyId: string;
}

interface UserInfo {
  id: string;
  name: string;
}

export interface MessageInstagramInfo {
  id: string;
  content: string;
  direction: string;
  timestamp: number;
  messageType: string;
  createdAt: Date;
}

export interface ConversationCreate {
  id: string;
  contactId: string;
  userId?: string | null;
  queueId?: string | null;
  tagId?: string | null;
  createdAt: Date;
  messages?: MessageInstagramInfo[];
  companyId: string;
}
