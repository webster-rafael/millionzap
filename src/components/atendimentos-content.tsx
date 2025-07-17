"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  Phone,
  User,
  Paperclip,
  Mic,
  Send,
  MoreVertical,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Conversation {
  id: string;
  contact: {
    name: string;
    phone: string;
    avatar?: string;
  };
  lastMessage: string;
  timestamp: string;
  status: "online" | "offline" | "away";
  queue: string;
  agent: string;
  unreadCount: number;
  priority: "high" | "medium" | "low";
}

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: "customer" | "agent";
  type: "text" | "image" | "file";
  status: "sent" | "delivered" | "read";
}

const conversations: Conversation[] = [
  {
    id: "1",
    contact: {
      name: "João Silva",
      phone: "5567994634486",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage:
      "Preciso de ajuda com meu pedido, Preciso de ajuda com meu pedido,Preciso de ajuda com meu pedido",
    timestamp: "13:41",
    status: "online",
    queue: "SUPORTE",
    agent: "ADMIN",
    unreadCount: 2,
    priority: "high",
  },
  {
    id: "2",
    contact: {
      name: "Maria Santos",
      phone: "5567913517720",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: "Obrigada pelo atendimento!",
    timestamp: "11:28",
    status: "offline",
    queue: "VENDAS",
    agent: "WEBSTER",
    unreadCount: 0,
    priority: "medium",
  },
  {
    id: "3",
    contact: {
      name: "Carlos Oliveira",
      phone: "5567998765432",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: "Quando será entregue?",
    timestamp: "10:59",
    status: "away",
    queue: "LOGISTICA",
    agent: "ADMIN",
    unreadCount: 1,
    priority: "medium",
  },
  {
    id: "4",
    contact: {
      name: "João Silva",
      phone: "5567994634486",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: "Preciso de ajuda com meu pedido",
    timestamp: "13:41",
    status: "online",
    queue: "SUPORTE",
    agent: "ADMIN",
    unreadCount: 2,
    priority: "high",
  },
  {
    id: "5",
    contact: {
      name: "João Silva",
      phone: "5567994634486",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: "Preciso de ajuda com meu pedido",
    timestamp: "13:41",
    status: "online",
    queue: "SUPORTE",
    agent: "ADMIN",
    unreadCount: 2,
    priority: "high",
  },
  {
    id: "6",
    contact: {
      name: "João Silva",
      phone: "5567994634486",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: "Preciso de ajuda com meu pedido",
    timestamp: "13:41",
    status: "online",
    queue: "SUPORTE",
    agent: "ADMIN",
    unreadCount: 2,
    priority: "high",
  },
  {
    id: "7",
    contact: {
      name: "João Silva",
      phone: "5567994634486",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: "Preciso de ajuda com meu pedido",
    timestamp: "13:41",
    status: "online",
    queue: "SUPORTE",
    agent: "ADMIN",
    unreadCount: 2,
    priority: "high",
  },
];

const waitingConversations: Conversation[] = [
  {
    id: "w1",
    contact: {
      name: "Ana Costa",
      phone: "5567998123456",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage:
      "Entendo que você está falando sobre sair com alguém especial, mas essa informação não está relaci...",
    timestamp: "14:11",
    status: "away",
    queue: "SEM FILA",
    agent: "WEBSTER",
    unreadCount: 0,
    priority: "medium",
  },
  {
    id: "w2",
    contact: {
      name: "Pedro Silva",
      phone: "5567929445756",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage:
      "Boa tarde! Posso ajudar com alguma informação específica? Qual é o seu nome?",
    timestamp: "14:11",
    status: "offline",
    queue: "VENDAS",
    agent: "WEBSTER",
    unreadCount: 1,
    priority: "high",
  },
  {
    id: "w3",
    contact: {
      name: "Lucia Santos",
      phone: "5567930313571",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage:
      "Por favor, me informe seu nome para que possamos continuar a conversa",
    timestamp: "14:11",
    status: "online",
    queue: "SUPORTE",
    agent: "WEBSTER",
    unreadCount: 0,
    priority: "medium",
  },
  {
    id: "w4",
    contact: {
      name: "Roberto Lima",
      phone: "5567940123456",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage:
      "Parece que não consegui entender sua solicitação. Por favor, poderia esclarecer ou reformular a perg...",
    timestamp: "14:11",
    status: "away",
    queue: "LOGISTICA",
    agent: "WEBSTER",
    unreadCount: 2,
    priority: "low",
  },
  {
    id: "w5",
    contact: {
      name: "Fernanda Oliveira",
      phone: "5567967790175",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: "Minha zona é fazendo o que trabalho no mesmo lugar q vc",
    timestamp: "14:11",
    status: "online",
    queue: "VENDAS",
    agent: "WEBSTER",
    unreadCount: 0,
    priority: "medium",
  },
  {
    id: "w6",
    contact: {
      name: "Marcos Pereira",
      phone: "5512036318460509037",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage:
      "Mouse Bluetooth Attack Shark X6 PAW3395 por R$130,00 🖱️ Com cupom ALTLIVE18 + 493 moedas...",
    timestamp: "13:42",
    status: "offline",
    queue: "VENDAS",
    agent: "WEBSTER",
    unreadCount: 1,
    priority: "high",
  },
  {
    id: "w7",
    contact: {
      name: "Leo",
      phone: "5567999888777",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    lastMessage: "❤️",
    timestamp: "13:07",
    status: "away",
    queue: "SEM FILA",
    agent: "WEBSTER",
    unreadCount: 0,
    priority: "low",
  },
];

const messages: Message[] = [
  {
    id: "1",
    content: "Olá! Como posso ajudá-lo hoje?",
    timestamp: "14:10",
    sender: "agent",
    type: "text",
    status: "read",
  },
  {
    id: "2",
    content: "Preciso de informações sobre meu pedido #12345",
    timestamp: "14:11",
    sender: "customer",
    type: "text",
    status: "read",
  },
  {
    id: "3",
    content:
      "Claro! Vou verificar o status do seu pedido. Um momento, por favor.",
    timestamp: "14:12",
    sender: "agent",
    type: "text",
    status: "read",
  },
  {
    id: "4",
    content:
      "Seu pedido foi enviado hoje e deve chegar em 2-3 dias úteis. Aqui está o código de rastreamento: BR123456789",
    timestamp: "14:15",
    sender: "agent",
    type: "text",
    status: "delivered",
  },
];

export function AtendimentosContent() {
  const [selectedConversation, setSelectedConversation] = useState<string>("1");
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("abertas");
  const [activeSubTab, setActiveSubTab] = useState("atendendo");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "offline":
        return "bg-gray-400";
      case "away":
        return "bg-yellow-500";
      default:
        return "bg-gray-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-300";
    }
  };

  const getQueueColor = (queue: string) => {
    switch (queue) {
      case "SUPORTE":
        return "bg-blue-100 text-blue-800";
      case "VENDAS":
        return "bg-green-100 text-green-800";
      case "LOGISTICA":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCurrentConversations = () => {
    if (activeTab !== "abertas") return [];
    return activeSubTab === "atendendo" ? conversations : waitingConversations;
  };

  return (
    <div className="flex h-full">
      {/* Conversations List */}
      <div className="flex w-96 flex-col border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Atendimentos
            </h1>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input placeholder="Buscar conversas..." className="pl-10" />
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="abertas" className="text-xs">
                ABERTAS
                <Badge
                  variant="secondary"
                  className="ml-2 bg-[#00183E] text-white"
                >
                  {conversations.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resolvidas" className="text-xs">
                RESOLVIDAS
              </TabsTrigger>
              <TabsTrigger value="busca" className="text-xs">
                BUSCA
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Queue Filter */}
        <div className="border-b border-gray-200 p-4">
          <Select defaultValue="todas">
            <SelectTrigger>
              <SelectValue placeholder="Todas as filas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as filas</SelectItem>
              <SelectItem value="suporte">Suporte</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="logistica">Logística</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeSubTab === "atendendo"
                ? "border-b-2 border-[#00183E] bg-blue-50 text-[#00183E]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveSubTab("atendendo")}
          >
            ATENDENDO
            <Badge
              variant="secondary"
              className="ml-2 bg-[#00183E] text-xs text-white"
            >
              {conversations.length}
            </Badge>
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeSubTab === "aguardando"
                ? "border-b-2 border-[#00183E] bg-blue-50 text-[#00183E]"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveSubTab("aguardando")}
          >
            AGUARDANDO
            <Badge
              variant="secondary"
              className="ml-2 bg-red-500 text-xs text-white"
            >
              {waitingConversations.length}
            </Badge>
          </button>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="w-96 space-y-2 p-4">
            {getCurrentConversations().map((conversation) => (
              <Card
                key={conversation.id}
                className={`relative h-32 cursor-pointer border-l-4 transition-all hover:shadow-md ${getPriorityColor(
                  conversation.priority,
                )} ${
                  selectedConversation === conversation.id
                    ? "ring-1 ring-[#1d5cd362]"
                    : ""
                } ${activeSubTab === "aguardando" ? "bg-yellow-50" : ""}`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={
                            conversation.contact.avatar || "/placeholder.svg"
                          }
                        />
                        <AvatarFallback className="bg-[#00183E] text-white">
                          {conversation.contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(
                          conversation.status,
                        )}`}
                      />
                      {activeSubTab === "aguardando" && (
                        <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500">
                          <Clock className="h-2 w-2 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="truncate font-medium text-gray-900">
                          {conversation.contact.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">
                            {conversation.timestamp}
                          </span>
                          {activeSubTab === "aguardando" && (
                            <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                          )}
                        </div>
                      </div>

                      <p className="mb-2 truncate text-sm text-gray-600">
                        {conversation.lastMessage}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getQueueColor(
                              conversation.queue,
                            )}`}
                          >
                            {conversation.queue}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {conversation.agent}
                          </Badge>
                          {activeSubTab === "aguardando" && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-xs text-yellow-800"
                            >
                              AGUARDANDO
                            </Badge>
                          )}
                        </div>

                        {conversation.unreadCount > 0 &&
                        activeSubTab === "aguardando" ? (
                          <Badge className="absolute top-2 right-2 size-5 rounded-sm bg-red-600 text-xs text-white">
                            {conversation.unreadCount}
                          </Badge>
                        ) : conversation.unreadCount > 0 &&
                          activeSubTab === "atendendo" ? (
                          <Badge className="absolute top-2 right-2 size-5 rounded-sm bg-green-400 text-xs text-white">
                            {conversation.unreadCount}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg?height=40&width=40" />
                      <AvatarFallback className="bg-[#00183E] text-white">
                        JS
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">João Silva</h2>
                    <p className="text-sm text-gray-500">
                      +55 67 99463-4486 • Online
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === "agent"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                        message.sender === "agent"
                          ? "bg-[#00183E] text-white"
                          : "border border-gray-200 bg-white text-gray-900"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <div className="mt-1 flex items-center justify-end space-x-1">
                        <span
                          className={`text-xs ${
                            message.sender === "agent"
                              ? "text-blue-200"
                              : "text-gray-500"
                          }`}
                        >
                          {message.timestamp}
                        </span>
                        {message.sender === "agent" && (
                          <div className="flex space-x-1">
                            <div
                              className={`h-2 w-2 rounded-full ${
                                message.status === "read"
                                  ? "bg-blue-300"
                                  : message.status === "delivered"
                                    ? "bg-gray-300"
                                    : "bg-gray-400"
                              }`}
                            />
                            {message.status === "read" && (
                              <div className="h-2 w-2 rounded-full bg-blue-300" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>

                <div className="relative flex-1">
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="pr-12"
                  />
                  <Button
                    size="sm"
                    className="absolute top-1/2 right-1 -translate-y-1/2 transform bg-[#00183E] hover:bg-[#00183E]/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                <Button variant="outline" size="sm">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <MessageSquare className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha uma conversa da lista para começar a atender
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
