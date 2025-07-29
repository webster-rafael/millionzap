/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Calendar,
  User,
  Filter,
  Download,
  FileText,
  Paperclip,
  Users,
  Bell,
  Archive,
} from "lucide-react";
import { toast } from "sonner";

interface Informativo {
  id: string;
  titulo: string;
  conteudo: string;
  prioridade: "baixa" | "media" | "alta" | "urgente";
  status: "ativo" | "inativo" | "agendado" | "arquivado";
  dataPublicacao: string;
  dataExpiracao?: string;
  autor: string;
  visualizacoes: number;
  anexo?: string;
  destinatarios: string[];
  categoria: "geral" | "reuniao" | "evento" | "comunicado" | "aviso";
}

export function InformativosContent() {
  const [informativos, setInformativos] = useState<Informativo[]>([
    {
      id: "1",
      titulo: "Reunião Mensal - Janeiro 2024",
      conteudo:
        "Reunião mensal da equipe para discussão dos resultados de janeiro e planejamento de fevereiro. Local: Sala de Reuniões A. Horário: 14:00h.",
      prioridade: "alta",
      status: "ativo",
      dataPublicacao: "2024-01-15",
      dataExpiracao: "2024-01-30",
      autor: "Gerência",
      visualizacoes: 45,
      anexo: "agenda-reuniao-jan.pdf",
      destinatarios: ["Todos os funcionários"],
      categoria: "reuniao",
    },
    {
      id: "2",
      titulo: "Atualização do Sistema - Manutenção Programada",
      conteudo:
        "O sistema passará por manutenção programada no próximo sábado das 02:00 às 06:00. Durante este período, algumas funcionalidades podem ficar indisponíveis.",
      prioridade: "media",
      status: "ativo",
      dataPublicacao: "2024-01-12",
      dataExpiracao: "2024-01-20",
      autor: "TI",
      visualizacoes: 78,
      destinatarios: ["Todos os usuários"],
      categoria: "aviso",
    },
    {
      id: "3",
      titulo: "Novo Colaborador - Bem-vindo João Silva",
      conteudo:
        "Temos o prazer de anunciar a chegada do João Silva, que se juntará à nossa equipe de desenvolvimento como Desenvolvedor Full Stack.",
      prioridade: "baixa",
      status: "ativo",
      dataPublicacao: "2024-01-10",
      autor: "RH",
      visualizacoes: 32,
      destinatarios: ["Equipe de Desenvolvimento", "Gerência"],
      categoria: "comunicado",
    },
    {
      id: "4",
      titulo: "Treinamento de Segurança - Obrigatório",
      conteudo:
        "Treinamento obrigatório sobre segurança da informação. Todos os funcionários devem participar até o final do mês.",
      prioridade: "urgente",
      status: "ativo",
      dataPublicacao: "2024-01-08",
      dataExpiracao: "2024-01-31",
      autor: "Segurança",
      visualizacoes: 156,
      anexo: "manual-seguranca.pdf",
      destinatarios: ["Todos os funcionários"],
      categoria: "evento",
    },
    {
      id: "5",
      titulo: "Política de Home Office Atualizada",
      conteudo:
        "A política de home office foi atualizada com novas diretrizes. Consulte o documento anexo para mais detalhes.",
      prioridade: "media",
      status: "arquivado",
      dataPublicacao: "2024-01-05",
      autor: "RH",
      visualizacoes: 89,
      anexo: "politica-home-office-2024.pdf",
      destinatarios: ["Todos os funcionários"],
      categoria: "comunicado",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterPrioridade, setFilterPrioridade] = useState<string>("todos");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterCategoria, setFilterCategoria] = useState<string>("todos");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newInformativo, setNewInformativo] = useState({
    titulo: "",
    conteudo: "",
    prioridade: "media" as const,
    status: "ativo" as const,
    dataExpiracao: "",
    categoria: "geral" as const,
    destinatarios: [] as string[],
  });

  const filteredInformativos = informativos.filter((informativo) => {
    const matchesSearch =
      informativo.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      informativo.conteudo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrioridade =
      filterPrioridade === "todos" ||
      informativo.prioridade === filterPrioridade;
    const matchesStatus =
      filterStatus === "todos" || informativo.status === filterStatus;
    const matchesCategoria =
      filterCategoria === "todos" || informativo.categoria === filterCategoria;

    return (
      matchesSearch && matchesPrioridade && matchesStatus && matchesCategoria
    );
  });

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case "baixa":
        return <Info className="h-4 w-4" />;
      case "media":
        return <Clock className="h-4 w-4" />;
      case "alta":
        return <AlertTriangle className="h-4 w-4" />;
      case "urgente":
        return <Bell className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPrioridadeBadgeColor = (prioridade: string) => {
    switch (prioridade) {
      case "baixa":
        return "bg-gray-100 text-gray-800";
      case "media":
        return "bg-blue-100 text-blue-800";
      case "alta":
        return "bg-yellow-100 text-yellow-800";
      case "urgente":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800";
      case "inativo":
        return "bg-gray-100 text-gray-800";
      case "agendado":
        return "bg-blue-100 text-blue-800";
      case "arquivado":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoriaBadgeColor = (categoria: string) => {
    switch (categoria) {
      case "reuniao":
        return "bg-blue-100 text-blue-800";
      case "evento":
        return "bg-green-100 text-green-800";
      case "comunicado":
        return "bg-purple-100 text-purple-800";
      case "aviso":
        return "bg-yellow-100 text-yellow-800";
      case "geral":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCreateInformativo = () => {
    const novoInformativo: Informativo = {
      id: Date.now().toString(),
      ...newInformativo,
      dataPublicacao: new Date().toISOString().split("T")[0],
      autor: "Usuário Atual",
      visualizacoes: 0,
    };

    setInformativos([novoInformativo, ...informativos]);
    setNewInformativo({
      titulo: "",
      conteudo: "",
      prioridade: "media",
      status: "ativo",
      dataExpiracao: "",
      categoria: "geral",
      destinatarios: [],
    });
    setIsCreateModalOpen(false);

    toast({
      title: "Informativo criado",
      description: "O informativo foi criado com sucesso.",
    });
  };

  const handleDeleteInformativo = (id: string) => {
    setInformativos(informativos.filter((info) => info.id !== id));
    toast({
      title: "Informativo excluído",
      description: "O informativo foi excluído com sucesso.",
      variant: "destructive",
    });
  };

  const stats = {
    total: informativos.length,
    ativos: informativos.filter((i) => i.status === "ativo").length,
    urgentes: informativos.filter(
      (i) => i.prioridade === "urgente" && i.status === "ativo",
    ).length,
    visualizacoes: informativos.reduce((acc, i) => acc + i.visualizacoes, 0),
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Informativos ({filteredInformativos.length})
          </h1>
          <p className="mt-1 text-gray-600">
            Gerencie comunicados, reuniões e informações importantes
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00183E] hover:bg-[#00183E]/90">
              <Plus className="mr-2 h-4 w-4" />
              Novo Informativo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Informativo</DialogTitle>
              <DialogDescription>
                Crie um novo informativo para comunicar informações importantes,
                reuniões ou eventos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={newInformativo.titulo}
                    onChange={(e) =>
                      setNewInformativo({
                        ...newInformativo,
                        titulo: e.target.value,
                      })
                    }
                    placeholder="Ex: Reunião Mensal - Janeiro 2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={newInformativo.categoria}
                    onValueChange={(value: any) =>
                      setNewInformativo({ ...newInformativo, categoria: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                      <SelectItem value="comunicado">Comunicado</SelectItem>
                      <SelectItem value="aviso">Aviso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conteudo">Conteúdo *</Label>
                <Textarea
                  id="conteudo"
                  value={newInformativo.conteudo}
                  onChange={(e) =>
                    setNewInformativo({
                      ...newInformativo,
                      conteudo: e.target.value,
                    })
                  }
                  placeholder="Descreva o informativo detalhadamente..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select
                    value={newInformativo.prioridade}
                    onValueChange={(value: any) =>
                      setNewInformativo({
                        ...newInformativo,
                        prioridade: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newInformativo.status}
                    onValueChange={(value: any) =>
                      setNewInformativo({ ...newInformativo, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="agendado">Agendado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataExpiracao">Data de Expiração</Label>
                  <Input
                    id="dataExpiracao"
                    type="date"
                    value={newInformativo.dataExpiracao}
                    onChange={(e) =>
                      setNewInformativo({
                        ...newInformativo,
                        dataExpiracao: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Destinatários</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Todos os funcionários",
                    "Gerência",
                    "Equipe de Desenvolvimento",
                    "Equipe de Marketing",
                    "Equipe de Vendas",
                    "RH",
                    "TI",
                    "Financeiro",
                  ].map((destinatario) => (
                    <label
                      key={destinatario}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={newInformativo.destinatarios.includes(
                          destinatario,
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewInformativo({
                              ...newInformativo,
                              destinatarios: [
                                ...newInformativo.destinatarios,
                                destinatario,
                              ],
                            });
                          } else {
                            setNewInformativo({
                              ...newInformativo,
                              destinatarios:
                                newInformativo.destinatarios.filter(
                                  (d) => d !== destinatario,
                                ),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{destinatario}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anexo">Anexo (opcional)</Label>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <Paperclip className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    Clique para adicionar um arquivo ou arraste aqui
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, DOC, XLS até 10MB
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateInformativo}
                className="bg-[#00183E] hover:bg-[#00183E]/90"
              >
                Criar Informativo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.ativos}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgentes</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.urgentes}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Visualizações
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.visualizacoes.toLocaleString()}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Pesquisar informativos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select
                value={filterCategoria}
                onValueChange={setFilterCategoria}
              >
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="reuniao">Reunião</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="comunicado">Comunicado</SelectItem>
                  <SelectItem value="aviso">Aviso</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterPrioridade}
                onValueChange={setFilterPrioridade}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="arquivado">Arquivado</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informativos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Informativos</CardTitle>
          <CardDescription>
            Gerencie todos os informativos e comunicados do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Visualizações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInformativos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">
                        Nenhum informativo encontrado
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-2"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Criar primeiro informativo
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredInformativos.map((informativo) => (
                  <TableRow key={informativo.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{informativo.titulo}</p>
                        <p className="max-w-xs truncate text-sm text-gray-500">
                          {informativo.conteudo}
                        </p>
                        <div className="mt-1 flex items-center space-x-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {new Date(
                              informativo.dataPublicacao,
                            ).toLocaleDateString("pt-BR")}
                          </span>
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {informativo.autor}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getPrioridadeBadgeColor(
                          informativo.prioridade,
                        )}
                      >
                        <div className="flex items-center space-x-1">
                          {getPrioridadeIcon(informativo.prioridade)}
                          <span className="capitalize">
                            {informativo.prioridade}
                          </span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getCategoriaBadgeColor(
                          informativo.categoria,
                        )}
                      >
                        <span className="capitalize">
                          {informativo.categoria}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {informativo.anexo ? (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Paperclip className="h-4 w-4" />
                          <span className="max-w-[100px] truncate text-sm">
                            {informativo.anexo}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Sem anexo</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={getStatusBadgeColor(informativo.status)}
                      >
                        <span className="capitalize">{informativo.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span>{informativo.visualizacoes}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              Ver destinatários
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="mr-2 h-4 w-4" />
                              Arquivar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleDeleteInformativo(informativo.id)
                              }
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
        </CardContent>
      </Card>
    </div>
  );
}
