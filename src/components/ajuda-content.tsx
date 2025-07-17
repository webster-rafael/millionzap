"use client";

import { useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Play,
  Book,
  MessageCircle,
  Phone,
  Settings,
  Zap,
  CreditCard,
  AlertCircle,
  Send,
  X,
  Bot,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpful: number;
  notHelpful: number;
}

interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  thumbnail: string;
  videoUrl: string;
  views: number;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "Como começar a usar o MillionZAP?",
    answer:
      "Para começar a usar o MillionZAP, primeiro você precisa conectar seu WhatsApp Business. Vá até 'Conexões' no menu Administração, clique em 'Nova Conexão' e siga o tutorial de QR Code. Após conectar, configure sua primeira fila de atendimento em 'Filas & Chatbot'.",
    category: "primeiros-passos",
    tags: ["início", "configuração", "whatsapp", "conexão"],
    helpful: 45,
    notHelpful: 2,
  },
  {
    id: "2",
    question: "Como conectar meu WhatsApp Business?",
    answer:
      "1. Acesse o menu 'Administração' > 'Conexões'\n2. Clique em 'Nova Conexão'\n3. Escaneie o QR Code com seu WhatsApp Business\n4. Aguarde a confirmação da conexão\n5. Configure o nome da sessão e salve",
    category: "primeiros-passos",
    tags: ["whatsapp", "conexão", "qr code", "business"],
    helpful: 38,
    notHelpful: 1,
  },
  {
    id: "3",
    question: "Como transferir um atendimento para outro agente?",
    answer:
      "Durante um atendimento ativo, clique no menu de opções (3 pontos) no canto superior direito da conversa. Selecione 'Transferir Atendimento', escolha o agente de destino e adicione uma observação se necessário. O novo agente receberá uma notificação.",
    category: "atendimentos",
    tags: ["transferir", "agente", "atendimento"],
    helpful: 52,
    notHelpful: 3,
  },
  {
    id: "4",
    question: "Como criar respostas rápidas?",
    answer:
      "Vá até 'Respostas Rápidas' no menu principal. Clique em 'Nova Resposta', defina um atalho (ex: /ola), escreva o título e a mensagem. Você pode usar variáveis como {{nome}} e {{empresa}} para personalizar. Salve e use digitando o atalho durante os atendimentos.",
    category: "atendimentos",
    tags: ["respostas rápidas", "atalhos", "mensagens", "variáveis"],
    helpful: 41,
    notHelpful: 0,
  },
  {
    id: "5",
    question: "Como configurar o chatbot?",
    answer:
      "Acesse 'Administração' > 'Filas & Chatbot'. Clique em 'Novo Chatbot', defina as mensagens de saudação, crie fluxos de conversa com botões e respostas automáticas. Configure palavras-chave para ativação e defina quando transferir para um agente humano.",
    category: "configuracoes",
    tags: ["chatbot", "automação", "fluxos", "palavras-chave"],
    helpful: 29,
    notHelpful: 5,
  },
  {
    id: "6",
    question: "Como integrar com CRM externo?",
    answer:
      "Utilizamos webhook para integrações. Vá em 'Administração' > 'API', gere sua chave de API e configure os endpoints. Documentação completa disponível em nossa API docs. Para CRMs populares como HubSpot, temos integrações prontas em 'Integrações'.",
    category: "integracoes",
    tags: ["crm", "api", "webhook", "integração"],
    helpful: 33,
    notHelpful: 7,
  },
  {
    id: "7",
    question: "Meu WhatsApp desconectou, o que fazer?",
    answer:
      "Desconexões podem ocorrer por inatividade ou mudanças no WhatsApp Business. Vá em 'Conexões', localize sua sessão, clique em 'Reconectar' e escaneie o novo QR Code. Se persistir, delete a sessão e crie uma nova conexão.",
    category: "problemas-tecnicos",
    tags: ["desconexão", "reconectar", "qr code", "sessão"],
    helpful: 67,
    notHelpful: 4,
  },
  {
    id: "8",
    question: "Como alterar meu plano?",
    answer:
      "Para alterar seu plano, acesse 'Administração' > 'Financeiro'. Clique em 'Alterar Plano', escolha o novo plano desejado e confirme. As mudanças são aplicadas imediatamente. Para downgrade, entre em contato com nosso suporte.",
    category: "billing",
    tags: ["plano", "upgrade", "billing", "pagamento"],
    helpful: 25,
    notHelpful: 2,
  },
  {
    id: "9",
    question: "Como criar tags personalizadas?",
    answer:
      "Vá até 'Tags' no menu principal. Clique em 'Nova Tag', defina nome, cor e se deseja criar uma coluna no Kanban. Você pode usar tags para organizar contatos, categorizar atendimentos e criar relatórios segmentados.",
    category: "configuracoes",
    tags: ["tags", "organização", "kanban", "categorias"],
    helpful: 18,
    notHelpful: 1,
  },
  {
    id: "10",
    question: "Como agendar mensagens?",
    answer:
      "Na tela de atendimentos, ao digitar uma mensagem, clique no ícone de relógio ao lado do botão enviar. Selecione data e horário desejados. A mensagem será enviada automaticamente no horário agendado.",
    category: "atendimentos",
    tags: ["agendar", "mensagens", "horário", "automático"],
    helpful: 31,
    notHelpful: 3,
  },
];

