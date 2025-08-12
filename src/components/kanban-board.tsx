import { useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import {
  Calendar,
  MessageSquare,
  Phone,
  Loader2,
  Headset,
  MessageSquareDot,
  TicketCheck,
  MessageSquareX,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTags } from "@/hooks/useTags";
import type { Conversation } from "@/interfaces/conversation-interface";
import { useKanbanConversations } from "@/hooks/useConversationKanban";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
interface Column {
  id: string;
  title: string;
  color: string;
  conversations: Conversation[];
}

function hexToRgba(hex: string, opacity: number): string {
  const cleanHex = hex.replace("#", "");
  const bigint = parseInt(cleanHex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function KanbanBoard() {
  const { tags, isLoadingTags, isErrorTags } = useTags();
  const { conversations, isLoadingConversations, update } =
    useKanbanConversations();

  const columns = useMemo<Column[]>(() => {
    if (!tags || tags.length === 0) return [];
    return tags.map((tag) => ({
      id: tag.id,
      title: tag.title,
      color: tag.color,
      conversations: conversations.filter((conv) => conv.tagId === tag.id),
    }));
  }, [tags, conversations]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    update({ id: draggableId, tagId: destination.droppableId });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500 text-white";
      case "HIGH":
        return "bg-orange-500 text-white";
      case "MEDIUM":
        return "bg-yellow-500 text-white";
      case "LOW":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "WAITING":
        return <MessageSquareDot className="h-4 w-4" />;
      case "SERVING":
        return <Headset className="h-4 w-4" />;
      case "RESOLVED":
        return <TicketCheck className="h-4 w-4" />;
      case "CLOSED":
        return <MessageSquareX className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoadingTags)
    return (
      <div className="p-6 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
      </div>
    );
  if (isErrorTags)
    return (
      <div className="p-6 text-center text-red-500">
        Falha ao carregar kanban.
      </div>
    );

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kanban - Gestão de Tarefas
            </h1>
            <p className="text-gray-600">
              Organize e acompanhe o progresso das suas tarefas e atendimentos
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex min-w-max space-x-6">
            {columns.map((column) => (
              <div key={column.id} className="w-80 flex-shrink-0">
                <div
                  style={{
                    backgroundColor: hexToRgba(column.color, 0.2), // 0.2 = 20% opacidade
                    borderColor: column.color,
                  }}
                  className="flex h-full flex-col rounded-lg border-2"
                >
                  {/* Column Header */}
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {column.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-[#00183E] text-white"
                      >
                        {column.conversations.length}
                      </Badge>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <>
                        {isLoadingConversations ? (
                          <>
                            <div className="flex flex-col gap-3 p-4">
                              <Skeleton className="h-54 bg-zinc-200 p-4" />
                              <Skeleton className="h-54 bg-zinc-200 p-4" />
                              <Skeleton className="h-54 bg-zinc-200 p-4" />
                              <Skeleton className="h-54 bg-zinc-200 p-4" />
                            </div>
                          </>
                        ) : (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-50 flex-1 space-y-3 p-4 ${
                              snapshot.isDraggingOver ? "bg-blue-5" : ""
                            }`}
                          >
                            {column.conversations.map((conversation, index) => (
                              <Draggable
                                key={conversation.id}
                                draggableId={conversation.id}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <Card
                                      className={`cursor-grab gap-3 p-4 transition-shadow hover:shadow-md active:cursor-grabbing ${
                                        snapshot.isDragging
                                          ? "rotate-2 shadow-lg"
                                          : ""
                                      }`}
                                    >
                                      <CardHeader className="px-0">
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center space-x-2">
                                            {getTypeIcon(conversation.status)}
                                            <h4 className="line-clamp-2 text-sm font-medium text-gray-900">
                                              {conversation.contact?.name ||
                                                "Usuário"}
                                            </h4>
                                          </div>
                                          {/* <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button> */}
                                        </div>
                                      </CardHeader>

                                      <Separator />

                                      <CardContent className="flex h-12 flex-col justify-center gap-2 px-0">
                                        <span className="text-center text-xs text-zinc-600">
                                          {(() => {
                                            const rawTimestamp =
                                              conversation.messages?.[0]
                                                ?.timestamp;

                                            if (!rawTimestamp)
                                              return "Sem data";

                                            const date = new Date(
                                              rawTimestamp * 1000,
                                            );

                                            return isToday(date)
                                              ? format(date, "HH:mm", {
                                                  locale: ptBR,
                                                })
                                              : format(
                                                  date,
                                                  "dd/MM/yyyy HH:mm",
                                                  {
                                                    locale: ptBR,
                                                  },
                                                );
                                          })()}
                                        </span>
                                        <p className="truncate text-sm text-gray-600">
                                          {conversation.messages?.[0].content}
                                        </p>
                                      </CardContent>

                                      {conversation.contactId && (
                                        <div className="flex items-center space-x-2 rounded bg-gray-50 p-2">
                                          <Phone className="h-3 w-3 text-gray-500" />
                                          <div className="text-xs">
                                            <p className="font-medium">
                                              {conversation.contactId}
                                            </p>
                                            <p className="text-gray-500">
                                              {conversation.contact?.email ||
                                                "Nenhum e-mail encontrado"}
                                            </p>
                                          </div>
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between">
                                        <Badge
                                          className={`text-xs ${getPriorityColor(
                                            conversation.priority || "NENHUMA",
                                          )}`}
                                        >
                                          {conversation.priority === "LOW"
                                            ? "BAIXA"
                                            : conversation.priority === "MEDIUM"
                                              ? "MÉDIO"
                                              : conversation.priority === "HIGH"
                                                ? "ALTA"
                                                : conversation.priority ===
                                                    "URGENT"
                                                  ? "URGENTE"
                                                  : "NENHUMA"}
                                        </Badge>
                                        {conversation.createdAt && (
                                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                                            <Calendar className="h-3 w-3" />
                                            <span>
                                              {new Date(
                                                conversation.createdAt,
                                              ).toLocaleDateString("pt-BR")}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      {/* {task.assignee && (
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={
                                            task.assignee.avatar ||
                                            "/placeholder.svg"
                                          }
                                        />
                                        <AvatarFallback className="bg-[#00183E] text-xs text-white">
                                          {task.assignee.name.charAt(0)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-gray-600">
                                        {task.assignee.name}
                                      </span>
                                    </div>
                                  )} */}
                                      {/* </CardContent> */}
                                    </Card>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
