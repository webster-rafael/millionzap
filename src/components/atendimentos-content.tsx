import { useRef, useState } from "react";
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
import type { Contact } from "@/interfaces/contact-interface";
import { useParams } from "react-router-dom";
import { useMessages } from "@/hooks/useMessages";

// const conversations: Conversation[] = [
//   {
//     id: "1",
//     contact: {
//       name: "João Silva",
//       phone: "5567994634486",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage:
//       "Preciso de ajuda com meu pedido, Preciso de ajuda com meu pedido,Preciso de ajuda com meu pedido",
//     timestamp: "13:41",
//     status: "online",
//     queue: "SUPORTE",
//     agent: "ADMIN",
//     unreadCount: 2,
//     priority: "high",
//   },
//   {
//     id: "2",
//     contact: {
//       name: "Maria Santos",
//       phone: "5567913517720",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage: "Obrigada pelo atendimento!",
//     timestamp: "11:28",
//     status: "offline",
//     queue: "VENDAS",
//     agent: "WEBSTER",
//     unreadCount: 0,
//     priority: "medium",
//   },
//   {
//     id: "3",
//     contact: {
//       name: "Carlos Oliveira",
//       phone: "5567998765432",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage: "Quando será entregue?",
//     timestamp: "10:59",
//     status: "away",
//     queue: "LOGISTICA",
//     agent: "ADMIN",
//     unreadCount: 1,
//     priority: "medium",
//   },
//   {
//     id: "4",
//     contact: {
//       name: "João Silva",
//       phone: "5567994634486",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage: "Preciso de ajuda com meu pedido",
//     timestamp: "13:41",
//     status: "online",
//     queue: "SUPORTE",
//     agent: "ADMIN",
//     unreadCount: 2,
//     priority: "high",
//   },
//   {
//     id: "5",
//     contact: {
//       name: "João Silva",
//       phone: "5567994634486",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage: "Preciso de ajuda com meu pedido",
//     timestamp: "13:41",
//     status: "online",
//     queue: "SUPORTE",
//     agent: "ADMIN",
//     unreadCount: 2,
//     priority: "high",
//   },
//   {
//     id: "6",
//     contact: {
//       name: "João Silva",
//       phone: "5567994634486",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage: "Preciso de ajuda com meu pedido",
//     timestamp: "13:41",
//     status: "online",
//     queue: "SUPORTE",
//     agent: "ADMIN",
//     unreadCount: 2,
//     priority: "high",
//   },
//   {
//     id: "7",
//     contact: {
//       name: "João Silva",
//       phone: "5567994634486",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage: "Preciso de ajuda com meu pedido",
//     timestamp: "13:41",
//     status: "online",
//     queue: "SUPORTE",
//     agent: "ADMIN",
//     unreadCount: 2,
//     priority: "high",
//   },
// ];

// const waitingConversations: Conversation[] = [
//   {
//     id: "w1",
//     contact: {
//       name: "Ana Costa",
//       phone: "5567998123456",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage:
//       "Entendo que você está falando sobre sair com alguém especial, mas essa informação não está relaci...",
//     timestamp: "14:11",
//     status: "away",
//     queue: "SEM FILA",
//     agent: "WEBSTER",
//     unreadCount: 0,
//     priority: "medium",
//   },
//   {
//     id: "w2",
//     contact: {
//       name: "Pedro Silva",
//       phone: "5567929445756",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage:
//       "Boa tarde! Posso ajudar com alguma informação específica? Qual é o seu nome?",
//     timestamp: "14:11",
//     status: "offline",
//     queue: "VENDAS",
//     agent: "WEBSTER",
//     unreadCount: 1,
//     priority: "high",
//   },
//   {
//     id: "w3",
//     contact: {
//       name: "Lucia Santos",
//       phone: "5567930313571",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage:
//       "Por favor, me informe seu nome para que possamos continuar a conversa",
//     timestamp: "14:11",
//     status: "online",
//     queue: "SUPORTE",
//     agent: "WEBSTER",
//     unreadCount: 0,
//     priority: "medium",
//   },
//   {
//     id: "w4",
//     contact: {
//       name: "Roberto Lima",
//       phone: "5567940123456",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage:
//       "Parece que não consegui entender sua solicitação. Por favor, poderia esclarecer ou reformular a perg...",
//     timestamp: "14:11",
//     status: "away",
//     queue: "LOGISTICA",
//     agent: "WEBSTER",
//     unreadCount: 2,
//     priority: "low",
//   },
//   {
//     id: "w5",
//     contact: {
//       name: "Fernanda Oliveira",
//       phone: "5567967790175",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage: "Minha zona é fazendo o que trabalho no mesmo lugar q vc",
//     timestamp: "14:11",
//     status: "online",
//     queue: "VENDAS",
//     agent: "WEBSTER",
//     unreadCount: 0,
//     priority: "medium",
//   },
//   {
//     id: "w6",
//     contact: {
//       name: "Marcos Pereira",
//       phone: "5512036318460509037",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage:
//       "Mouse Bluetooth Attack Shark X6 PAW3395 por R$130,00 🖱️ Com cupom ALTLIVE18 + 493 moedas...",
//     timestamp: "13:42",
//     status: "offline",
//     queue: "VENDAS",
//     agent: "WEBSTER",
//     unreadCount: 1,
//     priority: "high",
//   },
//   {
//     id: "w7",
//     contact: {
//       name: "Leo",
//       phone: "5567999888777",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     lastMessage: "❤️",
//     timestamp: "13:07",
//     status: "away",
//     queue: "SEM FILA",
//     agent: "WEBSTER",
//     unreadCount: 0,
//     priority: "low",
//   },
// ];

