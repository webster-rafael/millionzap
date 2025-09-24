export interface CopilotFeedbackResponse {
  conversationId: string;
  companyId: string;
  feedback: Feedback;
}

export interface Feedback {
  analiseCompleta: AnaliseCompleta;
  avaliacaoGeral: AvaliacaoGeral;
  analiseCriterios: AnaliseCriterio[];
  rascunhoResposta: string;
  quebraDeObjecoes: QuebraDeObjecao[];
  perguntasEstrategicas: string[];
  respostasEstrategicas: string[];
  sugestaoFollowUp: SugestaoFollowUp;
}

export interface AnaliseCompleta {
  pontosFortes: string[];
  pontosFracos: string[];
  proximosPassos: string[];
  errosACorrigir: string[];
}

export interface AvaliacaoGeral {
  pontuacao: string;
  status: string;
}

export interface AnaliseCriterio {
  criterio: string;
  avaliacao: string;
  feedback: string;
}

export interface QuebraDeObjecao {
  objecaoProvavel: string;
  contraArgumento: string;
}

export interface SugestaoFollowUp {
  cenario: string;
  opcoes: string[];
}
