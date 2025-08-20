import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageSquare, Edit, Trash2, Plus, Palette } from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { useQueues } from "@/hooks/useQueues";
import type { Queue, QueueCreate } from "@/interfaces/queues-interface";
import { usePrompts } from "@/hooks/usePrompts";
import type { Prompt } from "@/interfaces/prompt-interface";
import { useAuth } from "@/hooks/useAuth";

type Schedule = {
  weekday: string;
  startTime: string;
  endTime: string;
  weekdayEn: string;
};
type Horarios = { [key: string]: { inicio: string; fim: string } };

const diasSemana = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
] as const;

const cores = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#6b7280",
  "#374151",
];

const createInitialHorarios = (): Horarios => {
  const horarios: Horarios = {};
  diasSemana.forEach((dia) => {
    if (dia === "Sábado") horarios[dia] = { inicio: "08:00", fim: "12:00" };
    else if (dia === "Domingo")
      horarios[dia] = { inicio: "00:00", fim: "00:00" };
    else horarios[dia] = { inicio: "08:00", fim: "18:00" };
  });
  return horarios;
};

const schedulesToHorarios = (schedules: Schedule[]): Horarios => {
  const horarios: Horarios = createInitialHorarios();
  if (Array.isArray(schedules)) {
    schedules.forEach((schedule) => {
      if (horarios[schedule.weekday]) {
        horarios[schedule.weekday] = {
          inicio: schedule.startTime,
          fim: schedule.endTime,
        };
      }
    });
  }
  return horarios;
};

const horariosToSchedules = (horarios: Horarios): Schedule[] => {
  return Object.entries(horarios).map(([weekday, times]) => ({
    weekday: weekday,
    startTime: times.inicio,
    endTime: times.fim,
    weekdayEn: weekday
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace("-feira", ""),
  }));
};

