export interface Conversation {
  id: string;
  contactId: string;
  userId?: string | null;
  queueId?: string | null;
  tagId?: string | null;
  status: string;
  priority?: string | null;
  subject?: string | null;
  lastMessageAt?: Date | null;
  closedAt?: Date | null;
  createdAt: Date;
  updatedAt?: Date | null;
  contact?: ContactInfo | null;
  user?: UserInfo | null;
  messages?: MessageInfo[];
  companyId: string;
}

interface ContactInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface UserInfo {
  id: string;
  name: string;
}

interface MessageInfo {
  id: string;
  content: string;
  status?: string;
  direction: string;
  timestamp: number;
  createdAt: Date;
  messageType?: string;
  mediaUrl?: string | null;
  mediaCaption?: string | null;
}

export interface ConversationCreate {
<<<<<<< HEAD
  id: string
=======
  id: string;
>>>>>>> 9733758895e5c40bb71a599d962d86b701dfee2d
  contactId: string;
  userId?: string | null;
  queueId?: string | null;
  tagId?: string | null;
  status: string;
  priority?: string | null;
  subject?: string | null;
  lastMessageAt?: Date | null;
  closedAt?: Date | null;
  createdAt: Date;
  messages?: MessageInfo[];
  companyId: string;
}
