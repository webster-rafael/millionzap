import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  MessageSquareShare,
  Mic,
  Paperclip,
  Send,
  Trash,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ConversationInstagram } from "@/interfaces/conversationInstagram-interface";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface InstagramChatAreaProps {
  conversation: ConversationInstagram;
}

export function InstagramChatArea({ conversation }: InstagramChatAreaProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState(conversation.messages || []);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setMessages(conversation.messages || []);
  }, [conversation.messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    const webhookUrl = import.meta.env.VITE_SEND_INSTAGRAM_MESSAGE;

    if (!webhookUrl) {
      toast.error(
        "A URL do webhook para envio de mensagens não está configurada.",
      );
      return;
    }

    const tempId = Date.now().toString();
    const newMessage = {
      id: tempId,
      content: messageInput.trim(),
      timestamp: Date.now(),
      direction: "OUTBOUND",
      messageType: "text",
      createdAt: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setMessageInput("");
    setIsSending(true);

    const payload = {
      recipient: { id: conversation.id },
      message: { text: newMessage.content },
      conversationId: conversation.id,
      companyId: user?.companyId || "",
      userId: user?.id,
      timestamp: newMessage.timestamp,
      tokenIg: user?.tokenIg || "",
      instagramId: user?.instagramId || "",
    };

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Falha ao enviar mensagem para o webhook:", error);
      toast.error("Falha ao enviar. A mensagem foi removida.");
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== tempId),
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
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
                <AvatarImage src={conversation.image} />
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-orange-400 text-white">
                  {conversation.name?.charAt(0).toUpperCase() || "IG"}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {conversation.name}
              </h2>
              <p className="text-sm text-gray-500">@{conversation.username}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button title="Transferir" variant="outline" size="sm" disabled>
              <MessageSquareShare className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" title="Ver perfil" disabled>
              <User className="h-4 w-4" />
            </Button>
            <Button
              className="hover:bg-red-500 hover:text-white"
              variant="outline"
              size="sm"
              disabled
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {[...messages]
            .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
            .map((message, index, arr) => {
              const date = new Date(Number(message.timestamp));
              const previousMessage = arr[index - 1];
              const previousDate = previousMessage
                ? new Date(Number(previousMessage.timestamp))
                : null;
              const isAgent = message.direction === "OUTBOUND";
              const isNewDay = !previousDate || !isSameDay(date, previousDate);

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
                    className={`flex ${
                      isAgent ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-xs rounded-lg px-4 py-2 lg:max-w-md ${
                        isAgent
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "border border-gray-200 bg-white text-gray-900"
                      }`}
                    >
                      <p className="mr-10 p-0.5 text-sm">{message.content}</p>
                      <div className="absolute right-2 bottom-2 mt-1 flex h-2 w-10 items-center justify-end space-x-1">
                        <span
                          className={`text-xs ${
                            isAgent ? "text-purple-200" : "text-gray-500"
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
        </div>
      </ScrollArea>

      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="size-12" disabled>
            <Paperclip className="size-4" />
          </Button>
          <div className="relative flex-1">
            <Input
              placeholder="Digite uma mensagem..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              className="h-12 focus-visible:border-pink-300 focus-visible:ring-0"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isSending}
            />
            <Button
              onClick={handleSendMessage}
              size="sm"
              className="absolute top-1/2 right-2 -translate-y-1/2 transform bg-pink-500 text-white hover:bg-pink-600"
              disabled={isSending}
            >
              <Send className="size-4" />
            </Button>
          </div>
          <Button variant="outline" className="size-12" disabled>
            <Mic className="size-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