const videoTutorials: VideoTutorial[] = [
  {
    id: "1",
    title: "Primeiros Passos no MillionZAP",
    description:
      "Tutorial completo para configurar sua conta e realizar os primeiros atendimentos",
    duration: "8:45",
    category: "primeiros-passos",
    thumbnail: "/placeholder.svg?height=200&width=300",
    videoUrl: "#",
    views: 1250,
  },
  {
    id: "2",
    title: "Como Conectar WhatsApp Business",
    description:
      "Passo a passo para conectar seu número do WhatsApp Business ao sistema",
    duration: "5:30",
    category: "primeiros-passos",
    thumbnail: "/placeholder.svg?height=200&width=300",
    videoUrl: "#",
    views: 980,
  },
  {
    id: "3",
    title: "Configurando Respostas Rápidas",
    description:
      "Aprenda a criar e usar respostas rápidas para agilizar seus atendimentos",
    duration: "6:15",
    category: "atendimentos",
    thumbnail: "/placeholder.svg?height=200&width=300",
    videoUrl: "#",
    views: 756,
  },
  {
    id: "4",
    title: "Criando Fluxos de Chatbot",
    description:
      "Como configurar chatbots inteligentes para automatizar atendimentos",
    duration: "12:20",
    category: "configuracoes",
    thumbnail: "/placeholder.svg?height=200&width=300",
    videoUrl: "#",
    views: 634,
  },
  {
    id: "5",
    title: "Integrações e API",
    description: "Conecte o MillionZAP com outros sistemas usando nossa API",
    duration: "10:15",
    category: "integracoes",
    thumbnail: "/placeholder.svg?height=200&width=300",
    videoUrl: "#",
    views: 445,
  },
  {
    id: "6",
    title: "Relatórios e Analytics",
    description:
      "Extraia insights valiosos dos seus atendimentos com nossos relatórios",
    duration: "7:40",
    category: "configuracoes",
    thumbnail: "/placeholder.svg?height=200&width=300",
    videoUrl: "#",
    views: 567,
  },
];

const categories = [
  {
    id: "primeiros-passos",
    name: "Primeiros Passos",
    icon: Book,
    color: "bg-blue-100 text-blue-800",
  },
  {
    id: "atendimentos",
    name: "Atendimentos",
    icon: MessageCircle,
    color: "bg-green-100 text-green-800",
  },
  {
    id: "configuracoes",
    name: "Configurações",
    icon: Settings,
    color: "bg-purple-100 text-purple-800",
  },
  {
    id: "integracoes",
    name: "Integrações",
    icon: Zap,
    color: "bg-orange-100 text-orange-800",
  },
  {
    id: "problemas-tecnicos",
    name: "Problemas Técnicos",
    icon: AlertCircle,
    color: "bg-red-100 text-red-800",
  },
  {
    id: "billing",
    name: "Billing",
    icon: CreditCard,
    color: "bg-yellow-100 text-yellow-800",
  },
];

