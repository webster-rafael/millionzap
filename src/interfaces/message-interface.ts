import { IncomingTypeMessageEnum } from "../enums/incoming-type-message";

export interface IMessage {
  id: number;
  company_id: number;
  sender_id: string;
  profile: {
    name: string;
  };
  recipient_id: string;
  data_message: Date;
  type: string;
  chat: Chat;
  content: {
    text?: {
      body: string;
    };
    image?: {
      caption?: string;
    };
    from: string;
  };
  timestamp: string;
  status: string;
  is_read: boolean;
  origin: IncomingTypeMessageEnum;
}

export interface Chat {
  entry: Entry[];
  object: string;
}

export interface Entry {
  id: string;
  time: number;
  messaging: Messaging[];
}

export interface Messaging {
  sender: Recipient;
  message: Message;
  recipient: Recipient;
  timestamp: number;
}

export interface Message {
  mid: string;
  text: string;
}

export interface Recipient {
  id: string;
}
