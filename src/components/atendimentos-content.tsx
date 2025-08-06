import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
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
  MessageSquareX,
  MessageSquareShare,
  ArrowDown,
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
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation } from "@/interfaces/conversation-interface";
import { useConversations } from "@/hooks/useConversation";
import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQueues } from "@/hooks/useQueues";
import { useSendMessage } from "@/hooks/useSendMessage";

export function AtendimentosContent() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("abertas");
  const [activeSubTab, setActiveSubTab] = useState("atendendo");
  const {
    conversations,
    isLoadingConversations,
    isErrorConversations,
    update: updateConversation,
  } = useConversations();
  const { queues, isLoadingQueues, isErrorQueues } = useQueues();
  const sendMessageMutation = useSendMessage();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isOpenModalTransfer, setIsOpenModalTransfer] = useState(false);
  const [selectedQueueId, setSelectedQueueId] = useState<string>("");

  const handleSendMessage = async () => {
    if (
      !selectedConversation ||
      !messageInput.trim() ||
      sendMessageMutation.isSending
    ) {
      return;
    }

    const recipientNumber = selectedConversation.contact?.phone;
    if (!recipientNumber) {
      console.error("Contato sem número de telefone.");
      return;
    }

    sendMessageMutation.send({
      recipientNumber: recipientNumber,
      messageBody: messageInput,
      conversationId: selectedConversation.id,
      timestamp: Math.floor(Date.now() / 1000),
    });

    setMessageInput("");
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversationId(conversation.id);
  };

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) || null;

  const filteredConversations = conversations.filter((conversation) => {
    if (activeTab === "abertas") {
      if (activeSubTab === "aguardando")
        return conversation.status === "WAITING";
      if (activeSubTab === "atendendo")
        return conversation.status === "SERVING";
    }
    if (activeTab === "resolvidas") {
      return (
        conversation.status === "RESOLVED" || conversation.status === "CLOSED"
      );
    }
    return false;
  });

  const getQueueColor = (queue: string) => {
    switch (queue) {
      case "SUPORTE":
        return "bg-blue-100 text-blue-800";
      case "VENDAS":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const handleTransferConfirm = () => {
    if (!selectedConversationId || !selectedQueueId) {
      console.error("Conversa ou Fila não selecionada para transferência.");
      return;
    }

    updateConversation({
      id: selectedConversationId,
      queueId: selectedQueueId,
    });

    setIsOpenModalTransfer(false);
    setSelectedQueueId("");
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
            <TabsList className="flex h-10 w-full items-center">
              <TabsTrigger value="abertas" className="text-xs">
                ABERTAS
                <Badge
                  variant="secondary"
                  className="bg-primary-million ml-2 text-white"
                >
                  {conversations.filter((c) => c.status === "SERVING").length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resolvidas" className="text-xs">
                RESOLVIDAS
                <Badge
                  variant="secondary"
                  className="bg-primary-million ml-2 text-white"
                >
                  {conversations.filter((c) => c.status === "SERVING").length}
                </Badge>
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

              {queues?.map((queue: { id: string; name: string }) => (
                <SelectItem key={queue.id} value={queue.id}>
                  {queue.name}
                </SelectItem>
              ))}
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
                {conversations.filter((c) => c.status === "SERVING").length}
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
                {conversations.filter((c) => c.status === "WAITING").length}
              </Badge>
            </button>
          </div>
        )}

        {/* Conversations */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="w-96 space-y-2 p-4">
            {isLoadingConversations && (
              <>
                <Skeleton className="h-32 bg-zinc-200" />
                <Skeleton className="h-32 bg-zinc-200" />
                <Skeleton className="h-32 bg-zinc-200" />
                <Skeleton className="h-32 bg-zinc-200" />
                <Skeleton className="h-32 bg-zinc-200" />
              </>
            )}
            {isErrorConversations && (
              <div className="flex flex-col items-center justify-center">
                <MessageSquareX />
                <h1>Não foi possível encontrar conversas</h1>
              </div>
            )}
            {filteredConversations.map((conversation) => {
              const lastMessage =
                conversation.messages && conversation.messages.length > 0
                  ? conversation.messages[conversation.messages.length - 1]
                  : null;

              const cardInnerContent = (
                <CardContent className="p-3">
                  <div className="flex items-start space-x-3">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={"/placeholder.svg"} />
                        <AvatarFallback className="bg-primary-million text-white">
                          {conversation.contact?.name.charAt(0) || "C"}
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
                          {conversation.contact?.phone}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">
                            {(() => {
                              const rawTimestamp =
                                conversation.messages?.[
                                  conversation.messages.length - 1
                                ]?.timestamp;

                              if (!rawTimestamp) return "Sem data";

                              const date = new Date(
                                Number(rawTimestamp) * 1000,
                              );

                              if (isNaN(date.getTime())) return "";

                              return isToday(date)
                                ? format(date, "HH:mm", { locale: ptBR })
                                : format(date, "dd/MM/yyyy HH:mm", {
                                    locale: ptBR,
                                  });
                            })()}
                          </span>
                          {activeSubTab === "aguardando" && (
                            <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
                          )}
                        </div>
                      </div>
                      <p className="mb-2 truncate text-sm text-gray-600">
                        {lastMessage?.content || "Nenhuma mensagem"}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className="border-none text-xs"
                            style={{
                              backgroundColor:
                                queues.find(
                                  (fila) => fila.id === conversation.queueId,
                                )?.color || "#A1A1AA",
                              color: "#FFFFFF",
                            }}
                          >
                            {queues
                              .find((fila) => fila.id === conversation.queueId)
                              ?.name?.toUpperCase() || "SEM FILA"}
                          </Badge>
                          {conversation.userId &&
                            conversation.status === "SERVING" && (
                              <Badge variant="outline" className="text-xs">
                                ADMIN
                              </Badge>
                            )}
                          {activeSubTab === "aguardando" && (
                            <Badge
                              variant="secondary"
                              className="bg-yellow-100 text-xs text-yellow-800"
                            >
                              AGUARDANDO
                            </Badge>
                          )}
                        </div>
                        {/* {conversation.unreadCount > 0 && (
                          <Badge
                            className={`absolute top-2 right-2 flex size-5 items-center justify-center rounded-sm text-xs text-white ${
                              activeSubTab === "aguardando"
                                ? "bg-red-600"
                                : "bg-green-400"
                            }`}
                          >
                            {conversation.unreadCount}
                          </Badge>
                        )} */}
                      </div>
                    </div>
                  </div>
                </CardContent>
              );

              if (activeTab === "resolvidas") {
                return (
                  <div
                    key={conversation.id}
                    className="relative overflow-hidden rounded-lg"
                  >
                    <div className="absolute top-0 right-0 flex h-full items-center justify-center rounded-r-lg bg-green-300 px-6">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <motion.div
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -100) {
                          updateConversation({
                            id: conversation.id,
                            status: "SERVING",
                          });
                        }
                      }}
                      className="relative z-10 w-full"
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <Card
                        className={`relative h-32 cursor-pointer border-l-4 border-gray-300 bg-gray-50 transition-all hover:shadow-md ${
                          selectedConversationId === conversation.id
                            ? "ring-1 ring-gray-300"
                            : ""
                        }`}
                      >
                        {cardInnerContent}
                      </Card>
                    </motion.div>
                  </div>
                );
              }

              if (activeSubTab === "aguardando") {
                return (
                  <div key={conversation.id} className="relative">
                    <div className="absolute top-0 right-0 flex h-full items-center justify-center rounded-r-lg bg-green-300 px-6">
                      <Play className="h-6 w-6 text-white" />
                    </div>
                    <motion.div
                      drag="x"
                      // Adicionando constraints para limitar o movimento
                      dragConstraints={{ left: -150, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        // A única ação válida aqui é arrastar para a esquerda para atender
                        if (info.offset.x < -75) {
                          updateConversation({
                            id: conversation.id,
                            status: "SERVING", // <<< CORRIGIDO
                          });
                        }
                      }}
                      className="relative z-10 w-full"
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <Card
                        className={`h-32 cursor-pointer border-l-4 bg-yellow-50 transition-all hover:shadow-md ${
                          selectedConversationId === conversation.id
                            ? "ring-1 ring-[#1d5cd362]"
                            : ""
                        }`}
                      >
                        {cardInnerContent}
                      </Card>
                    </motion.div>
                  </div>
                );
              } else {
                return (
                  <div
                    key={conversation.id}
                    className="relative overflow-hidden rounded-lg"
                  >
                    <div className="absolute top-0 left-0 flex h-full items-center justify-center rounded-l-lg bg-orange-200 px-6">
                      <Undo2 className="h-6 w-6 text-white" />
                    </div>

                    <div className="absolute top-0 right-0 flex h-full items-center justify-center rounded-r-lg bg-blue-300 px-6">
                      <CheckCheck className="h-6 w-6 text-white" />
                    </div>

                    <motion.div
                      drag="x"
                      onDragEnd={(_, info) => {
                        const dragThreshold = 100;
                        if (info.offset.x > dragThreshold) {
                          updateConversation({
                            id: conversation.id,
                            status: "WAITING",
                          });
                        } else if (info.offset.x < -dragThreshold) {
                          updateConversation({
                            id: conversation.id,
                            status: "RESOLVED",
                          });
                        }
                      }}
                      className="relative z-10 w-full"
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <Card
                        className={`relative h-32 cursor-pointer border-l-4 bg-green-50 transition-all hover:shadow-md ${selectedConversationId === conversation.id ? "border-y border-[#1d5cd362]" : ""}`}
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
        {selectedConversation ? (
          <>
            <div className="border-b border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={"/placeholder.svg"} />
                      <AvatarFallback className="bg-primary-million text-white">
                        {selectedConversation.contact?.name.charAt(0) || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedConversation.contact?.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.contact?.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setIsOpenModalTransfer(true)}
                    title="Transferir"
                    variant="outline"
                    size="sm"
                  >
                    <MessageSquareShare className="h-4 w-4" />
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

            <ScrollArea className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {[...(selectedConversation.messages || [])]
                  .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
                  .map((message, index, arr) => {
                    const rawTimestamp = message.timestamp;
                    const date = new Date(Number(rawTimestamp) * 1000);
                    const previousMessage = arr[index - 1];
                    const previousDate = previousMessage
                      ? new Date(Number(previousMessage.timestamp) * 1000)
                      : null;

                    const isAgent = message.direction === "OUTBOUND";
                    const isNewDay =
                      !previousDate || !isSameDay(date, previousDate);

                    return (
                      <div key={message.id} className="space-y-1">
                        {isNewDay && (
                          <div className="mb-2 text-center text-xs text-gray-500">
                            {isToday(date)
                              ? "Hoje"
                              : format(date, "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        )}

                        <div
                          className={`flex ${isAgent ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`relative flex h-full max-w-xs items-center gap-2 rounded-lg px-4 py-2 lg:max-w-md ${
                              isAgent
                                ? "bg-primary-million text-white"
                                : "border border-gray-200 bg-white text-gray-900"
                            }`}
                          >
                            <p className="mr-10 w-full p-0.5 text-sm">
                              {message.content}
                            </p>
                            <div className="absolute right-2 bottom-2 mt-1 flex h-2 w-10 items-center justify-end space-x-1">
                              <span
                                className={`text-xs ${
                                  isAgent ? "text-blue-200" : "text-gray-500"
                                }`}
                              >
                                {format(date, "HH:mm", { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                <div ref={bottomRef} />
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
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
      <>
        {isOpenModalTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md space-y-3 rounded-lg bg-white p-6 shadow-lg">
              <div className="flex h-12 items-center justify-between">
                <h2 className="text-lg font-semibold text-zinc-800">
                  Transferir conversa
                </h2>
                <MessageSquareShare className="text-secondary-million h-6 w-6" />
              </div>

              <div className="relative">
                <select
                  className="w-full appearance-none rounded border border-gray-300 px-4 py-2 pr-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  value={selectedQueueId}
                  onChange={(e) => setSelectedQueueId(e.target.value)}
                >
                  <option value="" disabled>
                    Selecione uma fila
                  </option>
                  {queues.map((queue) => (
                    <option key={queue.id} value={queue.id}>
                      {queue.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-500">
                  <ArrowDown className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsOpenModalTransfer(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleTransferConfirm}>Confirmar</Button>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}
