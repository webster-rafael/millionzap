interface UserInfo {
  id: string;
  name: string;
}
interface ConversationInstagramInfo {
  id: string;
  name: string;
  username: string;
  image: string;
}

export interface MessageInstagram {
  id: string;
  conversationInstagramId: string;
  userId: string | null;
  content: string;
  messageType: string;
  plataform: string | null;
  direction: string;
  timestamp: string;
  createdAt: Date;
  updatedAt: Date | null;
  companyId: string | null;
  user?: UserInfo | null;
  conversation?: ConversationInstagramInfo;
}
