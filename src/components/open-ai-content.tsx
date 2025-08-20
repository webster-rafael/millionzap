import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  Search,
  Play,
  Copy,
  Square,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { usePrompts } from "@/hooks/usePrompts";
import type { Prompt, PromptCreate } from "@/interfaces/prompt-interface";
import { useQueues } from "@/hooks/useQueues";
import { promptSchema } from "@/validations/promptSchema";
import { useAuth } from "@/hooks/useAuth";

export function OpenAIContent() {
  const { user } = useAuth();
  const {
    prompts,
    isLoading,
    isError,
    createPrompt,
    updatePrompt,
    deletePrompt,
  } = usePrompts();
  const { queues } = useQueues();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setData] = useState<Prompt[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [formData, setFormData] = useState<
    Omit<Prompt, "id" | "apiKey" | "createdAt" | "updatedAt">
  >({
    title: "",
    prompt: "",
    description: "",
    companyResume: "",
    maxTokens: 500,
    maxMessages: 500,
    promptTokens: 1,
    temperature: 1,
    completionTokens: 1,
    totalTokens: 1,
    assistantId: "",
    companyId: user?.id ? user.id : "",
    queueId: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    title?: string[];
    prompt?: string[];
    description?: string[];
    companyResume?: string[];
    maxTokens?: string[];
    temperature?: string[];
    queueId?: string;
  }>({});
  useEffect(() => {
    if (!isLoading && !isError) {
      setData(prompts);
    }
  }, [prompts, isLoading, isError]);

  const filteredPrompts = prompts.filter((prompt) => {
    const term = searchTerm.toLowerCase();

    return (
      prompt.title.toLowerCase().includes(term) ||
      prompt.description?.toLowerCase().includes(term) ||
      (prompt.isActive ? "ativo" : "inativo").includes(term)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = promptSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};

      result.error.issues.forEach((issue) => {
        const field = issue.path[0];
        if (typeof field === "string") {
          if (!fieldErrors[field]) fieldErrors[field] = [];
          fieldErrors[field].push(issue.message);
        }
      });

      setValidationErrors(fieldErrors);
      toast.error("Corrija os campos obrigatórios antes de continuar.");
      return;
    }
    setValidationErrors({});

    const payload = {
      title: result.data.title,
      apiKey: import.meta.env.VITE_API_KEY_AI,
      prompt: result.data.prompt,
      maxTokens: result.data.maxTokens,
      maxMessages: result.data.maxMessages,
      temperature: result.data.temperature || 0.8,
      description: result.data.description || "",
      companyResume: result.data.companyResume,
      queueId: result.data.queueId || "",
      companyId: user?.id ? user.id : "",
    };

    try {
      if (editingPrompt) {
        await updatePrompt({
          ...editingPrompt,
          ...payload,
          id: editingPrompt.id,
        });
        toast.success("Prompt atualizado com sucesso!");
      } else {
        await createPrompt(payload as PromptCreate);
        toast.success("Prompt criado com sucesso!");
      }
      resetForm();
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar o prompt." + error);
    }
  };
  const resetForm = () => {
    setFormData({
      title: "",
      prompt: "",
      description: "",
      companyResume: "",
      queueId: "",
      maxTokens: 500,
      maxMessages: 500,
      promptTokens: 1,
      temperature: 0.8,
      completionTokens: 1,
      totalTokens: 1,
      assistantId: "",
      companyId: user?.id ? user.id : "",
    });
    setEditingPrompt(null);
    setIsDialogOpen(false);
  };

  const handleToggleActive = async (prompt: Prompt) => {
    const newIsActive = !prompt.isActive;

    try {
      updatePrompt({
        ...prompt,
        id: prompt.id,
        isActive: newIsActive,
      });
      toast.success(
        `Prompt ${newIsActive ? "ativado" : "desativado"} com sucesso!`,
      );
    } catch (error) {
      console.error("Falha ao atualizar o status do prompt:", error);
      toast.error("Ocorreu um erro ao atualizar o status.");
    }
  };

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setFormData({
      ...prompt,
      queueId: prompt.queueId || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      deletePrompt(id);
      toast.success("Prompt excluído com sucesso!");
    } catch (error) {
      console.error("Falha ao excluir o prompt:", error);
      toast.error("Ocorreu um erro ao excluir o prompt.");
    }
  };

  const handleDuplicate = (promptToDuplicate: Prompt) => {
    const newPromptPayload: PromptCreate = {
      ...promptToDuplicate,
      title: `${promptToDuplicate.title} (Cópia)`,
    };
    try {
      createPrompt(newPromptPayload);
      toast.success("Prompt duplicado com sucesso!");
    } catch (error) {
      console.error("Falha ao duplicar o prompt:", error);
      toast.error("Ocorreu um erro ao duplicar o prompt.");
    }
  };

  // const toggleStatus = async (prompt: Prompt) => {
  //   // const newStatus = prompt.status === "Ativo" ? "Inativo" : "Ativo";
  //   // const payload = { status: newStatus };
  //   // try {
  //   //   await updatePrompt(prompt.id, payload);
  //   //   toast.success("Status do prompt alterado!");
  //   // } catch (error) {
  //   //   toast.error("Falha ao alterar status.");
  //   // }
  //   toast.info("Função 'toggleStatus' precisa ser implementada com o backend.");
  // };

  const handleTest = (prompt: Prompt) => {
    toast.info(`Testando prompt: ${prompt.title}`);
  };

  const getQueueNameById = (queueId: string): string => {
    return (
      queues.find((q) => q.id === queueId)?.name || "Nenhuma fila encontrada"
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Bot className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Prompts</h1>
            <p className="text-sm text-gray-500">
              Gerencie prompts de IA para suas filas de atendimento
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00183E] hover:bg-[#00183E]/90">
              <Plus className="mr-2 h-4 w-4" />
              ADICIONAR PROMPT
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPrompt ? "Editar Prompt" : "Adicionar Prompt"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input
                    id="nome"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="Nome do prompt"
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-red-500">
                      {validationErrors.title[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxTokens">Máximo Tokens Resposta</Label>
                  <Input
                    id="maxTokens"
                    type="number"
                    value={formData.maxTokens}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maxTokens: Number.parseInt(e.target.value),
                      })
                    }
                    placeholder="500"
                  />
                  {validationErrors.maxTokens && (
                    <p className="text-sm text-red-500">
                      {validationErrors.maxTokens[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">
                  Descrição de comportamento da IA
                </Label>
                <Textarea
                  id="descricao"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva como a IA deve se comportar..."
                  rows={3}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-500">
                    {validationErrors.description[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt de comandos da IA *</Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) =>
                    setFormData({ ...formData, prompt: e.target.value })
                  }
                  placeholder="Digite o prompt que será usado pela IA..."
                  rows={6}
                />
                {validationErrors.prompt && (
                  <p className="text-sm text-red-500">
                    {validationErrors.prompt[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dadosEmpresa">
                  Dados da empresa para pesquisa e geração de respostas da IA *
                </Label>
                <Textarea
                  id="dadosEmpresa"
                  value={formData.companyResume}
                  onChange={(e) =>
                    setFormData({ ...formData, companyResume: e.target.value })
                  }
                  placeholder="Informações sobre a empresa que a IA pode usar..."
                  rows={4}
                />
                {validationErrors.companyResume && (
                  <p className="text-sm text-red-500">
                    {validationErrors.companyResume[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Resposta da IA *</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        temperature: Number(e.target.value),
                      })
                    }
                  />
                  {validationErrors.temperature && (
                    <p className="text-sm text-red-500">
                      {validationErrors.temperature[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  CANCELAR
                </Button>
                <Button
                  type="submit"
                  className="bg-[#00183E] hover:bg-[#00183E]/90"
                >
                  {editingPrompt ? "ATUALIZAR" : "ADICIONAR"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Pesquisar prompts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Setor/Fila</TableHead>
              <TableHead>Máximo Tokens Resposta</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo Resposta</TableHead>
              <TableHead>Total Usos</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPrompts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <Bot className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-500">
                        Nenhum prompt encontrado
                      </p>
                      <p className="text-sm text-gray-400">
                        {searchTerm
                          ? "Tente ajustar sua pesquisa"
                          : "Comece criando seu primeiro prompt de IA"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPrompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">
                        {prompt.title}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-700"
                    >
                      {getQueueNameById(prompt.queueId || "")}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {prompt.maxTokens}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={prompt.isActive ? "default" : "secondary"}
                      className={
                        prompt.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {prompt.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-purple-200 bg-purple-50 text-purple-700"
                    >
                      {typeof prompt.temperature === "number"
                        ? prompt.temperature <= 0.3
                          ? "Precisão"
                          : prompt.temperature <= 0.6
                            ? "Equilibrado"
                            : prompt.temperature <= 1
                              ? "Criatividade"
                              : "Livre"
                        : "Não definido"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {prompt.totalTokens}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(prompt.updatedAt).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(prompt)}
                        className="h-8 w-8 p-0"
                        title={prompt.isActive ? "Desativar" : "Ativar"}
                      >
                        {prompt.isActive ? (
                          <Square className="h-4 w-4 text-red-500" />
                        ) : (
                          <Play className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(prompt)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTest(prompt)}>
                            <Play className="mr-2 h-4 w-4" />
                            Testar Prompt
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDuplicate(prompt)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicar
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() => toggleStatus(prompt.id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            {prompt.status === "Ativo" ? "Desativar" : "Ativar"}
                          </DropdownMenuItem> */}
                          <DropdownMenuItem
                            onClick={() => handleDelete(prompt.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <Toaster />
    </div>
  );
}
