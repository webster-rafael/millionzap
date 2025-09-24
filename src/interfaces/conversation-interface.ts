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
  copilot: boolean | null;
  copilotFeedback?: CopilotFeedback | null;
  statusCopilot?: string | null;
}

interface ContactInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  image?: string | null;
  notes?: string | null;
  isCustomer?: boolean | null;
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
  messages?: MessageInfo[];
  companyId: string;
  copilot?: boolean | null;
  copilotFeedback?: CopilotFeedback | null;
  statusCopilot?: string | null;
}

export interface CopilotFeedback {
  feedback: {
    avaliacaoGeral: {
      status: "Crítico" | "Atenção" | "Bom" | "Excelente";
      pontuacao: string;
    };
    analiseCompleta: {
      pontosFortes: string[];
      pontosFracos: string[];
      errosACorrigir: string[];
      proximosPassos: string[];
    };
    analiseCriterios: {
      criterio: string;
      feedback: string;
      avaliacao: string;
    }[];
    quebraDeObjecoes: {
      contraArgumento: string;
      objecaoProvavel: string;
    }[];
    rascunhoResposta: string;
    sugestaoFollowUp: {
      opcoes: string[];
      cenario: string;
    };
    perguntasEstrategicas: string[];
    respostasEstrategicas: string[];
  };
  companyId: string;
  conversationId: string;
}
