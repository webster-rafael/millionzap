import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  Tag,
  Clock,
  User,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuickResponses } from "@/hooks/useQuickResponse";
import type { QuickResponse } from "@/interfaces/quickresposnse-interface";
import { useQueues } from "@/hooks/useQueues";
import type { Queue } from "@/interfaces/queues-interface";
import { toast, Toaster } from "sonner";

const availableVariables = [
  {
    key: "{{primeiro_nome}}",
    label: "Primeiro Nome",
    description: "Nome do cliente",
  },
  {
    key: "{{nome}}",
    label: "Nome Completo",
    description: "Nome completo do cliente",
  },
  { key: "{{empresa}}", label: "Empresa", description: "Nome da sua empresa" },
  { key: "{{agente}}", label: "Agente", description: "Nome do atendente" },
  {
    key: "{{protocolo}}",
    label: "Protocolo",
    description: "Número do protocolo",
  },
  {
    key: "{{hora}}",
    label: "Hora Atual",
    description: "Hora atual do sistema",
  },
  {
    key: "{{data}}",
    label: "Data Atual",
    description: "Data atual do sistema",
  },
  {
    key: "{{saudacao}}",
    label: "Saudação",
    description: "Saudação baseada no horário",
  },
];

export function RespostasRapidasContent() {
  const {
    responses,
    isLoading,
    createResponse,
    isCreating,
    updateResponse,
    deleteResponse,
    isUpdating,
    isError,
  } = useQuickResponses();
  const { queues, isLoadingQueues } = useQueues();
  const [isAddingResponse, setIsAddingResponse] = useState(false);
  const [editingResponse, setEditingResponse] = useState<QuickResponse | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQueueId, setSelectedQueueId] = useState<string>("todas");
  const [newResponse, setNewResponse] = useState({
    shortcut: "",
    title: "",
    message: "",
    queueId: "",
  });

  useEffect(() => {
    if (!isLoadingQueues && queues.length > 0 && !newResponse.queueId) {
      setNewResponse((prevState) => ({
        ...prevState,
        queueId: queues[0].id,
      }));
    }
  }, [queues, isLoadingQueues, newResponse.queueId]);

  const filteredResponses = responses.filter((response) => {
    const matchesSearch =
      response.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.shortcut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      response.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedQueueId === "todas" || response.queueId === selectedQueueId;

    return matchesSearch && matchesCategory;
  });

  const getQueueFromId = (queueId: string): Queue | undefined => {
    return queues.find((q) => q.id === queueId);
  };

  const getCategoryColor = (queueName?: string) => {
    switch (queueName?.toLowerCase()) {
      case "atendimento":
        return "bg-blue-100 text-blue-800";
      case "vendas":
        return "bg-green-100 text-green-800";
      case "suporte":
        return "bg-purple-100 text-purple-800";
      case "geral":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (queueName?: string) => {
    switch (queueName?.toLowerCase()) {
      case "atendimento":
        return <MessageSquare className="h-4 w-4" />;
      case "vendas":
        return <Tag className="h-4 w-4" />;
      case "suporte":
        return <User className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const handleAddResponse = () => {
    if (
      !newResponse.shortcut.trim() ||
      !newResponse.title.trim() ||
      !newResponse.message.trim() ||
      !newResponse.queueId
    ) {
      return;
    }

    const payload = {
      ...newResponse,
      shortcut: newResponse.shortcut.startsWith("/")
        ? newResponse.shortcut
        : `/${newResponse.shortcut}`,
    };

    createResponse(payload, {
      onSuccess: () => {
        setNewResponse({
          shortcut: "",
          title: "",
          message: "",
          queueId: queues.length > 0 ? queues[0].id : "",
        });
        setIsAddingResponse(false);
      },
      onError: (error) => {
        console.error("Falha ao criar resposta:", error);
        alert("Não foi possível criar a resposta. Tente novamente.");
      },
    });
  };

  const handleUpdate = () => {
    if (!editingResponse) return;
    updateResponse(
      {
        id: editingResponse.id,
        title: editingResponse.title,
        shortcut: editingResponse.shortcut,
        message: editingResponse.message,
        queueId: editingResponse.queueId,
      },
      {
        onSuccess: () => {
          toast("Resposta rápida atualizada com sucesso!");
          setEditingResponse(null); // Fecha o modal
        },
        onError: (error) => {
          toast("Erro ao atualizar resposta rápida" + error.message);
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    deleteResponse(id, {
      onSuccess: () => {
        toast("Resposta rápida deletada com sucesso!");
      },
      onError: (error) => {
        toast("Erro ao deletar resposta rápida: " + error.message);
      },
    });
  };

  const insertVariable = (variable: string, isEditing = false) => {
    if (isEditing && editingResponse) {
      setEditingResponse({
        ...editingResponse,
        message: editingResponse.message + variable,
      });
    } else {
      setNewResponse({
        ...newResponse,
        message: newResponse.message + variable,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Respostas Rápidas
          </h1>
          <p className="text-gray-600">
            Gerencie templates de mensagens para agilizar o atendimento
          </p>
        </div>
        <Dialog open={isAddingResponse} onOpenChange={setIsAddingResponse}>
          <DialogTrigger asChild>
            <Button className="bg-[#00183E] hover:bg-[#00183E]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Resposta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Resposta Rápida</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shortcut">Atalho</Label>
                    <Input
                      id="shortcut"
                      value={newResponse.shortcut}
                      onChange={(e) =>
                        setNewResponse({
                          ...newResponse,
                          shortcut: e.target.value,
                        })
                      }
                      placeholder="/exemplo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="queueId">Fila</Label>
                    <Select
                      value={newResponse.queueId}
                      onValueChange={(value) =>
                        setNewResponse({ ...newResponse, queueId: value })
                      }
                      disabled={isLoadingQueues}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {queues.map((queue) => (
                          <SelectItem key={queue.id} value={queue.id}>
                            {queue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newResponse.title}
                    onChange={(e) =>
                      setNewResponse({ ...newResponse, title: e.target.value })
                    }
                    placeholder="Nome da resposta rápida"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    value={newResponse.message}
                    onChange={(e) =>
                      setNewResponse({
                        ...newResponse,
                        message: e.target.value,
                      })
                    }
                    placeholder="Digite sua mensagem aqui..."
                    rows={8}
                  />
                </div>
              </div>
              <div>
                <Label>Variáveis Disponíveis</Label>
                <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
                  {availableVariables.map((variable) => (
                    <div
                      key={variable.key}
                      className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50"
                      onClick={() => insertVariable(variable.key)}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {variable.key}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {variable.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {variable.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 border-t pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddingResponse(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddResponse}
                disabled={isCreating}
                className="bg-[#00183E] hover:bg-[#00183E]/90"
              >
                {isCreating ? "Criando..." : "Criar Resposta"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-8 w-8 text-[#00183E]" />
              <div>
                <p className="text-2xl font-bold">{responses.length}</p>
                <p className="text-sm text-gray-600">Total de Respostas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Tag className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {responses.filter((r) => r.queueId === "vendas").length}
                </p>
                <p className="text-sm text-gray-600">Vendas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {responses.filter((r) => r.queueId === "suporte").length}
                </p>
                <p className="text-sm text-gray-600">Suporte</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {responses.reduce((acc, r) => acc + r.usageCount, 0)}
                </p>
                <p className="text-sm text-gray-600">Usos Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Buscar respostas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={selectedQueueId}
              onValueChange={setSelectedQueueId}
              disabled={isLoadingQueues}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas as Filas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Filas</SelectItem>
                {queues.map((queue) => (
                  <SelectItem key={queue.id} value={queue.id}>
                    {queue.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas Rápidas ({filteredResponses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Atalho</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Carregando respostas...
                  </TableCell>
                </TableRow>
              ) : (
                filteredResponses.map((response) => {
                  const queue = getQueueFromId(response.queueId);
                  return (
                    <TableRow key={response.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {response.shortcut}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {response.title}
                      </TableCell>
                      <TableCell>
                        {queue ? (
                          <Badge
                            className={`${getCategoryColor(queue.name)} flex w-fit items-center space-x-1`}
                          >
                            {getCategoryIcon(queue.name)}
                            <span className="capitalize">{queue.name}</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline">Desconhecida</Badge>
                        )}
                      </TableCell>

                      <TableCell>{response.usageCount}</TableCell>
                      <TableCell>
                        {new Date(response.updatedAt).toLocaleDateString(
                          "pt-BR",
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(response.message)}
                            title="Copiar mensagem"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingResponse(response)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(response.id)}
                            title="Excluir"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingResponse}
        onOpenChange={() => setEditingResponse(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Resposta Rápida</DialogTitle>
          </DialogHeader>
          {editingResponse && (
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-shortcut">Atalho</Label>
                    <Input
                      id="edit-shortcut"
                      value={editingResponse.shortcut}
                      onChange={(e) =>
                        setEditingResponse({
                          ...editingResponse,
                          shortcut: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Categoria</Label>
                    <Select
                      value={editingResponse.queueId}
                      onValueChange={(value: QuickResponse["queueId"]) =>
                        setEditingResponse({
                          ...editingResponse,
                          queueId: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {queues.map((queue) => (
                          <SelectItem key={queue.id} value={queue.id}>
                            {queue.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-title">Título</Label>
                  <Input
                    id="edit-title"
                    value={editingResponse.title}
                    onChange={(e) =>
                      setEditingResponse({
                        ...editingResponse,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-message">Mensagem</Label>
                  <Textarea
                    id="edit-message"
                    value={editingResponse.message}
                    onChange={(e) =>
                      setEditingResponse({
                        ...editingResponse,
                        message: e.target.value,
                      })
                    }
                    rows={8}
                  />
                </div>
              </div>
              <div>
                <Label>Variáveis Disponíveis</Label>
                <div className="mt-2 max-h-80 space-y-2 overflow-y-auto">
                  {availableVariables.map((variable) => (
                    <div
                      key={variable.key}
                      className="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50"
                      onClick={() => insertVariable(variable.key, true)}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {variable.key}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="mt-1 text-sm font-medium">
                        {variable.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {variable.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2 border-t pt-4">
            <Button variant="outline" onClick={() => setEditingResponse(null)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              className="bg-[#00183E] hover:bg-[#00183E]/90"
            >
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
