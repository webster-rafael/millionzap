import { useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

interface Fila {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
  integracao: string;
  prompt: string;
  mensagemSaudacao: string;
  mensagemForaExpediente: string;
  horarios: {
    [key: string]: { inicio: string; fim: string };
  };
  opcoes: string[];
  criadoEm: Date;
}

type FormDataState = Omit<Fila, "id" | "criadoEm" | "ordem"> & {
  ordem: string; // Ordem é string no input
};

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

const createInitialFormData = (): FormDataState => {
  const horariosIniciais: { [key: string]: { inicio: string; fim: string } } =
    {};
  diasSemana.forEach((dia) => {
    if (dia === "Sábado") {
      horariosIniciais[dia] = { inicio: "08:00", fim: "12:00" };
    } else if (dia === "Domingo") {
      horariosIniciais[dia] = { inicio: "00:00", fim: "00:00" };
    } else {
      horariosIniciais[dia] = { inicio: "08:00", fim: "18:00" };
    }
  });

  return {
    nome: "",
    cor: "#3b82f6",
    ordem: "",
    integracao: "",
    prompt: "",
    mensagemSaudacao: "",
    mensagemForaExpediente: "",
    horarios: horariosIniciais,
    opcoes: [],
  };
};

export default function FilasChatbotContent() {
  const [filas, setFilas] = useState<Fila[]>([
    {
      id: "1",
      nome: "Fila 1",
      cor: "#3b82f6",
      ordem: 1,
      integracao: "DialogFlow",
      prompt: "Atendimento Geral",
      mensagemSaudacao: "Olá! Como posso ajudá-lo?",
      mensagemForaExpediente: "Estamos fora do horário de atendimento.",
      horarios: {
        "Segunda-feira": { inicio: "08:00", fim: "18:00" },
        "Terça-feira": { inicio: "08:00", fim: "18:00" },
        "Quarta-feira": { inicio: "08:00", fim: "18:00" },
        "Quinta-feira": { inicio: "08:00", fim: "18:00" },
        "Sexta-feira": { inicio: "08:00", fim: "18:00" },
        Sábado: { inicio: "08:00", fim: "12:00" },
        Domingo: { inicio: "00:00", fim: "00:00" },
      },
      opcoes: [],
      criadoEm: new Date(),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"dados" | "horarios">("dados");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [editingFila, setEditingFila] = useState<Fila | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<FormDataState>(
    createInitialFormData(),
  );

  const filteredFilas = filas.filter(
    (fila) =>
      fila.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fila.mensagemSaudacao.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleOpenModal = (fila?: Fila) => {
    if (fila) {
      setEditingFila(fila);
      setFormData({
        ...fila,
        ordem: fila.ordem.toString(), // Converte para string para o input
      });
    } else {
      setEditingFila(null);
      setFormData(createInitialFormData()); // Reseta o formulário
    }
    setActiveTab("dados");
    setShowColorPicker(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFila(null);
    // Não precisa resetar o form aqui, pois `handleOpenModal` e `handleSubmit` já cuidam disso.
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    const filaData: Omit<Fila, "id" | "criadoEm"> = {
      nome: formData.nome.trim(),
      cor: formData.cor,
      ordem: Number(formData.ordem) || filas.length + 1, // Garante uma ordem padrão
      integracao: formData.integracao,
      prompt: formData.prompt,
      mensagemSaudacao: formData.mensagemSaudacao,
      mensagemForaExpediente: formData.mensagemForaExpediente,
      horarios: formData.horarios,
      opcoes: formData.opcoes,
    };

    if (editingFila) {
      const filaAtualizada: Fila = {
        ...filaData,
        id: editingFila.id,
        criadoEm: editingFila.criadoEm,
      };
      setFilas((prevFilas) =>
        prevFilas.map((f) => (f.id === editingFila.id ? filaAtualizada : f)),
      );
      toast({
        title: "Sucesso",
        description: "Fila atualizada com sucesso!",
      });
    } else {
      const novaFila: Fila = {
        ...filaData,
        id: Date.now().toString(),
        criadoEm: new Date(),
      };
      setFilas((prevFilas) => [...prevFilas, novaFila]);
      toast({
        title: "Sucesso",
        description: "Fila criada com sucesso!",
      });
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta fila?")) {
      setFilas((prevFilas) => prevFilas.filter((f) => f.id !== id));
      toast({
        title: "Sucesso",
        description: "Fila excluída com sucesso!",
      });
    }
  };

  const handleColorSelect = (cor: string) => {
    setFormData((prev) => ({ ...prev, cor }));
    setShowColorPicker(false);
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
                <TableHead>Nome</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Ordenação (bot)</TableHead>
                <TableHead>Mensagem de saudação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFilas.length > 0 ? (
                filteredFilas.map((fila) => (
                  <TableRow key={fila.id}>
                    <TableCell className="font-medium">{fila.nome}</TableCell>
                    <TableCell>
                      <div
                        className="h-4 w-16 rounded"
                        style={{ backgroundColor: fila.cor }}
                      ></div>
                    </TableCell>
                    <TableCell>{fila.ordem}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {fila.mensagemSaudacao || "Não definida"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
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
              ) : (
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
              {editingFila ? "Editar fila" : "Adicionar fila"}
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
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          nome: e.target.value,
                        }))
                      }
                      placeholder="Nome da fila"
                      className={!formData.nome ? "border-red-300" : ""}
                      required
                    />
                    {!formData.nome && (
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
                        style={{ backgroundColor: formData.cor }}
                      >
                        <span className="font-mono text-sm text-white">
                          {formData.cor.toUpperCase()}
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
                    type="number"
                    value={formData.ordem}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ordem: e.target.value,
                      }))
                    }
                    placeholder="1"
                    min="1"
                  />
                </div>

                {/* Integração e Prompt */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="mb-2 block text-sm font-medium text-gray-700">
                      Integração
                    </Label>
                    <Select
                      value={formData.integracao}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, integracao: value }))
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
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Prompt
                    </label>
                    <Select
                      value={formData.prompt}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, prompt: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um prompt" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="atendimento-geral">
                          Atendimento Geral
                        </SelectItem>
                        <SelectItem value="suporte-tecnico">
                          Suporte Técnico
                        </SelectItem>
                        <SelectItem value="vendas">Vendas</SelectItem>
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
                      value={formData.mensagemSaudacao}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mensagemSaudacao: e.target.value,
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
                      value={formData.mensagemForaExpediente}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          mensagemForaExpediente: e.target.value,
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
                {editingFila ? "ATUALIZAR" : "ADICIONAR"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
