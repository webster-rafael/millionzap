import { useState, useRef, useEffect } from "react";
import {
  Search,
  Plus,
  Send,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  CheckCheck,
  Paperclip,
  Smile,
  X,
  Users,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "away";
  lastSeen?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  status: "sent" | "delivered" | "read";
  type: "text" | "file" | "image";
}

interface Conversation {
  id: string;
  title: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const users: User[] = [
  {
    id: "1",
    name: "Admin",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    id: "2",
    name: "Webster",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    id: "3",
    name: "Maria Silva",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "away",
    lastSeen: "5 min atrás",
  },
  {
    id: "4",
    name: "João Santos",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
    lastSeen: "2 horas atrás",
  },
  {
    id: "5",
    name: "Ana Costa",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
];

const initialConversations: Conversation[] = [
  {
    id: "1",
    title: "TEste",
    participants: ["1", "2"],
    unreadCount: 0,
    createdAt: "2025-01-07T08:37:00",
    updatedAt: "2025-01-07T08:37:00",
    createdBy: "1",
    lastMessage: {
      id: "msg-1",
      content: "Oi, tudo bem?",
      senderId: "2",
      timestamp: "2025-01-07T08:37:00",
      status: "read",
      type: "text",
    },
  },
  {
    id: "2",
    title: "Erro",
    participants: ["1", "3"],
    unreadCount: 2,
    createdAt: "2025-01-06T10:22:00",
    updatedAt: "2025-01-07T10:22:00",
    createdBy: "1",
    lastMessage: {
      id: "msg-2",
      content: "Preciso de ajuda com o sistema",
      senderId: "3",
      timestamp: "2025-01-07T10:22:00",
      status: "delivered",
      type: "text",
    },
  },
];

const initialMessages: { [key: string]: Message[] } = {
  "1": [
    {
      id: "msg-1",
      content: "Oi pessoal! Como vocês estão?",
      senderId: "1",
      timestamp: "2025-01-07T08:30:00",
      status: "read",
      type: "text",
    },
    {
      id: "msg-2",
      content: "Tudo bem por aqui! E você?",
      senderId: "2",
      timestamp: "2025-01-07T08:32:00",
      status: "read",
      type: "text",
    },
    {
      id: "msg-3",
      content: "Ótimo! Vamos começar a reunião em 5 minutos",
      senderId: "1",
      timestamp: "2025-01-07T08:35:00",
      status: "read",
      type: "text",
    },
    {
      id: "msg-4",
      content: "Perfeito, já estou preparado!",
      senderId: "2",
      timestamp: "2025-01-07T08:37:00",
      status: "read",
      type: "text",
    },
  ],
  "2": [
    {
      id: "msg-5",
      content: "Estou com um problema no sistema",
      senderId: "3",
      timestamp: "2025-01-07T10:20:00",
      status: "delivered",
      type: "text",
    },
    {
      id: "msg-6",
      content: "Qual é o erro que está aparecendo?",
      senderId: "1",
      timestamp: "2025-01-07T10:21:00",
      status: "delivered",
      type: "text",
    },
    {
      id: "msg-7",
      content: "Preciso de ajuda com o sistema",
      senderId: "3",
      timestamp: "2025-01-07T10:22:00",
      status: "delivered",
      type: "text",
    },
  ],
};

export function ChatInternoContent() {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>(
    initialMessages,
  );
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >("1");
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newConversation, setNewConversation] = useState({
    title: "",
    participants: [] as string[],
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = "1"; // Simulating current user as Admin

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation]);

  const getUser = (userId: string) => {
    return users.find((user) => user.id === userId);
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else {
      return date.toLocaleDateString("pt-BR");
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content: messageInput.trim(),
      senderId: currentUserId,
      timestamp: new Date().toISOString(),
      status: "sent",
      type: "text",
    };

    setMessages((prev) => ({
      ...prev,
      [selectedConversation]: [
        ...(prev[selectedConversation] || []),
        newMessage,
      ],
    }));

    // Update conversation's last message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation
          ? {
              ...conv,
              lastMessage: newMessage,
              updatedAt: new Date().toISOString(),
            }
          : conv,
      ),
    );

    setMessageInput("");

