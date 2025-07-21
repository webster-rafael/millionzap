import { useRef, useState } from "react";
import { motion } from "framer-motion";
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
  Play,
  Undo2,
  CheckCheck,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { IMessage } from "@/interfaces/message-interface";

const updateStatusMutation = async ({
  contactId,
  status,
}: {
  contactId: string;
  status: string;
}) => {
  const response = await fetch(import.meta.env.VITE_UPDATE_STATUS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contactId, status }),
  });

  if (!response.ok) {
    throw new Error("Falha ao atualizar o status da conversa.");
  }

  return response.json();
};

export function AtendimentosContent() {
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const queryClient = useQueryClient();
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

  const { mutate: updateStatus } = useMutation({
    mutationFn: updateStatusMutation,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<IMessage[]>(["messages"], (oldData) => {
        if (!oldData) return [];
        return oldData.map((message) => {
          if (message.sender_id === variables.contactId) {
            return { ...message, status: variables.status };
          }
          return message;
        });
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
    },
  });

  const formatTime = (timestamp: Date) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
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
                  {
                    contacts.filter((contact) => contact.status === "serving")
                      .length
                  }
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
        {activeTab === "abertas" && (
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
        )}

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
                if (activeTab === "abertas") {
                  if (activeSubTab === "aguardando")
                    return contact.status === "waiting";
                  if (activeSubTab === "atendendo")
                    return contact.status === "serving";
                }
                if (activeTab === "resolvidas") {
                  return contact.status === "finished";
                }
                return false;
              })
              .map((contact) => {
                const cardInnerContent = (
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
                );

                if (activeTab === "resolvidas") {
                  return (
                    <Card
                      key={contact.id}
                      className={`relative h-32 cursor-pointer border-l-4 border-gray-300 bg-gray-50 transition-all hover:shadow-md ${selectedContact?.id === contact.id ? "ring-1 ring-gray-300" : ""}`}
                      onClick={() => handleContactSelect(contact)}
                    >
                      {cardInnerContent}
                    </Card>
                  );
                }

                // **MODIFICADO**: Lógica de renderização simplificada
                if (activeSubTab === "aguardando") {
                  return (
                    <div key={contact.id} className="relative">
                      <div className="absolute top-0 right-0 flex h-full items-center justify-center rounded-r-lg bg-green-500 px-6">
                        <Play className="h-6 w-6 text-white" />
                      </div>
                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                          if (info.offset.x < -100) {
                            updateStatus({
                              contactId: contact.id,
                              status: "serving",
                            });
                          }
                        }}
                        className="relative z-10 w-full"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <Card
                          className={`h-32 cursor-pointer border-l-4 bg-yellow-50 transition-all hover:shadow-md ${selectedContact?.id === contact.id ? "ring-1 ring-[#1d5cd362]" : ""}`}
                        >
                          {cardInnerContent}
                        </Card>
                      </motion.div>
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={contact.id}
                      className="relative overflow-hidden rounded-lg"
                    >
                      {/* Ação de arrastar para a DIREITA (Voltar para Aguardando) */}
                      <div className="absolute top-0 left-0 flex h-full items-center justify-center rounded-l-lg bg-yellow-400 px-6">
                        <Undo2 className="h-6 w-6 text-white" />
                      </div>

                      {/* Ação de arrastar para a ESQUERDA (Finalizar) */}
                      <div className="absolute top-0 right-0 flex h-full items-center justify-center rounded-r-lg bg-blue-500 px-6">
                        <CheckCheck className="h-6 w-6 text-white" />
                      </div>

                      <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        onDragEnd={(_, info) => {
                          const dragThreshold = 100;
                          // Arrastou para a DIREITA
                          if (info.offset.x > dragThreshold) {
                            updateStatus({
                              contactId: contact.id,
                              status: "waiting",
                            });
                          }
                          // Arrastou para a ESQUERDA
                          else if (info.offset.x < -dragThreshold) {
                            updateStatus({
                              contactId: contact.id,
                              status: "finished",
                            });
                          }
                        }}
                        className="relative z-10 w-full"
                        onClick={() => handleContactSelect(contact)}
                      >
                        <Card
                          className={`relative h-32 cursor-pointer border-l-4 bg-white transition-all hover:shadow-md ${selectedContact?.id === contact.id ? "ring-1 ring-[#1d5cd362]" : ""}`}
                        >
                          {cardInnerContent}
                        </Card>
                      </motion.div>
                    </div>
                  );
                }
              })}
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
