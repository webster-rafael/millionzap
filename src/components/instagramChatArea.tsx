// src/components/instagramChatArea.tsx

import { format, isSameDay, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, MessageSquareShare, Trash, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ConversationInstagram } from "@/interfaces/conversationInstagram-interface";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";

interface InstagramChatAreaProps {
  conversation: ConversationInstagram;
  // Adicione outras props necessárias no futuro, como funções para deletar, etc.
}

export function InstagramChatArea({ conversation }: InstagramChatAreaProps) {
  const navigate = useNavigate();

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
            {/* Botões de ação podem ser adicionados aqui no futuro */}
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
          {[...(conversation.messages || [])]
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
                          ? "bg-primary-million text-white"
                          : "border border-gray-200 bg-white text-gray-900"
                      }`}
                    >
                      <p className="mr-10 p-0.5 text-sm">{message.content}</p>
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
        </div>
      </ScrollArea>
    </>
  );
}
