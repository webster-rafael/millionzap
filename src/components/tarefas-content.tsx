/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Circle,
  Edit,
  Trash2,
  AlertCircle,
  Star,
  Inbox,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { useToDos } from "@/hooks/useToDo";
import type { CreateToDo, UpdateToDo } from "@/interfaces/todo-interface";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  category: "pessoal" | "trabalho" | "atendimento" | "vendas" | "suporte";
  assignee?: {
    name: string;
    avatar?: string;
  };
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  favorite: boolean;
  createdBy?: { name: string; avatar?: string };
  responsible?: { name: string; avatar?: string };
  createdById?: string;
  responsibleId?: string;
}

export function TarefasContent() {
  const { user } = useAuth();
  const { users } = useUsers();
  const { todos, create, update, remove, isLoading } = useToDos();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("todas");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    category: "trabalho" as Task["category"],
    assignee: "",
    dueDate: "",
    tags: [] as string[],
  });

  useEffect(() => {
    if (todos) {
      setTasks(
        todos.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          completed: t.completed,
          priority: t.priority.toLowerCase(),
          category: (t.category || "trabalho").toLowerCase(),
          assignee: t.responsible
            ? { name: t.responsible.name, avatar: t.responsible.avatar }
            : undefined,
          dueDate: t.dueDate,
          createdAt: t.createdAt,
          updatedAt: t.updatedAt,
          tags: t.tags || [],
          favorite: t.favorite || false,
          createdById: t.createdById,
          responsibleId: t.responsibleId,
          createdBy: t.createdBy ? { name: t.createdBy.name } : undefined,
          responsible: t.responsible ? { name: t.responsible.name } : undefined,
        })),
      );
    }
  }, [todos]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    const matchesFilter =
      selectedFilter === "todas" ||
      (selectedFilter === "pendentes" && !task.completed) ||
      (selectedFilter === "concluidas" && task.completed) ||
      (selectedFilter === "favoritas" && task.favorite) ||
      (selectedFilter === "vencidas" &&
        task.dueDate &&
        new Date(task.dueDate) < new Date() &&
        !task.completed);

    const matchesCategory =
      selectedCategory === "todas" || task.category === selectedCategory;

    return matchesSearch && matchesFilter && matchesCategory;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "atendimento":
        return "bg-blue-100 text-blue-800";
      case "vendas":
        return "bg-green-100 text-green-800";
      case "suporte":
        return "bg-purple-100 text-purple-800";
      case "trabalho":
        return "bg-gray-100 text-gray-800";
      case "pessoal":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const payload: CreateToDo = {
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority.toUpperCase() as
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "URGENT",
      responsibleId:
        users.find((u) => u.name === newTask.assignee)?.id || user?.id || null,
      dueDate: newTask.dueDate || null,
    };

    create(payload);
    setIsAddingTask(false);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      category: "trabalho",
      assignee: "",
      dueDate: "",
      tags: [],
    });
  };

  const updateTask = async () => {
    if (!editingTask) return;

    const payload: UpdateToDo = {
      title: editingTask.title,
      description: editingTask.description,
      priority: editingTask.priority.toUpperCase() as
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "URGENT",
      responsibleId:
        users.find((u) => u.name === editingTask.assignee?.name)?.id ||
        user?.id ||
        null,
      dueDate: editingTask.dueDate || null,
      completed: editingTask.completed,
    };

    update({ id: editingTask.id, ...payload });
    setEditingTask(null);
  };

  const toggleTaskComplete = (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    update({ id, completed: !task.completed });
  };

  const deleteTask = async (id: string) => {
    remove(id);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const pending = tasks.filter((t) => !t.completed).length;
    const overdue = tasks.filter(
      (t) => t.dueDate && isOverdue(t.dueDate) && !t.completed,
    ).length;
    return { total, completed, pending, overdue };
  };

  const stats = getTaskStats();

  const isCreator = (task: Task) => task.createdById === user?.id;
  const isResponsible = (task: Task) => task.responsibleId === user?.id;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-600">
        <Loader2 className="h-10 w-10 animate-spin text-[#00183E]" />
        <p className="mt-3 text-lg font-medium">Carregando tarefas...</p>
        <p className="text-sm text-gray-400">Aguarde um instante</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Tarefas
          </h1>
          <p className="text-gray-600">
            Organize e acompanhe suas tarefas e atividades
          </p>
        </div>
        <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
          <DialogTrigger asChild>
            <Button className="bg-[#00183E] hover:bg-[#00183E]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Digite o título da tarefa"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Descreva a tarefa (opcional)"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: Task["priority"]) =>
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value: Task["category"]) =>
                      setNewTask({ ...newTask, category: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                      <SelectItem value="trabalho">Trabalho</SelectItem>
                      <SelectItem value="atendimento">Atendimento</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="suporte">Suporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="assignee">Responsável</Label>
                  <Select
                    value={newTask.assignee}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, assignee: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.companyId === user?.companyId)
                        .map((u) => (
                          <SelectItem key={u.id} value={u.name}>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={"/placeholder.svg"} />
                                <AvatarFallback className="bg-[#00183E] text-xs text-white">
                                  {u.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{u.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="dueDate">Data de Vencimento</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddingTask(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={addTask}
                  className="bg-[#00183E] hover:bg-[#00183E]/90"
                >
                  Criar Tarefa
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-8 w-8 text-[#00183E]" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total de Tarefas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Circle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-gray-600">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-sm text-gray-600">Vencidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
              <TabsList>
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
                <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
                <TabsTrigger value="vencidas">Vencidas</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                <SelectItem value="pessoal">Pessoal</SelectItem>
                <SelectItem value="trabalho">Trabalho</SelectItem>
                <SelectItem value="atendimento">Atendimento</SelectItem>
                <SelectItem value="vendas">Vendas</SelectItem>
                <SelectItem value="suporte">Suporte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Tasks List */}
      <Card>
        <Table className="flex w-full flex-col">
          <TableHeader className="flex w-full">
            <TableRow className="mx-auto grid w-full grid-cols-8 px-4">
              <TableHead className="text-center">Concluído</TableHead>
              <TableHead className="col-span-2 text-center">Tarefa</TableHead>
              <TableHead className="text-center">Prioridade</TableHead>
              <TableHead className="text-center">Categoria</TableHead>
              <TableHead className="text-center">Vencimento</TableHead>
              <TableHead className="text-center">Responsável</TableHead>

              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="space-y-4 p-3">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <TableRow
                  key={task.id}
                  onClick={() => setViewingTask(task)}
                  className="relative grid h-20 w-full cursor-pointer grid-cols-8 rounded-lg border bg-zinc-100 transition-colors hover:bg-gray-50 data-[completed=true]:bg-zinc-100 data-[completed=true]:text-gray-500 data-[completed=true]:opacity-70"
                  data-completed={task.completed}
                >
                  {task.completed && (
                    <div className="absolute top-1/2 right-[120px] left-[40px] h-[0.1px] -translate-y-1/2 bg-gray-400" />
                  )}

                  <TableCell
                    className="flex items-center justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      className="size-5 border border-zinc-300 bg-white"
                      checked={task.completed}
                      onCheckedChange={() => toggleTaskComplete(task.id)}
                      disabled={!isCreator(task) && !isResponsible(task)}
                    />
                  </TableCell>
                  <TableCell className="col-span-2 flex items-center justify-center font-medium">
                    <div className="flex flex-col">
                      <span className="w-28 truncate text-gray-900 lg:w-48">
                        {task.title}
                      </span>
                      {task.description && (
                        <p className="w-28 truncate text-xs text-zinc-500 lg:w-48">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="flex items-center justify-center text-center">
                    <Badge
                      className={`text-xs ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center justify-center text-center">
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getCategoryColor(task.category)}`}
                    >
                      {task.category.charAt(0).toUpperCase() +
                        task.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center justify-center text-center">
                    {task.dueDate ? (
                      <div
                        className={`flex items-center justify-center space-x-2 text-sm ${
                          isOverdue(task.dueDate) && !task.completed
                            ? "font-semibold text-red-600"
                            : ""
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(task.dueDate).toLocaleDateString("pt-BR", {
                            timeZone: "UTC",
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs">N/D</span>
                    )}
                  </TableCell>
                  <TableCell className="flex items-center justify-center text-center">
                    {task.responsible ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={"/placeholder.svg"} />
                          <AvatarFallback className="bg-[#00183E] text-xs text-white">
                            {task.responsible.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {task.responsible.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs">Não atribuído</span>
                    )}
                  </TableCell>
                  <TableCell
                    className="flex items-center justify-center text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end space-x-1">
                      {isCreator(task) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTask(task)}
                          className="h-8 w-8 p-0 text-gray-500 hover:text-gray-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {isCreator(task) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTask(task.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="flex w-full">
                <TableCell
                  colSpan={7}
                  className="h-32 w-full text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Inbox className="h-10 w-10 text-gray-400" />
                    <p className="font-medium">Nenhuma tarefa encontrada</p>
                    <p className="text-sm text-gray-400">
                      Tente ajustar os filtros ou crie uma nova tarefa
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="edit-title">Título *</Label>
                <Input
                  id="edit-title"
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, title: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.description || ""}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-priority">Prioridade</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value: Task["priority"]) =>
                      setEditingTask({ ...editingTask, priority: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-category">Categoria</Label>
                  <Select
                    value={editingTask.category}
                    onValueChange={(value: Task["category"]) =>
                      setEditingTask({ ...editingTask, category: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pessoal">Pessoal</SelectItem>
                      <SelectItem value="trabalho">Trabalho</SelectItem>
                      <SelectItem value="atendimento">Atendimento</SelectItem>
                      <SelectItem value="vendas">Vendas</SelectItem>
                      <SelectItem value="suporte">Suporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-assignee">Responsável</Label>
                  <Select
                    value={editingTask.assignee?.name || ""}
                    onValueChange={(value) =>
                      setEditingTask({
                        ...editingTask,
                        assignee: { name: value },
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione um responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.companyId === user?.companyId)
                        .map((u) => (
                          <SelectItem key={u.id} value={u.name}>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={"/placeholder.svg"} />
                                <AvatarFallback className="bg-[#00183E] text-xs text-white">
                                  {u.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span>{u.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="edit-dueDate">Data de Vencimento</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={editingTask.dueDate?.split("T")[0] || ""}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        dueDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingTask(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={updateTask}
                  className="bg-[#00183E] hover:bg-[#00183E]/90"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Task Details Dialog (NOVO) */}
      <Dialog open={!!viewingTask} onOpenChange={() => setViewingTask(null)}>
        <DialogContent className="max-w-2xl">
          {viewingTask && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <span>{viewingTask.title}</span>
                  {viewingTask.favorite && (
                    <Star className="h-5 w-5 text-yellow-500" />
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {viewingTask.description && (
                  <div>
                    <Label>Descrição</Label>
                    <p className="text-sm text-gray-700">
                      {viewingTask.description}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <Label>Status</Label>
                    <div className="flex items-center space-x-2">
                      {viewingTask.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-orange-600" />
                      )}
                      <span className="text-sm">
                        {viewingTask.completed ? "Concluída" : "Pendente"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Prioridade</Label>
                    <Badge
                      className={`text-xs ${getPriorityColor(
                        viewingTask.priority,
                      )}`}
                    >
                      {viewingTask.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${getCategoryColor(
                        viewingTask.category,
                      )}`}
                    >
                      {viewingTask.category.charAt(0).toUpperCase() +
                        viewingTask.category.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <Label>Data de Vencimento</Label>
                    <p className="text-sm">
                      {viewingTask.dueDate
                        ? new Date(viewingTask.dueDate).toLocaleDateString(
                            "pt-BR",
                          )
                        : "Não definida"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label>Responsável</Label>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={"/placeholder.svg"} />
                        <AvatarFallback className="bg-[#00183E] text-xs text-white">
                          {viewingTask.responsible?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {viewingTask.responsible?.name || "Não atribuído"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Criado por</Label>
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={"/placeholder.svg"} />
                        <AvatarFallback className="bg-gray-600 text-xs text-white">
                          {viewingTask.createdBy?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {viewingTask.createdBy?.name || "Desconhecido"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
