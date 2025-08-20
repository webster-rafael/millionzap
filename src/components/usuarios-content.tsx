import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { toast, Toaster } from "sonner";
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import type { User, UserCreate } from "@/interfaces/user-interface";
import { useForm } from "react-hook-form";
import { userSchema, type UserFormData } from "@/validations/userSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueues } from "@/hooks/useQueues";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useWhatsAppConnections } from "@/hooks/useWhatsConnection";

export function UsuariosContent() {
  const { user } = useAuth();
  const {
    users,
    isLoading,
    isError,
    createUser,
    isCreating,
    updateUser,
    isUpdating,
    deleteUser,
  } = useUsers();
  const { queues, isLoadingQueues } = useQueues();
  const { connections, isLoadingConnection } = useWhatsAppConnections();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "USER",
      queueIds: [],
      companyId: user?.companyId || "",
      connectionId: user?.connectionId || "",
    },
  });

  const handleOpenModal = (user?: User) => {
    setEditingUser(user || null);
    if (user) {
      form.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        password: "",
        role: user.role as "ADMIN" | "USER",
        queueIds: user.queues?.map((q) => q.queue.id) || [],
        companyId: user.companyId || "",
        connectionId: user?.connectionId || "",
      });
    } else {
      form.reset();
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data: UserCreate) => {
    const mutationCallback = {
      onSuccess: () => {
        setIsModalOpen(false);
        toast.success(
          `Usuário ${editingUser ? "atualizado" : "criado"} com sucesso!`,
        );
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        if (error?.code === "P2002") {
          toast.error("E-mail já cadastrado.");
        } else {
          toast.error("Não foi possível criar o contato.");
        }
      },
    };

    if (editingUser) {
      const dataToUpdate = { ...data };

      if (dataToUpdate.password === "") {
        delete (dataToUpdate as Partial<UserCreate>).password;
      }

      updateUser({ id: editingUser.id, data: dataToUpdate }, mutationCallback);
    } else {
      createUser(data, mutationCallback);
    }
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      deleteUser(userToDelete.id, {
        onSuccess: () => {
          toast.success("Usuário excluído com sucesso!");
          setUserToDelete(null);
        },
        onError: (error) => {
          toast.error(`Falha ao excluir: ${error.message}`);
          setUserToDelete(null);
        },
      });
    }
  };

  const getProfileBadge = (role: string) => {
    const variants = {
      ADMIN: "bg-red-100 text-red-800 border-red-200",
      USER: "bg-green-100 text-green-800 border-green-200",
    };
    const labels = {
      ADMIN: "Administrador",
      USER: "Usuário",
    };
    return (
      <Badge
        className={variants[role as keyof typeof variants] || variants.USER}
      >
        {labels[role as keyof typeof labels] || "Usuário"}
      </Badge>
    );
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (isLoading || isLoadingQueues)
    return (
      <div className="p-6 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin" />
      </div>
    );
  if (isError)
    return (
      <div className="p-6 text-center text-red-500">
        Falha ao carregar usuários.
      </div>
    );

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
            </div>
            <p className="mt-1 text-gray-600">
              Gerencie os usuários do sistema
            </p>
          </div>
          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#00183E] hover:bg-[#00183E]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            ADICIONAR USUÁRIO
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Usuários</CardTitle>
                <CardDescription>
                  {users.length} usuário{users.length !== 1 ? "s" : ""}{" "}
                  cadastrado{users.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>
              <div className="relative w-80">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                <Input
                  placeholder="Pesquisar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-start">Nome</TableHead>
                  <TableHead className="text-center">Email</TableHead>
                  <TableHead className="text-center">Perfil</TableHead>
                  <TableHead className="text-center">Filas</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow className="text-center" key={user.id}>
                    <TableCell className="text-start">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-blue-100 text-sm font-medium text-blue-600">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-500">
                            Criado em{" "}
                            {new Date(user.createdAt).toLocaleDateString(
                              "pt-BR",
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div>{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getProfileBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {user.queues?.map((fila) => (
                          <Badge
                            key={fila.queue.id}
                            className="rounded-md border text-white"
                            style={{
                              backgroundColor: fila.queue.color,
                            }}
                          >
                            {fila.queue.name || "Sem fila"}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setUserToDelete(user)}
                          className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredUsers.length === 0 && (
              <div className="py-8 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-medium text-gray-900">
                  Nenhum usuário encontrado
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Tente ajustar sua pesquisa"
                    : "Comece adicionando um novo usuário"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Adicionar/Editar Usuário */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Editar usuário" : "Adicionar usuário"}
              </DialogTitle>
              <DialogDescription>
                {editingUser
                  ? "Edite as informações do usuário"
                  : "Preencha as informações do novo usuário"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input type="Digite seu número" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Senha{" "}
                        {editingUser && (
                          <span className="text-xs text-gray-500">
                            (Deixe em branco para não alterar)
                          </span>
                        )}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 h-full"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perfil</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="USER">Usuário</SelectItem>
                            <SelectItem value="ADMIN">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="queueIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filas</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={queues.map((q) => ({
                            label: q.name,
                            value: q.id,
                          }))}
                          selected={field.value || []}
                          onChange={field.onChange}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="connectionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conexão WhatsApp</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma conexão" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingConnection ? (
                            <SelectItem value="" disabled>
                              Carregando...
                            </SelectItem>
                          ) : (
                            connections.map((con) => (
                              <SelectItem key={con.id} value={con.id}>
                                {con.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    CANCELAR
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating || isUpdating}
                    className="bg-[#00183E] hover:bg-[#00183E]/90"
                  >
                    {(isCreating || isUpdating) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingUser ? "SALVAR" : "ADICIONAR"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <AlertDialog
          open={!!userToDelete}
          onOpenChange={(isOpen) => !isOpen && setUserToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o usuário "{userToDelete?.name}"?
                <br />
                <span className="font-medium text-red-600">
                  Esta ação não pode ser desfeita.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Toaster />
    </div>
  );
}
