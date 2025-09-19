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
  Image,
  FileText,
  Pencil,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useTags } from "@/hooks/useTags";
import { useContacts } from "@/hooks/useContacts";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { useNotes } from "@/hooks/useNotes";
import type { Note } from "@/interfaces/note-interface";
import { useUsers } from "@/hooks/useUsers";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { useConversationsInstagram } from "@/hooks/useConversationIg";
import type { ConversationInstagram } from "@/interfaces/conversationInstagram-interface";
import { InstagramChatArea } from "@/components/instagramChatArea";
import { useHandleInstagramCode } from "@/components/handoleInstagramCode";
import TextareaAutosize from "react-textarea-autosize";
import { RecordingTimer } from "@/components/recordingTimer";

interface DynamicAudioWaveformProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function AtendimentosContent() {
  useHandleInstagramCode();
  const { user } = useAuth();
  const { users } = useUsers();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { tags } = useTags();
  const { conversationId: selectedConversationId } = useParams<{
    conversationId: string;
  }>();
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("abertas");
  const [activeSubTab, setActiveSubTab] = useState("atendendo");
  const [activeSource, setActiveSource] = useState("whatsapp");
  const {
    conversations,
    remove,
    isLoadingConversations,
    isErrorConversations,
    update: updateConversation,
  } = useConversations();
  const {
    conversationsInstagram,
    isLoadingConversationsInstagram,
    isErrorConversationsInstagram,
  } = useConversationsInstagram();
  const { updateContact } = useContacts();
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
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const [isFacebookModalOpen, setIsFacebookModalOpen] = useState(false);
  const [facebookLoginStatus, setFacebookLoginStatus] = useState("unknown");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSendingDocument, setIsSendingDocument] = useState(false);

  const audioHistoryRef = useRef<number[]>([]);
  const MAX_WAVE_SAMPLES = 60;
  const lastSampleTimeRef = useRef(0);

  useEffect(() => {
    let animationFrameId: number;

    const drawWaves = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      const SAMPLE_INTERVAL_MS = 75;

      const now = Date.now();
      if (
        isRecording &&
        analyser &&
        now - lastSampleTimeRef.current > SAMPLE_INTERVAL_MS
      ) {
        lastSampleTimeRef.current = now;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        audioHistoryRef.current.push(average);
        if (audioHistoryRef.current.length > MAX_WAVE_SAMPLES) {
          audioHistoryRef.current.shift();
        }
      }

      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = 1;
          const gap = 2;
          let x = canvas.width;

          for (let i = audioHistoryRef.current.length - 1; i >= 0; i--) {
            const value = audioHistoryRef.current[i];
            const amplifiedHeight = (value / 255) * canvas.height * 1.9;
            const barHeight = Math.min(
              canvas.height,
              Math.max(2, amplifiedHeight),
            );

            ctx.fillStyle = "#636363";
            ctx.fillRect(
              x - (barWidth + gap),
              (canvas.height - barHeight) / 2,
              barWidth,
              barHeight,
            );

            x -= barWidth + gap;
            if (x < 0) break;
          }
        }
      }

      if (isRecording) {
        animationFrameId = requestAnimationFrame(drawWaves);
      }
    };

    if (isRecording) {
      animationFrameId = requestAnimationFrame(drawWaves);
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      audioHistoryRef.current = [];
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isRecording]);

  const currentConversations: Conversation[] = useMemo(() => {
    if (activeSource === "instagram") {
      return (conversationsInstagram as unknown as Conversation[]) ?? [];
    }
    return conversations ?? [];
  }, [activeSource, conversations, conversationsInstagram]);

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
        companyId: user?.companyId || "",
        userId: user.id,
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
        companyId: user?.companyId || "",
        userId: user.id,
      };

      sendMessageMutation.send(payload);
      setMessageInput("");
    }
  };

  const handleSendDocument = async (file: File) => {
    if (!selectedConversation || !user) {
      toast.error("Por favor, selecione uma conversa para enviar o documento.");
      return;
    }

    const webhookUrl = import.meta.env.VITE_SEND_DOCUMENT_WEBHOOK;
    if (!webhookUrl) {
      console.error(
        "Variável de ambiente VITE_SEND_DOCUMENT_WEBHOOK não está definida.",
      );
      toast.error("Erro de configuração interna. Contate o suporte.");
      return;
    }

    const userConnection = connections.find((c) => c.id === user.connectionId);
    if (!userConnection) {
      toast.error("A conexão associada ao seu usuário não foi encontrada.");
      return;
    }

    setIsSendingDocument(true);
    const toastId = toast.loading("Enviando documento...");

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("companyId", user.companyId || "");
    formData.append("conexao", userConnection.name);
    formData.append("conversationId", selectedConversation.id);
    formData.append(
      "recipientNumber",
      selectedConversation.contact?.phone || "",
    );
    formData.append("document", file, file.name);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Erro desconhecido no servidor." }));
        throw new Error(
          errorData.message || `Falha no envio: Status ${response.status}`,
        );
      }

      toast.success("Documento enviado com sucesso!", { id: toastId });
    } catch (error) {
      console.error("Erro ao enviar documento via webhook:", error);
      toast.error(
        `Erro: ${error instanceof Error ? error.message : "Não foi possível enviar o documento."}`,
        { id: toastId },
      );
    } finally {
      setIsSendingDocument(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 16 * 1024 * 1024) {
        toast.error("O arquivo não pode exceder 16MB.");
        return;
      }
      handleSendDocument(file);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    navigate(`/atendimentos/${conversation.id}`);
  };

  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) || null;

  const activeConversation = useMemo(() => {
    if (!selectedConversationId) return null;

    const allConversations =
      activeSource === "instagram" ? conversationsInstagram : conversations;

    return (
      allConversations.find((c) => c.id === selectedConversationId) || null
    );
  }, [
    selectedConversationId,
    activeSource,
    conversations,
    conversationsInstagram,
  ]);

  const contactId =
    activeSource === "whatsapp"
      ? (activeConversation as Conversation)?.contact?.id
      : null;
  const {
    notes,
    isLoadingNotes,
    createNote,
    isCreating,
    updateNote,
    isUpdating,
    removeNote,
  } = useNotes(contactId || "");

  const visibleConversations = useMemo(() => {
    let filtered = currentConversations;

    if (!filtered) return [];

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

        if (userQueueIds.size === 0) {
          return !conversation.queueId;
        }

        return conversation.queueId && userQueueIds.has(conversation.queueId);
      });
    }

    return filtered;
  }, [user, searchTerm, selectedQueueFilter, currentConversations]);

  const filteredConversations = useMemo(() => {
    if (activeSource === "instagram") {
      return visibleConversations;
    }
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
  }, [visibleConversations, activeTab, activeSubTab, searchTerm, activeSource]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages]);

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
      mediaRecorderRef.current = mediaRecorder;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioContext = new ((window as any).AudioContext ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;

      analyserRef.current = analyser;
      audioContextRef.current = audioContext;

      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/ogg",
        });
        handleSendMessage(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erro ao iniciar gravação:", error);
      toast.error("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = (send: boolean) => {
  setIsRecording(false);

  const recorder = mediaRecorderRef.current;
  if (recorder && recorder.state === "recording") {
    if (!send) recorder.onstop = null;

    recorder.stop();

    if (recorder.stream) {
      recorder.stream.getTracks().forEach((track) => track.stop());
    }
  }
  if (audioContextRef.current && audioContextRef.current.state !== "closed") {
    audioContextRef.current.close();
    audioContextRef.current = null;
  }

  analyserRef.current = null;
  mediaRecorderRef.current = null;
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

  const handleTagChange = (tagId: string) => {
    if (!selectedConversation) return;
    const newTagId = tagId === "no-tag" ? null : tagId;

    updateConversation({
      id: selectedConversation.id,
      tagId: newTagId,
    });
    toast.success("Tag atualizada com sucesso!");
  };

  const handleAddNewNote = () => {
    if (!newNoteContent.trim() || !contactId) return;
    createNote(
      { content: newNoteContent.trim(), contactId, userId: user?.id || "" },
      {
        onSuccess: () => {
          setNewNoteContent("");
          toast.success("Nota adicionada com sucesso!");
        },
        onError: () => toast.error("Falha ao adicionar nota."),
      },
    );
  };

  const handleUpdateNote = () => {
    if (!editingNote || !editingNote.content.trim()) return;
    updateNote(
      { id: editingNote.id, content: editingNote.content.trim() },
      {
        onSuccess: () => {
          setEditingNote(null);
          toast.success("Nota atualizada com sucesso!");
        },
        onError: () => toast.error("Falha ao atualizar nota."),
      },
    );
  };

  const handleDeleteNote = (noteId: string) => {
    removeNote(noteId, {
      onSuccess: () => toast.success("Nota removida com sucesso!"),
      onError: () => toast.error("Falha ao remover nota."),
    });
  };

  const handleIsCustomerToggle = (isCustomer: boolean) => {
    if (!selectedConversation?.contact?.id) {
      toast.error("Contato não selecionado para atualizar o status.");
      return;
    }

    const contactId = selectedConversation.contact.id;
    const queryKey = ["conversations"];
    queryClient.cancelQueries({ queryKey });

    const previousConversations =
      queryClient.getQueryData<Conversation[]>(queryKey);

    queryClient.setQueryData<Conversation[]>(queryKey, (oldData) => {
      if (!oldData) return [];
      return oldData.map((convo) => {
        if (convo.contact?.id === contactId) {
          return {
            ...convo,
            contact: { ...convo.contact, isCustomer: isCustomer },
          };
        }
        return convo;
      });
    });

    updateContact(
      {
        id: contactId,
        isCustomer,
      },
      {
        onSuccess: () => {
          toast.success(
            `Contato marcado como ${isCustomer ? "cliente" : "não cliente"}.`,
          );
        },
        onError: (err) => {
          queryClient.setQueryData(queryKey, previousConversations);
          toast.error("Falha ao atualizar. A alteração foi desfeita.");
          console.error("Erro na atualização otimista:", err);
        },
        onSettled: () => {
          queryClient.invalidateQueries({ queryKey });
        },
      },
    );
  };

  const handleFacebookIconClick = () => {
    setActiveSource("instagram");
    if (!window.FB) {
      toast.error("O SDK do Facebook ainda não foi carregado.");
      return;
    }
    // listConversationsIGWebhook();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.FB.getLoginStatus(function (response: any) {
      setFacebookLoginStatus(response.status);

      if (response.status === "connected") {
        toast.info("Você já está conectado com o Facebook!");
      } else {
        setIsFacebookModalOpen(true);
      }
    });
  };

  const handleFacebookLogin = () => {
    if (!window.FB) return;

    window.FB.login(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      function (response: any) {
        if (response.authResponse) {
          console.log(
            "Login bem-sucedido! Token:",
            response.authResponse.accessToken,
            facebookLoginStatus,
          );
          toast.success("Login com Facebook realizado com sucesso!");
          setFacebookLoginStatus("connected");
          setIsFacebookModalOpen(false);
        } else {
          console.log("Login cancelado ou falhou.");
          toast.error("O login com o Facebook foi cancelado ou falhou.");
        }
      },
      { scope: "public_profile,email" },
    );
  };

  const handleLoginInstagram = () => {
    window.location.href =
      "https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=3630138387292779&redirect_uri=https://milliontec.com.br/atendimentos&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights";
  };

  const listConversationsIGWebhook = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_LIST_CONVERSATION_IG_WEBHOOK,
        {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tokenIg: user?.tokenIg || "",
            instagramId: user?.instagramId || "",
            userId: user?.id,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Erro: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      toast.error("Erro ao listar conversas do Instagram.");
      console.error("Erro ao listar conversas IG webhook:", error);
      return null;
    }
  };

  function DynamicAudioWaveform({ canvasRef }: DynamicAudioWaveformProps) {
    return (
      <canvas
        ref={canvasRef}
        width="192"
        height="32"
        className="h-full w-full"
      />
    );
  }

  if (isErrorQueues) {
    toast.error("Erro ao buscar filas.");
  }

  const isLoading =
    activeSource === "whatsapp"
      ? isLoadingConversations
      : isLoadingConversationsInstagram;

  const isError =
    activeSource === "whatsapp"
      ? isErrorConversations
      : isErrorConversationsInstagram;

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
              <TabsTrigger
                onClick={() => {
                  setActiveSubTab("");
                }}
                value="resolvidas"
                className="text-xs"
              >
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

        <div className="flex items-center justify-between gap-2 border-b border-gray-200 p-4">
          {user?.role !== "USER" && (
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
          )}
          {user?.companyName === "Milliontech" && (
            <div className="flex gap-2">
              <FaWhatsapp
                onClick={() => {
                  toast.error("Essa funcionalidade está em desenvolvimento.");
                  setActiveSource("whatsapp");
                }}
                className="h-6 w-6 text-green-600 hover:scale-125"
              />
              <FaFacebook
                onClick={handleFacebookIconClick}
                className="h-6 w-6 text-blue-700 hover:scale-125"
              />
              <FaInstagram
                onClick={
                  user?.instagramAuthenticated
                    ? handleLoginInstagram
                    : listConversationsIGWebhook
                }
                className="h-6 w-6 text-pink-600 hover:scale-125"
              />
            </div>
          )}
        </div>

        {isFacebookModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
            onClick={() => setIsFacebookModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <FaFacebook className="mx-auto mb-4 h-12 w-12 text-blue-700" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Conectar com Facebook
                </h3>
                <p className="mb-6 text-sm text-gray-500">
                  Para continuar, faça login na sua conta do Facebook.
                </p>
                <Button
                  onClick={handleFacebookLogin}
                  className="flex w-full items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5]"
                >
                  <FaFacebook className="h-5 w-5" />
                  <span>Entrar com Facebook</span>
                </Button>
              </div>
            </motion.div>
          </motion.div>
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
            {isLoading && (
              <>
                <Skeleton className="h-32 bg-zinc-200" />
                <Skeleton className="h-32 bg-zinc-200" />
                <Skeleton className="h-32 bg-zinc-200" />
                <Skeleton className="h-32 bg-zinc-200" />
                <Skeleton className="h-32 bg-zinc-200" />
              </>
            )}
            {isError && (
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
                        <AvatarImage
                          src={
                            conversation.contact?.image || "/placeholder.svg"
                          }
                        />
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
                          {conversation.contact?.name}
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
                      <div className="mb-2 truncate text-sm text-gray-600">
                        {lastMessage?.messageType === "text" ? (
                          <>{lastMessage?.content || "Nenhuma mensagem"}</>
                        ) : lastMessage?.messageType === "audio" ? (
                          <div className="flex items-center gap-1">
                            <span>Mensagem de voz</span>
                            <Mic className="size-5" />
                          </div>
                        ) : lastMessage?.messageType === "image" ? (
                          <div className="flex items-center gap-1">
                            <p>Imagem</p>
                            <Image className="size-5" />
                          </div>
                        ) : lastMessage?.messageType === "document" ? (
                          <div className="flex items-center gap-1">
                            <p>Documento</p>
                            <FileText className="size-5" />
                          </div>
                        ) : (
                          <>{lastMessage?.content}</>
                        )}
                      </div>
                      <div className="flex w-full items-center justify-between">
                        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center space-x-2">
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
                            <>
                              <Badge
                                variant="secondary"
                                className="bg-yellow-100 text-xs text-yellow-800"
                              >
                                AGUARDANDO
                              </Badge>
                              {conversation.tagId && (
                                <Badge
                                  className="text-xs text-zinc-100"
                                  variant="outline"
                                  style={{
                                    backgroundColor: tags.find(
                                      (cx) => cx.id === conversation.tagId,
                                    )?.color,
                                  }}
                                >
                                  {tags
                                    .find((cx) => cx.id === conversation.tagId)
                                    ?.title?.toUpperCase()}
                                </Badge>
                              )}
                            </>
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

              if (activeSource === "instagram") {
                const conversationInfo =
                  conversation as unknown as ConversationInstagram;

                return (
                  <div key={conversation.id} className="relative">
                    <motion.div
                      className="relative z-10 w-full"
                      onClick={() => handleConversationSelect(conversation)}
                    >
                      <Card
                        className={`relative h-32 cursor-pointer border-l-4 border-pink-400 bg-pink-50 transition-all hover:shadow-md ${
                          selectedConversationId === conversation.id
                            ? "ring-2 ring-pink-300"
                            : ""
                        }`}
                      >
                        <CardContent className="flex h-full w-full items-start space-x-3 p-3">
                          <Avatar className="h-12 w-12 border">
                            <AvatarImage src={conversationInfo?.image} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-orange-400 text-white">
                              {conversationInfo?.name?.charAt(0) || "IG"}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 overflow-hidden">
                            <div className="mb-1 flex items-center justify-between">
                              <h3 className="truncate font-medium text-gray-900">
                                {conversationInfo?.name ||
                                  "Usuário do Instagram"}
                              </h3>
                              <span className="text-xs text-gray-500">
                                {(() => {
                                  const rawTimestamp = lastMessage?.timestamp;
                                  if (!rawTimestamp) return "";

                                  const date = new Date(Number(rawTimestamp));

                                  if (isNaN(date.getTime())) return "";
                                  return isToday(date)
                                    ? format(date, "HH:mm", { locale: ptBR })
                                    : format(date, "dd/MM/yyyy HH:mm", {
                                        locale: ptBR,
                                      });
                                })()}
                              </span>
                            </div>

                            <span className="truncate text-sm font-semibold text-pink-700">
                              @{conversationInfo?.username || "instagram"}
                            </span>

                            <p className="mt-1 mb-2 truncate text-sm text-gray-600">
                              {lastMessage?.content || "Nenhuma mensagem"}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                );
              }

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
                      dragConstraints={{ left: 0, right: 0 }}
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
                      dragConstraints={{ left: 0, right: 0 }}
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
        {activeSource === "instagram" && activeConversation ? (
          <InstagramChatArea
            conversation={activeConversation as ConversationInstagram}
          />
        ) : activeSource === "whatsapp" && selectedConversation ? (
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

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" title="Ver perfil">
                        <User className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="mt-1 mr-4 w-80">
                      <div className="grid w-full gap-4">
                        <div className="w-full space-y-2">
                          <h4 className="leading-none font-medium">
                            Perfil do Contato
                          </h4>
                          <p className="text-muted-foreground text-sm">
                            Informações e ações rápidas.
                          </p>
                        </div>
                        <div className="grid w-full gap-4">
                          <div className="flex w-full items-center gap-4 rounded-md border p-2">
                            <Avatar>
                              <AvatarImage src={"/placeholder.svg"} />
                              <AvatarFallback className="bg-primary-million text-white">
                                {selectedConversation.contact?.name.charAt(0) ||
                                  "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="truncate text-sm font-semibold">
                                {selectedConversation.contact?.name}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {selectedConversation.contact?.phone}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {selectedConversation.contact?.email ||
                                  "Nenhum e-mail"}
                              </p>
                            </div>
                          </div>

                          <div className="grid w-full gap-3">
                            <Label htmlFor="notes" className="font-semibold">
                              Notas
                            </Label>

                            {isLoadingNotes && (
                              <div className="space-y-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                              </div>
                            )}

                            {!isLoadingNotes && notes.length > 0 && (
                              <ScrollArea className="h-40">
                                <div className="space-y-2 pr-4">
                                  {notes.map((note: Note) => (
                                    <div key={note.id}>
                                      {editingNote?.id === note.id ? (
                                        <div className="space-y-2">
                                          <Textarea
                                            value={editingNote.content}
                                            onChange={(e) =>
                                              setEditingNote({
                                                ...editingNote,
                                                content: e.target.value,
                                                id: note.id,
                                              })
                                            }
                                            className="min-h-[60px]"
                                            autoFocus
                                          />
                                          <div className="flex justify-end gap-2">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() =>
                                                setEditingNote(null)
                                              }
                                            >
                                              Cancelar
                                            </Button>
                                            <Button
                                              size="sm"
                                              onClick={handleUpdateNote}
                                              disabled={isUpdating}
                                            >
                                              {isUpdating
                                                ? "Salvando..."
                                                : "Salvar"}
                                            </Button>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="group relative flex items-start justify-between rounded-md border bg-zinc-50 p-3">
                                          <div className="flex flex-col group-hover:opacity-0">
                                            <p className="text-muted-foreground absolute right-1 bottom-3 text-[0.60rem]">
                                              {
                                                users?.find(
                                                  (userName) =>
                                                    userName.id === note.userId,
                                                )?.name
                                              }
                                            </p>
                                            <p className="text-muted-foreground absolute right-1 bottom-1 text-[0.55rem]">
                                              {new Date(
                                                note.createdAt,
                                              ).toLocaleDateString("pt-BR", {
                                                year: "numeric",
                                                month: "2-digit",
                                                day: "2-digit",
                                              })}
                                            </p>
                                          </div>
                                          <p className="w-full pr-2 text-xs whitespace-pre-wrap text-zinc-700">
                                            {note.content}
                                          </p>
                                          <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                              onClick={() =>
                                                setEditingNote({
                                                  id: note.id,
                                                  content: note.content,
                                                })
                                              }
                                            >
                                              <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-red-500 hover:text-red-600"
                                              onClick={() =>
                                                handleDeleteNote(note.id)
                                              }
                                            >
                                              <Trash className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            )}

                            {!isLoadingNotes && notes.length === 0 && (
                              <div className="text-muted-foreground flex h-20 items-center justify-center rounded-md border border-dashed text-sm">
                                Nenhuma nota adicionada.
                              </div>
                            )}

                            <div className="mt-2 space-y-2">
                              <Textarea
                                id="new-note"
                                placeholder="Adicionar uma nova nota..."
                                value={newNoteContent}
                                onChange={(e) =>
                                  setNewNoteContent(e.target.value)
                                }
                                className="min-h-[60px]"
                              />
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={handleAddNewNote}
                                disabled={!newNoteContent.trim() || isCreating}
                              >
                                {isCreating
                                  ? "Adicionando..."
                                  : "Adicionar Nota"}
                              </Button>
                            </div>
                          </div>

                          <div className="grid w-full items-center gap-1.5">
                            <Label>Tag</Label>
                            <Select
                              onValueChange={handleTagChange}
                              value={selectedConversation?.tagId || "no-tag"}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma tag" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="no-tag">
                                  Nenhuma tag
                                </SelectItem>
                                {tags?.map((tag) => (
                                  <SelectItem key={tag.id} value={tag.id}>
                                    {tag.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between rounded-md border p-3">
                            <div className="space-y-0.5">
                              <Label className="font-semibold">Cliente</Label>
                              <p className="text-muted-foreground text-xs">
                                Marque se este contato já é um cliente.
                              </p>
                            </div>
                            <Switch
                              checked={
                                selectedConversation.contact?.isCustomer ||
                                false
                              }
                              onCheckedChange={handleIsCustomerToggle}
                            />
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

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
                              <div className="flex w-80 flex-col gap-2 p-2 pb-4">
                                <FileViewer
                                  src={message?.mediaUrl || ""}
                                  isAgent={isAgent}
                                  name={message?.content || ""}
                                />
                                <span className="text-sm text-gray-500">
                                  {message?.mediaCaption || ""}
                                </span>
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
              {isRecording ? (
                // ---- INTERFACE DE GRAVAÇÃO (JÁ ESTAVA CORRETA) ----
                <div className="flex h-[54px] items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-100"
                    onClick={() => stopRecording(false)}
                  >
                    <Trash className="h-5 w-5" />
                  </Button>
                  <div className="flex h-full flex-1 items-center justify-between rounded-full bg-gray-100 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />

                      {/* 👇 SUBSTITUA O SPAN ANTIGO POR ISTO 👇 */}
                      <RecordingTimer isRecording={isRecording} />
                    </div>
                    {isRecording && (
                      <div className="flex h-full items-center">
                        <DynamicAudioWaveform canvasRef={canvasRef} />
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    className="bg-primary-million hover:bg-primary-million/90 h-12 w-12 flex-shrink-0 rounded-full"
                    onClick={() => stopRecording(true)}
                  >
                    <Send className="h-5 w-5 text-white" />
                  </Button>
                </div>
              ) : (
                // ---- INTERFACE DE TEXTO (VERSÃO CORRIGIDA E LIMPA) ----
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelected}
                    style={{ display: "none" }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!selectedConversation || isSendingDocument}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {isSendingDocument ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <Paperclip className="h-5 w-5" />
                    )}
                  </Button>
                  <div className="relative flex-1">
                    <TextareaAutosize
                      placeholder="Digite uma mensagem..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (messageInput.trim() !== "") {
                            handleSendMessage();
                          }
                        }
                      }}
                      maxRows={6}
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground flex w-full resize-none rounded-md border py-3 pr-12 pl-4 text-sm focus-visible:ring-1 focus-visible:ring-blue-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>

                  {/* LÓGICA CORRETA PARA ALTERNAR ENTRE MIC E SEND */}
                  {messageInput.trim() === "" ? (
                    <Button
                      variant="outline"
                      className="size-12"
                      onClick={startRecording}
                    >
                      <Mic className="size-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSendMessage()}
                      className="bg-primary-million hover:bg-primary-million/90 size-12"
                    >
                      <Send className="size-5" />
                    </Button>
                  )}
                </div>
              )}
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