const botResponses: { [key: string]: string } = {
  ola: "Olá! 👋 Sou o assistente virtual do MillionZAP. Como posso ajudá-lo hoje?",
  "como conectar whatsapp":
    "Para conectar seu WhatsApp Business:\n1. Vá em Administração > Conexões\n2. Clique em 'Nova Conexão'\n3. Escaneie o QR Code\n4. Aguarde a confirmação\n\nPrecisa de mais detalhes?",
  "respostas rapidas":
    "Para criar respostas rápidas:\n1. Acesse 'Respostas Rápidas'\n2. Clique em 'Nova Resposta'\n3. Defina um atalho (ex: /ola)\n4. Escreva sua mensagem\n5. Use variáveis como {{nome}}\n\nQuer saber sobre variáveis disponíveis?",
  chatbot:
    "Para configurar seu chatbot:\n1. Vá em Filas & Chatbot\n2. Clique em 'Novo Chatbot'\n3. Configure saudação e fluxos\n4. Defina palavras-chave\n5. Configure transferência para agentes\n\nPrecisa de ajuda específica?",
  default:
    "Desculpe, não entendi sua pergunta. Você pode:\n\n• Pesquisar na nossa base de conhecimento\n• Ver nossos vídeos tutoriais\n• Falar com nosso suporte técnico\n\nDigite 'suporte' para falar com um agente humano.",
  suporte:
    "Vou transferir você para nosso suporte técnico. Em breve um agente entrará em contato!\n\n📞 Telefone: (67) 99999-9999\n📧 Email: suporte@millionzap.com\n💬 WhatsApp: Clique no botão abaixo",
  obrigado:
    "De nada! Fico feliz em ajudar! 😊\n\nSe precisar de mais alguma coisa, estarei aqui. Você também pode explorar nossa base de conhecimento ou assistir aos vídeos tutoriais.",
  videos:
    "Temos vários vídeos tutoriais disponíveis:\n\n• Primeiros Passos (8:45)\n• Conectar WhatsApp (5:30)\n• Respostas Rápidas (6:15)\n• Configurar Chatbot (12:20)\n• Integrações (10:15)\n\nQual tutorial te interessa?",
};

