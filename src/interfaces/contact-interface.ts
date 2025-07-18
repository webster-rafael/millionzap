export interface Contact {
  id: string;
  name: string;
  phone: string;
  platform: "facebook" | "instagram";
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  profilePicture?: string;
  status: string;
  messages: string[];
}
