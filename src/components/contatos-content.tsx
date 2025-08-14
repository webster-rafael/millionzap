import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MessageCircle,
  Phone,
  Upload,
  Download,
  Loader2,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useContacts } from "@/hooks/useContacts";
import type { Contact } from "@/interfaces/contact-interface";
import { useForm } from "react-hook-form";
import {
  contactSchema,
  type ContactFormData,
} from "@/validations/contactSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast, Toaster } from "sonner";
import {
  FormControl,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useConversations } from "@/hooks/useConversation";

// interface CustomField {
//   name: string;
//   value: string;
// }

export function ContatosContent() {
  const { user } = useAuth();
  const {
    contacts,
    isLoadingContacts,
    isErrorContacts,
    create,
    isCreating,
    update,
    isUpdating,
    remove,
  } = useContacts();
  const { conversations, create: createConversation } = useConversations();
  const navigate = useNavigate();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setStartingConversationContactId] =
    useState<string | null>(null);
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      companyId: user?.id ? user.id : "",
    },
  });

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.name.toLowerCase().includes(searchLower) ||
      contact.phone.includes(searchTerm) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.tags?.some((tag) => tag.toLowerCase().includes(searchLower) || [])
    );
  });

  const handleAddContact = (data: ContactFormData) => {
    create(data, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
        form.reset();
        toast.success("Contato criado com sucesso!");
      },

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        if (error?.code === "P2002") {
          toast.error("Este número de telefone já está cadastrado.");
        } else {
          toast.error("Não foi possível criar o contato.");
        }
      },
    });
  };

  const handleUpdateContact = () => {
    if (!editingContact) return;
    try {
      update(
        { ...editingContact },
        {
          onSuccess: () => {
            setEditingContact(null);
            toast.success("Contato editado com sucesso!");
          },
        },
      );
    } catch {
      toast.error("Não foi possível editar o contato.");
    }
  };

  const deleteSelectedContacts = () => {
    try {
      selectedContacts.forEach((id) => remove(id));
      setSelectedContacts([]);
      toast.success("Contatos excluídos com sucesso!");
    } catch {
      toast.error("Não foi possível excluir os contatos.");
    }
  };

  const handleDeleteContact = (id: string) => {
    try {
      remove(id);
      setSelectedContacts((prev) =>
        prev.filter((contactId) => contactId !== id),
      );
      toast.success("Contato excluído com sucesso!");
    } catch {
      toast.error("Não foi possível excluir o contato.");
    }
  };

  const toggleContactSelection = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((contactId) => contactId !== id)
        : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedContacts(
      selectedContacts.length === filteredContacts.length
        ? []
        : filteredContacts.map((c) => c.id),
    );
  };

  const handleStartConversation = (contact: Contact) => {
    setStartingConversationContactId(contact.id);
    const existingConversation = conversations.find(
      (conv) =>
        conv.contactId === contact.id &&
        conv.status !== "RESOLVED" &&
        conv.status !== "CLOSED",
    );

    if (existingConversation) {
      toast.info("Abrindo conversa existente...");
      navigate(`/atendimentos/${existingConversation.id}`);
      setStartingConversationContactId(null);
    } else {
      toast.info("Criando nova conversa...");
      createConversation(
        {
          contactId: contact.id,
          status: "SERVING",
          companyId: user?.companyId || "",
          createdAt: new Date(),
        },
        {
          onSuccess: (newConversation) => {
            toast.success("Conversa iniciada com sucesso!");
            navigate(`/atendimentos/${newConversation.id}`);
          },
          onError: () => {
            toast.error(
              "Não foi possível iniciar a conversa. Tente novamente.",
            );
          },
          onSettled: () => {
            setStartingConversationContactId(null);
          },
        },
      );
    }
  };

  if (isLoadingContacts) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#00183E]" />
        <p className="ml-2 text-lg">Carregando contatos...</p>
      </div>
    );
  }

  if (isErrorContacts) {
    return (
      <div className="flex h-screen items-center justify-center text-red-600">
        <p>Falha ao carregar os contatos. Tente novamente mais tarde.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Contatos
          </h1>
          <p className="text-gray-600">
            Gerencie todos os seus contatos em um só lugar
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          {selectedContacts.length > 0 && (
            <Button variant="destructive" onClick={deleteSelectedContacts}>
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir ({selectedContacts.length})
            </Button>
          )}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-[#00183E] hover:bg-[#00183E]/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Contato
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Contato</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleAddContact)}
                  className="space-y-4"
                >
                  <div className="mb-4 text-sm font-medium text-gray-700">
                    Dados do contato
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nome <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
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
                          <FormLabel>
                            Telefone <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="5567999999999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Outros campos como 'source' e 'customFields' podem ser adicionados aqui como FormField */}

                  <div className="flex justify-end space-x-2 border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="bg-[#00183E] hover:bg-[#00183E]/90"
                    >
                      {isCreating && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Adicionar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Phone className="h-8 w-8 text-[#00183E]" />
              <div>
                <p className="text-2xl font-bold">{contacts.length}</p>
                <p className="text-sm text-gray-600">Total de Contatos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Outros cards de estatísticas aqui, podem ser calculados a partir de 'contacts' */}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Pesquisar contatos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contatos ({filteredContacts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      filteredContacts.length > 0 &&
                      selectedContacts.length === filteredContacts.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedContacts.includes(contact.id)}
                      onCheckedChange={() => toggleContactSelection(contact.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {contact.name}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {contact.phone}
                  </TableCell>
                  <TableCell>{contact.email || "-"}</TableCell>
                  <TableCell>
                    {/* <Badge
                      variant="secondary"
                      className={`${
                        contact.status === "online"
                          ? "bg-green-100 text-green-800"
                          : contact.status === "away"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {contact.status}
                    </Badge> */}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {contact.tags?.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => handleStartConversation(contact)}
                        variant="ghost"
                        size="sm"
                        title="Conversar"
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingContact(contact)}
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteContact(contact.id)}
                        title="Excluir"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingContact}
        onOpenChange={() => setEditingContact(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Contato</DialogTitle>
          </DialogHeader>
          {editingContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editingContact.name}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Telefone</Label>
                  <Input
                    id="edit-phone"
                    value={editingContact.phone}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingContact.email || ""}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      email: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end space-x-2 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingContact(null)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateContact}
                  disabled={isUpdating}
                  className="bg-[#00183E] hover:bg-[#00183E]/90"
                >
                  {isUpdating && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
