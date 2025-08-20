export interface Prompt {
  id: string;
  title: string;
  apiKey: string;
  prompt: string;
  maxTokens: number;
  maxMessages: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  temperature?: number;
  assistantId?: string;
  description?: string;
  companyResume: string;
  createdAt: Date;
  updatedAt: Date;
  isActive?: boolean;
  companyId: string;
  queueId?: string;
}
export interface PromptCreate {
  title: string;
  apiKey: string;
  prompt: string;
  maxTokens: number;
  maxMessages: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  temperature?: number;
  assistantId?: string;
  description?: string;
  companyResume: string;
  isActive?: boolean;
  companyId: string;
  queueId?: string;
}
