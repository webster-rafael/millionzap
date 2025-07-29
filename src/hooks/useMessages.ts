import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { io } from "socket.io-client";
import type { IMessage } from "@/interfaces/message-interface";
import type { Contact } from "@/interfaces/contact-interface";

const fetchMessages = async (): Promise<IMessage[]> => {
  const response = await fetch(import.meta.env.VITE_BACKEND_URL);
  if (!response.ok) {
    throw new Error("Falha ao buscar as mensagens.");
  }
  return response.json();
};

interface UseMessagesProps {
  instagramReceiverId?: string;
  facebookReceiverId?: string;
}

export function useMessages({
  instagramReceiverId,
  facebookReceiverId,
}: UseMessagesProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["messages"],
    queryFn: fetchMessages,
    refetchInterval: 3000,
  });

  const transformData = (rawData: IMessage[] | undefined) => {
    if (!rawData) return { contacts: [], messages: [] };

    const uniqueContacts: { [key: string]: Contact } = {};
    for (const message of rawData) {
      const contactId = message.sender_id;
      if (!uniqueContacts[contactId]) {
        uniqueContacts[contactId] = {
          id: contactId,
          name: message.profile.name || String(message.sender_id),
          phone: String(message.sender_id),
          timestamp: new Date(0),
          lastMessage: "...",
          unreadCount: 0,
          platform: "instagram",
          status: "waiting",
          messages: [],
        };
      }
      const contact = uniqueContacts[contactId];
      if (message.is_read === false) {
        contact.unreadCount += 1;
      }
      const messageTimestamp = new Date(message.timestamp);
      if (messageTimestamp >= contact.timestamp) {
        contact.timestamp = messageTimestamp;
        contact.status = message.status;
        if (message.type === "text" && message.content.text) {
          contact.lastMessage = message.content.text.body;
        } else if (message.type === "image") {
          contact.lastMessage = message.content.image?.caption || "📷 Imagem";
        } else {
          contact.lastMessage = "Mensagem de mídia";
        }
      }
    }
    const sortedContacts = Object.values(uniqueContacts).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );

    return { contacts: sortedContacts, messages: rawData };
  };

  const { contacts, messages } = transformData(data);

  useEffect(() => {
    if (!instagramReceiverId && !facebookReceiverId) return;

    const socket = io(import.meta.env.SOCKET_URL, {
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socket.emit("set-account-id", [instagramReceiverId, facebookReceiverId]);

    socket.on("frontend-message", (newMessage: IMessage) => {
      queryClient.setQueryData<IMessage[]>(["messages"], (oldData) => {
        if (!oldData) return [newMessage];
        if (oldData.some((msg) => msg.id === newMessage.id)) {
          return oldData;
        }
        return [...oldData, newMessage];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [instagramReceiverId, facebookReceiverId, queryClient]);

  return { contacts, isLoading, isError, messages };
}