export function AtendimentosContent() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("abertas");
  const [activeSubTab, setActiveSubTab] = useState("atendendo");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const { instagramReceiverId, facebookReceiverId } = useParams<{
    instagramReceiverId: string;
    facebookReceiverId: string;
  }>();

  const { contacts, isLoading, isError, messages } = useMessages({
    instagramReceiverId,
    facebookReceiverId,
  });

  const handleContactSelect = (contact: Contact) => {
    setSelectedContact(contact);
    setSelectedConversation(contact.id);
  };

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

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
          <div className="relative mb-4">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input placeholder="Buscar conversas..." className="pl-10" />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="abertas" className="text-xs">
                ABERTAS
                <Badge
                  variant="secondary"
                  className="bg-primary-million ml-2 text-white"
                >
                  {contacts?.length ?? 0}
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
                ? "border-primary-million text-primary-million border-b-2 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveSubTab("atendendo")}
          >
            ATENDENDO
            <Badge
              variant="secondary"
              className="bg-primary-million ml-2 text-xs text-white"
            >
              {contacts?.filter((c) => c.status === "serving").length ?? 0}
            </Badge>
          </button>
          <button
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeSubTab === "aguardando"
                ? "border-primary-million text-primary-million border-b-2 bg-blue-50"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveSubTab("aguardando")}
          >
            AGUARDANDO
            <Badge
              variant="secondary"
              className="ml-2 bg-red-500 text-xs text-white"
            >
              {contacts?.filter((c) => c.status === "waiting").length ?? 0}
            </Badge>
          </button>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="w-96 space-y-2 p-4">
            {isLoading && (
              <div className="text-center text-sm text-gray-500">
                Carregando...
              </div>
            )}
            {isError && (
              <div className="text-center text-sm text-red-500">
                Erro ao carregar conversas.
              </div>
            )}
            {contacts
              ?.filter((contact) => {
                if (activeSubTab === "aguardando") {
                  return contact.status === "waiting";
                }
                if (activeSubTab === "atendendo") {
                  return contact.status === "serving";
                }
                return false;
              })
              .map((contact) => (
                <Card
                  key={contact.id}
                  className={`relative h-32 cursor-pointer border-l-4 transition-all hover:shadow-md ${
                    selectedContact?.id === contact.id
                      ? "ring-1 ring-[#1d5cd362]"
                      : ""
                  } ${activeSubTab === "aguardando" ? "bg-yellow-50" : ""}`}
                  onClick={() => handleContactSelect(contact)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage
                            src={contact.profilePicture || "/placeholder.svg"}
                          />
                          <AvatarFallback className="bg-primary-million text-white">
                            {contact.name.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -right-1 -bottom-1 h-4 w-4 rounded-full border-2 border-white" />
                        {activeSubTab === "aguardando" && (
                          <div className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500">
                            <Clock className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <h3 className="truncate font-medium text-gray-900">
                            {contact.phone}
                          </h3>
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">
                              {formatTime(contact.timestamp)}
                            </span>
                            {activeSubTab === "aguardando" && (
                              <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                            )}
                          </div>
                        </div>

                        <p className="mb-2 truncate text-sm text-gray-600">
                          {contact.lastMessage}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getQueueColor("SUPORTE")}`}
                            >
                              SUPORTE
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ADMIN
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

                          {contact.unreadCount > 0 && (
                            <Badge
                              className={`absolute top-2 right-2 flex size-5 items-center justify-center rounded-sm text-xs text-white ${
                                activeSubTab === "aguardando"
                                  ? "bg-red-600"
                                  : "bg-green-400"
                              }`}
                            >
                              {contact.unreadCount}
                            </Badge>
                          )}
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
        {selectedConversation && selectedContact ? (
          <>
            <div className="border-b border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          selectedContact.profilePicture || "/placeholder.svg"
                        }
                      />
                      <AvatarFallback className="bg-primary-million text-white">
                        {selectedContact.name.charAt(0) || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedContact.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedContact.phone} • Online
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

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {(messages ?? [])
                  .filter(
                    (msg) =>
                      msg.sender_id === selectedContact.id ||
                      msg.recipient_id === selectedContact.id,
                  )
                  .map((message) => {
                    const isAgent = message.sender_id !== selectedContact.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isAgent ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                            isAgent
                              ? "bg-primary-million text-white"
                              : "border border-gray-200 bg-white text-gray-900"
                          }`}
                        >
                          <p className="text-sm">
                            {message.content.text?.body}
                          </p>
                          <div className="mt-1 flex items-center justify-end space-x-1">
                            <span
                              className={`text-xs ${
                                isAgent ? "text-blue-200" : "text-gray-500"
                              }`}
                            >
                              {formatTime(new Date(message.timestamp))}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={lastMessageRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex items-center space-x-2">
                <Button variant="outline" className="size-12">
                  <Paperclip className="size-4" />
                </Button>
                <div className="relative flex-1">
                  <Input
                    placeholder="Digite uma mensagem..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    className="h-12 focus-visible:border-blue-200 focus-visible:ring-0"
                  />
                  <Button
                    size="sm"
                    className="bg-secondary-million hover:bg-secondary-million/90 absolute top-1/2 right-2 -translate-y-1/2 transform"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
                <Button variant="outline" className="size-12">
                  <Mic className="size-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
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