export default function FilasChatbotContent() {
  const { user } = useAuth();
  const { queues, create, isErrorQueues, update, isLoadingQueues, remove } =
    useQueues();

  const { prompts } = usePrompts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dados" | "horarios">("dados");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingFilaId, setEditingFilaId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchTerm, _] = useState("");
  const [promptsList, setPromptList] = useState<Prompt[]>([]);
  const [selectedConnectionIds, setSelectedConnectionIds] = useState<string[]>(
    [],
  );

  const initialFormData = {
    name: "",
    color: "#3b82f6",
    priority: 0,
    integrationId: "",
    promptId: "",
    greetingMessage: "",
    outOfOfficeHoursMessage: "",
    horarios: createInitialHorarios(),
    companyId: user?.id ? user.id : "",
    connections: [] as string[],
  };
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (prompts.length) {
      setPromptList(prompts);
    }
  }, [prompts]);

  const filteredFilas = useMemo(() => {
    return queues.filter(
      (fila) =>
        fila.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fila.greetingMessage?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [queues, searchTerm]);

  const handleOpenModal = (fila?: Queue) => {
    if (fila) {
      // A lógica para editar continua a mesma
      setEditingFilaId(fila.id);
      setFormData({
        name: fila.name,
        color: fila.color,
        priority: fila.priority,
        integrationId: fila.integrationId || "",
        promptId: fila.promptId || "",
        greetingMessage: fila.greetingMessage || "",
        outOfOfficeHoursMessage: fila.outOfOfficeHoursMessage || "",
        horarios: schedulesToHorarios(fila.schedules as unknown as Schedule[]),
        companyId: user?.id || "",
        connections: fila.connections || [],
      });
      setSelectedConnectionIds(fila.connections || []);
    } else {
      setEditingFilaId(null);
      setFormData(initialFormData);
      setSelectedConnectionIds([]);
    }
    setActiveTab("dados");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast("O nome da fila é obrigatório.");
      return;
    }

    const basePayload: QueueCreate = {
      name: formData.name.trim(),
      color: formData.color,
      priority: formData.priority || 0,
      integrationId: formData.integrationId || "",
      promptId: formData.promptId || "",
      greetingMessage: formData.greetingMessage,
      outOfOfficeHoursMessage: formData.outOfOfficeHoursMessage,
      schedules: horariosToSchedules(formData.horarios),
      companyId: formData.companyId,
      connections: formData.connections,
    };

    if (editingFilaId) {
      update(
        { id: editingFilaId, ...basePayload },
        {
          onSuccess: () => {
            toast("Fila atualizada com sucesso!");
            handleCloseModal();
          },
          onError: (error) => {
            toast("Erro ao atualizar fila: " + error.message);
          },
        },
      );
    } else {
      create(basePayload, {
        onSuccess: () => {
          toast("Fila criada com sucesso!");
          handleCloseModal();
        },
        onError: (error) => {
          toast("Erro ao criar fila: " + error.message);
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    remove(id, {
      onSuccess: () => toast("Fila excluída com sucesso!"),
      onError: (error) => toast("Erro ao excluir fila: " + error.message),
    });
  };

  const handleColorSelect = (color: string) => {
    console.error(selectedConnectionIds);
    setFormData((prev) => ({ ...prev, color }));
    setShowColorPicker(false);
    console.log(selectedConnectionIds)
  };

  const handleHorarioChange = (
    dia: string,
    tipo: "inicio" | "fim",
    valor: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [dia]: {
          ...prev.horarios[dia],
          [tipo]: valor,
        },
      },
    }));
  };

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Filas & Chatbot
              </h1>
            </div>
            <p className="mt-1 text-gray-600">
              Gerencie filas de atendimento e configurações de chatbot
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={() => handleOpenModal()}
              className="bg-[#00183E] hover:bg-[#00183E]/90"
            >
              ADICIONAR FILA
            </Button>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Nome</TableHead>
                <TableHead className="text-center">Cor</TableHead>
                <TableHead className="text-center">Ordenação (bot)</TableHead>
                <TableHead className="text-center">
                  Mensagem de saudação
                </TableHead>
                <TableHead className="text-center">Prompt</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingQueues && (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              )}
              {isErrorQueues && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-red-500"
                  >
                    Erro ao carregar filas.
                  </TableCell>
                </TableRow>
              )}
              {!isLoadingQueues && !isErrorQueues && filteredFilas.length > 0
                ? filteredFilas.map((fila) => (
                    <TableRow className="text-center" key={fila.id}>
                      <TableCell className="font-medium">{fila.name}</TableCell>
                      <TableCell className="flex h-12 items-center justify-center">
                        <div
                          className="h-4 w-16 rounded"
                          style={{ backgroundColor: fila.color }}
                        ></div>
                      </TableCell>
                      <TableCell>{fila.priority}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {fila.greetingMessage || "Não definida"}
                      </TableCell>
                      <TableCell>
                        {promptsList.find((p) => p.id === fila.promptId)
                          ?.title || "Não definido"}
                      </TableCell>
                      <TableCell className="">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenModal(fila)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(fila.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                : null}
              {!isLoadingQueues &&
                !isErrorQueues &&
                filteredFilas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Nenhuma fila encontrada.
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingFilaId ? "Editar fila" : "Adicionar fila"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            {/* Tabs */}
            <div className="mb-6 flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("dados")}
                className={`border-b-2 px-4 py-2 text-sm font-medium ${
                  activeTab === "dados"
                    ? "border-[#00183E] text-[#00183E]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                DADOS DA FILA
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("horarios")}
                className={`border-b-2 px-4 py-2 text-sm font-medium ${
                  activeTab === "horarios"
                    ? "border-[#00183E] text-[#00183E]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                HORÁRIOS DE ATENDIMENTO
              </button>
            </div>

            {activeTab === "dados" && (
              <div className="space-y-6">
                {/* Nome e Cor */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Nome da fila"
                      className={!formData.name ? "border-red-300" : ""}
                      required
                    />
                    {!formData.name && (
                      <p className="mt-1 text-xs text-red-500">Required</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Cor
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(!showColorPicker)}
                        className="flex h-10 w-full items-center justify-between rounded border border-gray-300 px-3"
                        style={{ backgroundColor: formData.color }}
                      >
                        <span className="font-mono text-sm text-white">
                          {formData.color.toUpperCase()}
                        </span>
                        <Palette className="h-4 w-4 text-white" />
                      </button>

                      {showColorPicker && (
                        <div className="absolute top-12 right-0 z-50 w-60 rounded-lg border border-gray-300 bg-white p-4 shadow-lg">
                          <div className="grid grid-cols-10 gap-2">
                            {cores.map((cor) => (
                              <button
                                key={cor}
                                type="button"
                                onClick={() => handleColorSelect(cor)}
                                className="h-6 w-6 rounded border border-gray-300 transition-transform hover:scale-110"
                                style={{ backgroundColor: cor }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ordem da fila */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Ordem da fila (Bot)
                  </label>
                  <Input
                    type="text"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="0"
                  />
                </div>

                {/* Integração e Prompt */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-gray-700">
                      Integração
                    </Label>
                    <Select
                      value={formData.integrationId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          integrationId: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma integração" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dialogflow">DialogFlow</SelectItem>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="watson">Watson</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-gray-700">
                      Prompt
                    </Label>
                    <Select
                      value={formData.promptId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, promptId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um prompt" />
                      </SelectTrigger>
                      <SelectContent>
                        {promptsList.map((prompt) => (
                          <SelectItem key={prompt.id} value={prompt.id}>{`${
                            prompt.id === undefined
                              ? "Prompt não definido"
                              : prompt.title
                          }`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Mensagem de saudação
                    </label>
                    <Textarea
                      value={formData.greetingMessage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          greetingMessage: e.target.value,
                        }))
                      }
                      placeholder="Digite a mensagem de saudação..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Mensagem de fora de expediente
                    </label>
                    <Textarea
                      value={formData.outOfOfficeHoursMessage}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          outOfOfficeHoursMessage: e.target.value,
                        }))
                      }
                      placeholder="Digite a mensagem de fora de expediente..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Opções */}
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Opções
                    </label>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      ADICIONAR
                    </Button>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 text-xs text-white">
                      1
                    </div>
                    Título não definido
                    <Edit className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "horarios" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {diasSemana.map((dia) => (
                    <div
                      key={dia}
                      className="grid grid-cols-1 items-center gap-4 md:grid-cols-3"
                    >
                      <div className="text-sm font-medium text-gray-700">
                        {dia}
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Hora de Inicial
                        </label>
                        <Input
                          type="time"
                          value={formData.horarios[dia]?.inicio || "08:00"}
                          onChange={(e) =>
                            handleHorarioChange(dia, "inicio", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-gray-500">
                          Hora de Final
                        </label>
                        <Input
                          type="time"
                          value={formData.horarios[dia]?.fim || "18:00"}
                          onChange={(e) =>
                            handleHorarioChange(dia, "fim", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botões do Modal */}
            <div className="mt-6 flex justify-end space-x-4 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
              >
                CANCELAR
              </Button>
              <Button
                type="submit"
                className="bg-[#00183E] hover:bg-[#00183E]/90"
              >
                {editingFilaId ? "ATUALIZAR" : "ADICIONAR"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
