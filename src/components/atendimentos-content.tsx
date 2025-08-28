import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  User,
  Paperclip,
  Mic,
  Send,
  MessageSquare,
  Clock,
  Play,
  Undo2,
  CheckCheck,
  MessageSquareX,
  MessageSquareShare,
  ArrowDown,
  Loader,
  Trash,
  ArrowLeft,
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
import {
  useSendMessage,
  type SendMessagePayload,
} from "@/hooks/useSendMessage";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { AudioPlayer } from "@/components/audioPlayer";
import { PhotoViewer } from "@/components/imageViewer";
import { FileViewer } from "@/components/fileViewer";
import { useWhatsAppConnections } from "@/hooks/useWhatsConnection";

export function AtendimentosContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { conversationId: selectedConversationId } = useParams<{
    conversationId: string;
  }>();
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("abertas");
  const [activeSubTab, setActiveSubTab] = useState("atendendo");
  const {
    conversations,
    remove,
    isLoadingConversations,
    isErrorConversations,
    update: updateConversation,
  } = useConversations();
  const { connections } = useWhatsAppConnections();
  const { queues, isLoadingQueues, isErrorQueues } = useQueues();
  const sendMessageMutation = useSendMessage();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isOpenModalTransfer, setIsOpenModalTransfer] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [selectedQueueId, setSelectedQueueId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQueueFilter, setSelectedQueueFilter] = useState("todas");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleSendMessage = async (audioBlob?: Blob) => {
    if (!selectedConversation || sendMessageMutation.isSending) return;

    const recipientNumber = selectedConversation.contact?.phone;
    if (!recipientNumber) return;
    if (!user || !user.connectionId) {
      toast.error("Usuário não conectado ou sem conexão associada.");
      return;
    }

    const userConnection = connections.find((c) => c.id === user.connectionId);

    if (!userConnection) {
      toast.error("A conexão associada ao seu usuário não foi encontrada.");
      return;
    }

    const instanceName = userConnection.name;

    if (audioBlob) {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () =>
          resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const payload: SendMessagePayload = {
        recipientNumber,
        conversationId: selectedConversation.id,
        timestamp: Math.floor(Date.now() / 1000),
        type: "audio",
        audioBase64: base64Data,
        instance: instanceName,
      };

      sendMessageMutation.send(payload);
    } else {
      if (!messageInput.trim()) return;

      const payload: SendMessagePayload = {
        recipientNumber,
        conversationId: selectedConversation.id,
        timestamp: Math.floor(Date.now() / 1000),
        type: "text",
        messageBody: messageInput.trim(),
        instance: instanceName,
      };

      sendMessageMutation.send(payload);
      setMessageInput("");
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    navigate(`/atendimentos/${conversation.id}`);
  };

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) || null;

  const visibleConversations = useMemo(() => {
    let filtered = conversations;

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (conversation) =>
          conversation.contact?.name?.toLowerCase().includes(lowercasedTerm) ||
          conversation.contact?.phone?.includes(lowercasedTerm),
      );
    }

    if (selectedQueueFilter !== "todas") {
      filtered = filtered.filter(
        (conversation) => conversation.queueId === selectedQueueFilter,
      );
    }

    if (user?.role === "USER") {
      const userQueueIds = new Set(user.queues.map((q) => q.queue.id));
      filtered = filtered.filter((conversation) => {
        if (conversation.status === "SERVING") {
          return conversation.userId === user.id;
        }
        return userQueueIds.has(conversation.queueId || "");
      });
    }

    return filtered;
  }, [conversations, user, searchTerm, selectedQueueFilter]);

  const filteredConversations = useMemo(() => {
    if (activeTab === "busca" && searchTerm) {
      return visibleConversations;
    }

    return visibleConversations.filter((conversation) => {
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
  }, [visibleConversations, activeTab, activeSubTab, searchTerm]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const handleTransferConfirm = () => {
    if (!selectedConversationId || !selectedQueueId) {
      console.error("Conversa ou Fila não selecionada para transferência.");
      return;
    }

    const queueIdToSend =
      selectedQueueId === "sem-fila" ? null : selectedQueueId;

    updateConversation({
      id: selectedConversationId,
      queueId: queueIdToSend,
    });

    setIsOpenModalTransfer(false);
    setSelectedQueueId("");
  };

  const handleOpenFilters = () => {
    setOpenFilters(!openFilters);
  };

  const deleteConversation = (id: string) => {
    try {
      remove(id);
      toast.success("Conversa excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir conversa:", error);
      toast.error("Erro ao excluir conversa.");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/ogg",
        });
        handleSendMessage(audioBlob);
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleResolveConversation = async (conversation: Conversation) => {
    updateConversation({
      id: conversation.id,
      status: "RESOLVED",
    });

    const webhookUrl = import.meta.env.VITE_SEND_FOLLOWUP_MESSAGE_WEBHOOK;

    if (!user?.companyId) {
      toast.error("ID da empresa não encontrado para acionar o webhook.");
      console.error("User object or companyId is missing for webhook call.");
      return;
    }

    try {
      const connectionsName = connections.find(
        (connection) => connection.id === user?.connectionId,
      );
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          companyId: user.companyId,
          instanceName: connectionsName?.name || "",
          phone: conversation.contact?.phone || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook retornou status: ${response.status}`);
      }

      console.log(
        "Webhook de followup acionado com sucesso para a conversa:",
        conversation.id,
      );
    } catch (error) {
      console.error("Falha ao acionar o webhook:", error);
      toast.error("Ocorreu um erro ao enviar dados para o webhook.");
    }
  };

  if (isErrorQueues) {
    toast.error("Erro ao buscar filas.");
  }

  return (
    <div className="flex h-full w-full pt-20 lg:pt-0">
      <div
        className={`${
          selectedConversationId ? "hidden lg:flex" : "flex w-full"
        } flex-col border-r border-gray-200 bg-white lg:w-96`}
      >
        <div className="w-full border-b border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Atendimentos
            </h1>
            <Button
              className={`${openFilters ? "bg-primary-million text-white" : ""}`}
              onClick={handleOpenFilters}
              variant="outline"
              size="sm"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
          {openFilters && (
            <div className="relative mb-4">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex h-10 w-full items-center">
              <TabsTrigger value="abertas" className="text-xs">
                ABERTAS
                <Badge
                  variant="secondary"
                  className="bg-primary-million ml-2 text-white"
                >
                  {
                    visibleConversations.filter(
                      (c) => c.status === "SERVING" || c.status === "WAITING",
                    ).length
                  }
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="resolvidas" className="text-xs">
                RESOLVIDAS
                <Badge
                  variant="secondary"
                  className="bg-primary-million ml-2 text-white"
                >
                  {
                    visibleConversations.filter((c) => c.status === "RESOLVED")
                      .length
                  }
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {user?.role === "ADMIN" && (
          <div className="border-b border-gray-200 p-4">
            <Select
              value={selectedQueueFilter}
              onValueChange={setSelectedQueueFilter}
            >
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
        )}

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
                {
                  visibleConversations.filter((c) => c.status === "SERVING")
                    .length
                }
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
                {
                  visibleConversations.filter((c) => c.status === "WAITING")
                    .length
                }
              </Badge>
            </button>
          </div>
        )}

        {/* Conversations */}
        <ScrollArea className="flex w-full overflow-y-auto lg:flex-1">
          <div className="flex w-full flex-col gap-3 p-3 lg:mx-auto lg:w-96">
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
                <CardContent className="w-90 p-3">
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
                          {isLoadingQueues ? (
                            <Loader className="animation-spin h-3 w-3" />
                          ) : (
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
                                .find(
                                  (fila) => fila.id === conversation.queueId,
                                )
                                ?.name?.toUpperCase() || "SEM FILA"}
                            </Badge>
                          )}
                          {activeTab === "resolvidas" && (
                            <Badge variant="outline" className="text-xs">
                              {conversation.user?.name || conversation.userId}
                            </Badge>
                          )}
                          {conversation.userId &&
                            conversation.status === "SERVING" && (
                              <Badge variant="outline" className="text-xs">
                                {conversation.user?.name || conversation.userId}
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
                      dragConstraints={{ left: -150, right: 0 }}
                      dragElastic={0.2}
                      onDragEnd={(_, info) => {
                        if (info.offset.x < -75) {
                          if (!user) {
                            console.error(
                              "Usuário não logado, não é possível aceitar a conversa.",
                            );
                            return;
                          }

                          updateConversation({
                            id: conversation.id,
                            status: "SERVING",
                            userId: user.id,
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
                          handleResolveConversation(conversation);
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
      <div
        className={`${
          selectedConversationId ? "flex w-full" : "hidden"
        } flex-1 flex-col overflow-y-hidden bg-gray-50 lg:flex`}
      >
        {selectedConversation ? (
          <>
            <div className="overflow-y-hidden border-b border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => navigate("/atendimentos")}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
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
                  <Button
                    className="hover:bg-red-500 hover:text-white"
                    variant="outline"
                    size="sm"
                    onClick={() => deleteConversation(selectedConversation.id)}
                  >
                    <Trash className="h-4 w-4" />
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
                            className={`relative flex h-full max-w-xs items-center gap-2 rounded-lg ${message.messageType === "image" || message.messageType === "document" ? "p-0" : "px-4 py-2"} lg:max-w-md ${
                              isAgent
                                ? "bg-primary-million text-white"
                                : "border border-gray-200 bg-white text-gray-900"
                            }`}
                          >
                            {message?.messageType === "audio" ? (
                              <AudioPlayer
                                src={message?.mediaUrl || ""}
                                isAgent={isAgent}
                              />
                            ) : message?.messageType === "image" ? (
                              <div className="flex w-52 flex-col gap-2 p-2 pb-4">
                                <PhotoViewer
                                  src={message?.mediaUrl || ""}
                                  isAgent={isAgent}
                                />
                                <span className="text-sm text-gray-500">
                                  {message?.mediaCaption || ""}
                                </span>
                              </div>
                            ) : message?.messageType === "document" ? (
                              <div className="flex">
                                <FileViewer
                                  src={message?.mediaUrl || ""}
                                  isAgent={isAgent}
                                  name={message?.content || ""}
                                />
                              </div>
                            ) : (
                              <p className="mr-10 w-full p-0.5 text-sm">
                                {message.content}
                              </p>
                            )}
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
                    onClick={() => handleSendMessage()}
                    size="sm"
                    className="bg-secondary-million hover:bg-secondary-million/90 absolute top-1/2 right-2 -translate-y-1/2 transform"
                  >
                    <Send className="size-4" />
                  </Button>
                </div>
                <Button
                  variant={isRecording ? "destructive" : "outline"}
                  className="size-12"
                  onClick={isRecording ? stopRecording : startRecording}
                >
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
                  <option value={"sem-fila"}>Sem fila</option>
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
      <Toaster />
    </div>
  );
}