export function AjudaContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Olá! 👋 Sou o assistente virtual do MillionZAP. Como posso ajudá-lo hoje?",
      sender: "bot",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");

  const filteredFAQ = faqData.filter((item) => {
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredVideos = videoTutorials.filter((video) => {
    const matchesSearch =
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      !selectedCategory || video.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: chatInput.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);

    // Bot response logic
    setTimeout(() => {
      const input = chatInput.toLowerCase().trim();
      let botResponse = botResponses.default;

      // Simple keyword matching
      if (
        input.includes("ola") ||
        input.includes("oi") ||
        input.includes("olá")
      ) {
        botResponse = botResponses.ola;
      } else if (input.includes("whatsapp") || input.includes("conectar")) {
        botResponse = botResponses["como conectar whatsapp"];
      } else if (input.includes("resposta") && input.includes("rapida")) {
        botResponse = botResponses["respostas rapidas"];
      } else if (input.includes("chatbot") || input.includes("bot")) {
        botResponse = botResponses.chatbot;
      } else if (input.includes("suporte") || input.includes("ajuda")) {
        botResponse = botResponses.suporte;
      } else if (input.includes("obrigad") || input.includes("valeu")) {
        botResponse = botResponses.obrigado;
      } else if (input.includes("video") || input.includes("tutorial")) {
        botResponse = botResponses.videos;
      }

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };

      setChatMessages((prev) => [...prev, botMessage]);
    }, 1000);

    setChatInput("");
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative space-y-6 p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Central de Ajuda
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Encontre respostas para suas dúvidas, assista tutoriais e aprenda a
          usar todos os recursos do MillionZAP
        </p>
      </div>

      {/* Search */}
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Pesquise por dúvidas, tutoriais ou palavras-chave..."
              className="h-12 pl-12 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Categorias</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory === category.id
                    ? "ring-opacity-50 ring-2 ring-[#00183E]"
                    : ""
                }`}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === category.id ? null : category.id,
                  )
                }
              >
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`rounded-lg p-3 ${category.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Perguntas Frequentes
            </h2>
            <Badge variant="secondary" className="bg-[#00183E] text-white">
              {filteredFAQ.length} artigos
            </Badge>
          </div>

          <div className="space-y-4">
            {filteredFAQ.map((faq) => {
              const categoryInfo = getCategoryInfo(faq.category);
              return (
                <Card
                  key={faq.id}
                  className="transition-shadow hover:shadow-md"
                >
                  <Collapsible
                    open={expandedFAQ === faq.id}
                    onOpenChange={() =>
                      setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center space-x-2">
                              {categoryInfo && (
                                <Badge
                                  className={`${categoryInfo.color} text-xs`}
                                >
                                  {categoryInfo.name}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-left text-lg">
                              {faq.question}
                            </CardTitle>
                          </div>
                          <div className="ml-4">
                            {expandedFAQ === faq.id ? (
                              <ChevronDown className="h-5 w-5 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <div className="prose prose-sm max-w-none">
                          <p className="whitespace-pre-line text-gray-700">
                            {faq.answer}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                          <div className="flex flex-wrap gap-1">
                            {faq.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-500">
                              Esta resposta foi útil?
                            </span>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <ThumbsUp className="mr-1 h-4 w-4" />
                                {faq.helpful}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <ThumbsDown className="mr-1 h-4 w-4" />
                                {faq.notHelpful}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Video Tutorials Section */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Vídeo Tutoriais
            </h2>
            <Badge variant="secondary" className="bg-[#00183E] text-white">
              {filteredVideos.length} vídeos
            </Badge>
          </div>

          <div className="space-y-4">
            {filteredVideos.map((video) => {
              const categoryInfo = getCategoryInfo(video.category);
              return (
                <Card
                  key={video.id}
                  className="cursor-pointer transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="h-32 w-full rounded-lg object-cover"
                      />
                      <div className="bg-opacity-30 absolute inset-0 flex items-center justify-center rounded-lg bg-black">
                        <div className="bg-opacity-90 rounded-full bg-white p-3">
                          <Play className="h-6 w-6 text-[#00183E]" />
                        </div>
                      </div>
                      <div className="bg-opacity-75 absolute right-2 bottom-2 rounded bg-black px-2 py-1 text-xs text-white">
                        {video.duration}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {categoryInfo && (
                        <Badge className={`${categoryInfo.color} text-xs`}>
                          {categoryInfo.name}
                        </Badge>
                      )}
                      <h3 className="line-clamp-2 font-medium text-gray-900">
                        {video.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-gray-600">
                        {video.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {video.views.toLocaleString()} visualizações
                        </span>
                        <ExternalLink className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Support */}
          <Card className="mt-8">
            <CardContent className="p-6 text-center">
              <Phone className="mx-auto mb-4 h-12 w-12 text-[#00183E]" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Precisa de mais ajuda?
              </h3>
              <p className="mb-4 text-gray-600">
                Nossa equipe está pronta para ajudar você
              </p>
              <div className="space-y-2">
                <Button className="w-full bg-[#00183E] hover:bg-[#00183E]/90">
                  <Phone className="mr-2 h-4 w-4" />
                  Falar com Suporte
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Suporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chat Bot Floating Button */}
      <div className="fixed right-6 bottom-6 z-50">
        {!chatOpen ? (
          <Button
            onClick={() => setChatOpen(true)}
            className="h-16 w-16 rounded-full bg-[#00183E] shadow-lg hover:bg-[#00183E]/90"
          >
            <Bot className="h-8 w-8 text-white" />
          </Button>
        ) : (
          <Card className="h-96 w-80 shadow-xl">
            <CardHeader className="rounded-t-lg bg-[#00183E] text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-white text-[#00183E]">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-sm">
                      Assistente MillionZAP
                    </CardTitle>
                    <p className="text-xs text-blue-200">Online agora</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setChatOpen(false)}
                  className="text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex h-80 flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs ${
                          message.sender === "user" ? "order-2" : "order-1"
                        }`}
                      >
                        {message.sender === "bot" && (
                          <div className="mb-1 flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-[#00183E] text-xs text-white">
                                <Bot className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500">
                              Assistente
                            </span>
                          </div>
                        )}
                        <div
                          className={`rounded-lg px-3 py-2 text-sm ${
                            message.sender === "user"
                              ? "rounded-br-sm bg-[#00183E] text-white"
                              : "rounded-bl-sm bg-gray-100 text-gray-900"
                          }`}
                        >
                          <p className="whitespace-pre-line">
                            {message.content}
                          </p>
                        </div>
                        <div
                          className={`mt-1 text-xs text-gray-500 ${
                            message.sender === "user"
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="border-t border-gray-200 p-3">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Digite sua dúvida..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    className="text-sm"
                  />
                  <Button
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim()}
                    size="sm"
                    className="bg-[#00183E] hover:bg-[#00183E]/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