    // Simulate message delivery after 1 second
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [selectedConversation]: prev[selectedConversation].map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg,
        ),
      }));
    }, 1000);
  };

  const editMessage = (messageId: string) => {
    if (!editContent.trim() || !selectedConversation) return;

    setMessages((prev) => ({
      ...prev,
      [selectedConversation]: prev[selectedConversation].map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              content: editContent.trim(),
              edited: true,
              editedAt: new Date().toISOString(),
            }
          : msg,
      ),
    }));

    setEditingMessage(null);
    setEditContent("");
  };

  const deleteMessage = (messageId: string) => {
    if (!selectedConversation) return;

    setMessages((prev) => ({
      ...prev,
      [selectedConversation]: prev[selectedConversation].filter(
        (msg) => msg.id !== messageId,
      ),
    }));
  };

  const createConversation = () => {
    if (
      !newConversation.title.trim() ||
      newConversation.participants.length === 0
    )
      return;

    const conversation: Conversation = {
      id: Date.now().toString(),
      title: newConversation.title,
      participants: [currentUserId, ...newConversation.participants],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUserId,
    };

    setConversations([conversation, ...conversations]);
    setMessages((prev) => ({ ...prev, [conversation.id]: [] }));
    setNewConversation({ title: "", participants: [] });
    setIsCreatingConversation(false);
    setSelectedConversation(conversation.id);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(
      conversations.filter((conv) => conv.id !== conversationId),
    );
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
    }
    // Remove messages for this conversation
    const newMessages = { ...messages };
    delete newMessages[conversationId];
    setMessages(newMessages);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const currentConversation = conversations.find(
    (conv) => conv.id === selectedConversation,
  );
  const currentMessages = selectedConversation
    ? messages[selectedConversation] || []
    : [];

  const getConversationParticipants = (conversation: Conversation) => {
    return conversation.participants
      .filter((id) => id !== currentUserId)
      .map((id) => getUser(id))
      .filter(Boolean);
  };

  return (
    <div className="flex h-full">
      {/* Conversations List */}
      <div
        className={`${
          selectedConversation ? "hidden lg:flex" : "flex w-full"
        } flex-col border-r border-gray-200 bg-white lg:w-96`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Chat Interno
            </h1>
            <Dialog
              open={isCreatingConversation}
              onOpenChange={setIsCreatingConversation}
            >
              <DialogTrigger asChild>
                <Button className="bg-primary-million hover:bg-primary-million/90">
                  <Plus className="mr-2 size-4" />
                  Nova
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Conversa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newConversation.title}
                      onChange={(e) =>
                        setNewConversation({
                          ...newConversation,
                          title: e.target.value,
                        })
                      }
                      placeholder="Nome da conversa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="participants">Filtro por Users</Label>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        if (!newConversation.participants.includes(value)) {
                          setNewConversation({
                            ...newConversation,
                            participants: [
                              ...newConversation.participants,
                              value,
                            ],
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione usuários" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter((user) => user.id !== currentUserId)
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {newConversation.participants.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {newConversation.participants.map((userId) => {
                        const user = getUser(userId);
                        return (
                          <Badge
                            key={userId}
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            {user?.name}
                            <X
                              className="h-3 w-3 cursor-pointer"
                              onClick={() =>
                                setNewConversation({
                                  ...newConversation,
                                  participants:
                                    newConversation.participants.filter(
                                      (id) => id !== userId,
                                    ),
                                })
                              }
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreatingConversation(false)}
                    >
                      Fechar
                    </Button>
                    <Button
                      onClick={createConversation}
                      className="bg-primary-million hover:bg-primary-million/90"
                    >
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Buscar conversas..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="p-4">
            {filteredConversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={`mb-2 flex h-28 cursor-pointer justify-center transition-all hover:shadow-md ${
                  selectedConversation === conversation.id
                    ? "ring-opacity-50 ring-primary-million bg-blue-50 ring-1"
                    : ""
                }`}
                onClick={() => setSelectedConversation(conversation.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <h3 className="truncate font-medium text-gray-900">
                          {conversation.title}
                        </h3>
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage
                              ? formatTime(conversation.lastMessage.timestamp)
                              : formatTime(conversation.createdAt)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                              >
                                <MoreVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="mr-2 size-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  deleteConversation(conversation.id)
                                }
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 size-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <p className="mb-2 truncate text-sm text-gray-600">
                        {conversation.lastMessage?.content ||
                          "Nenhuma mensagem ainda"}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {getConversationParticipants(conversation)
                              .map((user) => user?.name)
                              .join(", ")}
                          </span>
                        </div>

                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-primary-million text-xs text-white">
                            {conversation.unreadCount}
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
      <div
        className={`${
          selectedConversation ? "flex w-full" : "hidden"
        } flex-1 flex-col bg-gray-50 lg:flex`}
      >
        {selectedConversation && currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <div className="flex -space-x-2">
                    {getConversationParticipants(currentConversation)
                      .slice(0, 3)
                      .map((user, index) => (
                        <div key={user?.id} className="relative">
                          <Avatar className="h-10 w-10 border-2 border-white">
                            <AvatarImage
                              src={user?.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="bg-primary-million text-white">
                              {user?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {index === 0 && (
                            <div
                              className={`absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                                user?.status || "offline",
                              )}`}
                            />
                          )}
                        </div>
                      ))}
                  </div>

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {currentConversation.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {getConversationParticipants(currentConversation)
                        .map((user) => user?.name)
                        .join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Users className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="size-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 overflow-y-auto p-4">
              <div className="h-full space-y-4 overflow-y-auto">
                {currentMessages.map((message, index) => {
                  const isCurrentUser = message.senderId === currentUserId;
                  const sender = getUser(message.senderId);
                  const showDate =
                    index === 0 ||
                    formatDate(message.timestamp) !==
                      formatDate(currentMessages[index - 1].timestamp);

                  return (
                    <div key={message.id}>
                      {showDate && (
                        <div className="mb-4 flex justify-center">
                          <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-500 shadow-sm">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex ${
                          isCurrentUser ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md ${
                            isCurrentUser ? "order-2" : "order-1"
                          }`}
                        >
                          {!isCurrentUser && (
                            <div className="mb-1 flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={sender?.avatar || "/placeholder.svg"}
                                />
                                <AvatarFallback className="bg-primary-million text-xs text-white">
                                  {sender?.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">
                                {sender?.name}
                              </span>
                            </div>
                          )}

                          <div
                            className={`group relative rounded-lg px-4 py-2 ${
                              isCurrentUser
                                ? "bg-primary-million rounded-br-sm text-white"
                                : "rounded-bl-sm border border-gray-200 bg-white text-gray-900"
                            }`}
                          >
                            {editingMessage === message.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={editContent}
                                  onChange={(e) =>
                                    setEditContent(e.target.value)
                                  }
                                  className="min-h-[60px] resize-none"
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingMessage(null);
                                      setEditContent("");
                                    }}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => editMessage(message.id)}
                                  >
                                    Salvar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm whitespace-pre-wrap">
                                  {message.content}
                                </p>
                                {message.edited && (
                                  <span
                                    className={`text-xs ${
                                      isCurrentUser
                                        ? "text-blue-200"
                                        : "text-gray-500"
                                    } italic`}
                                  >
                                    editado
                                  </span>
                                )}
                              </>
                            )}

                            {isCurrentUser && editingMessage !== message.id && (
                              <div className="absolute top-1/2 -left-12 -translate-y-1/2 transform opacity-0 transition-opacity group-hover:opacity-100">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreVertical className="size-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setEditingMessage(message.id);
                                        setEditContent(message.content);
                                      }}
                                    >
                                      <Edit className="mr-2 size-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => deleteMessage(message.id)}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 size-4" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            )}
                          </div>

                          <div
                            className={`mt-1 flex items-center space-x-1 ${
                              isCurrentUser ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span
                              className={`text-xs ${
                                isCurrentUser
                                  ? "text-gray-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </span>
                            {isCurrentUser && (
                              <div className="flex space-x-1">
                                {message.status === "sent" && (
                                  <Check className="h-3 w-3 text-gray-400" />
                                )}
                                {message.status === "delivered" && (
                                  <CheckCheck className="h-3 w-3 text-gray-400" />
                                )}
                                {message.status === "read" && (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
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
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    className="h-12 focus-visible:border-blue-400 focus-visible:ring-0"
                  />
                  <Button
                    variant="outline"
                    className="absolute top-1/2 right-2 -translate-y-1/2 transform bg-transparent"
                  >
                    <Smile className="size-4" />
                  </Button>
                </div>

                <Button
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  className="bg-primary-million hover:bg-primary-million/90 size-12"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <MessageCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Selecione uma conversa
              </h3>
              <p className="text-gray-500">
                Escolha uma conversa da lista para começar a conversar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
