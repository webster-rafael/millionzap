import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Users,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  UserPlus,
  Calendar,
  Loader2,
  Play,
  List,
} from "lucide-react";
import { useContactLists } from "@/hooks/useContactsList";
import type {
  ContactList,
  CreateContactList,
} from "@/interfaces/contactList-interface";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { toast, Toaster } from "sonner";
import { useWhatsAppConnections } from "@/hooks/useWhatsConnection";

type ContactListWithDefaults = ContactList & {
  contactCount: number;
  status: "active" | "inactive";
};

const formatNumber = (num: number) => num.toLocaleString("pt-BR");
const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("pt-BR");

export function ListasDeContatosContent() {
  const { user } = useAuth();
  const { connections } = useWhatsAppConnections();
  const {
    contactLists,
    isLoadingContactLists,
    createContactList,
    removeContactList,
    updateContactList,
    fetchContactListById,
  } = useContactLists();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [listIdToEdit, setListIdToEdit] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ContactList | null>(null);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);
  const [contactToDelete, setContactToDelete] = useState<{
    listId: string;
    contactId: string;
  } | null>(null);
  const [newList, setNewList] = useState<CreateContactList>({
    name: "",
    description: "",
    companyId: user?.companyId || "",
    isActive: true,
  });

  interface CampaignTemplate {
    body: string;
    title?: string | null;
    imageUrl?: string | null;
    footer?: string | null;
  }

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [currentListIdForTemplate, setCurrentListIdForTemplate] = useState<
    string | null
  >(null);
  const [templateData, setTemplateData] = useState<CampaignTemplate>({
    title: "",
    body: "",
    imageUrl: "",
    footer: "",
  });

  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    data: detailedContactList,
    isLoading: isLoadingDetails,
    isSuccess,
  } = useQuery({
    queryKey: ["contactList", listIdToEdit],
    queryFn: () => fetchContactListById(listIdToEdit!),
    enabled: !!listIdToEdit,
  });

  useEffect(() => {
    if (isSuccess && detailedContactList) {
      setEditingList(detailedContactList);
      setIsEditModalOpen(true);
    }
  }, [isSuccess, detailedContactList]);

  const filteredLists = useMemo(() => {
    return contactLists.filter(
      (list) =>
        list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        list.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [contactLists, searchTerm]);

  const stats = useMemo(() => {
    const withDefaults: ContactListWithDefaults[] = contactLists.map((l) => ({
      ...l,
      contactCount: l.contactCount ?? 0,
      status: l.isActive ? "active" : "inactive",
    }));

    return {
      total: withDefaults.length,
      active: withDefaults.filter((list) => list.status === "active").length,
      totalContacts: withDefaults.reduce(
        (sum, list) => sum + list.contactCount,
        0,
      ),
      avgContacts: withDefaults.length
        ? Math.round(
            withDefaults.reduce((sum, list) => sum + list.contactCount, 0) /
              withDefaults.length,
          )
        : 0,
    };
  }, [contactLists]);

  const handleCreateList = () => {
    if (newList.name.trim()) {
      createContactList(newList, {
        onSuccess: () => {
          setNewList({
            name: "",
            description: "",
            companyId: "",
            isActive: true,
          });
          setIsCreateModalOpen(false);
        },
      });
    }
  };

  const handleEditList = () => {
    if (editingList && editingList.name.trim()) {
      updateContactList(editingList, {
        onSuccess: () => {
          setEditingList(null);
          setIsEditModalOpen(false);
        },
      });
    }
  };

  const handleDeleteList = (id: string) => {
    removeContactList(id);
  };

  const handleConfirmDeleteContact = () => {
    if (!editingList || !contactToDelete) return;
    const updatedContactIds = editingList.contacts
      .filter((relation) => relation.contactId !== contactToDelete.contactId)
      .map((relation) => relation.contactId);

    updateContactList(
      {
        id: editingList.id,
        contactIds: updatedContactIds,
      },
      {
        onSuccess: (updatedList) => {
          setEditingList(updatedList);
          setIsConfirmDeleteDialogOpen(false);
          setContactToDelete(null);
        },
        onError: () => {
          toast.error("Erro ao remover contato da lista");
        },
      },
    );
  };

  const toggleListStatus = (id: string) => {
    const list = contactLists.find((l) => l.id === id);
    if (list) {
      updateContactList({
        ...list,
        isActive: !list.isActive,
      });
    }
  };

  const handleOpenEditModal = (listId: string) => {
    setListIdToEdit(listId);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setListIdToEdit(null);
    setEditingList(null);
  };

  const handleOpenTemplateModal = (listId: string) => {
    const list = contactLists.find((l) => l.id === listId);
    if (list) {
      setCurrentListIdForTemplate(listId);
      setTemplateData({
        title: list.campaign?.title ?? "",
        body: list.campaign?.body ?? "",
        imageUrl: list.campaign?.imageUrl ?? "",
        footer: list.campaign?.footer ?? "",
      });
      setIsTemplateModalOpen(true);
    }
  };

  const handleCloseTemplateModal = () => {
    setIsTemplateModalOpen(false);
    setCurrentListIdForTemplate(null);
    setTemplateData({ title: "", body: "", imageUrl: "", footer: "" });
  };

  const handleSaveTemplate = async () => {
    if (!currentListIdForTemplate) return;
    if (!templateData.body.trim()) {
      toast.error("O corpo da mensagem é obrigatório.");
      return;
    }

    const finalTemplateData = { ...templateData };

    if (selectedImageFile) {
      const newImageUrl = await handleImageUpload();

      if (!newImageUrl) {
        toast.error(
          "O template não foi salvo porque o upload da imagem falhou.",
        );
        return;
      }

      finalTemplateData.imageUrl = newImageUrl;
    }

    updateContactList(
      {
        id: currentListIdForTemplate,
        campaign: finalTemplateData,
      },
      {
        onSuccess: () => {
          toast.success("Template salvo com sucesso!");
          handleCloseTemplateModal();
        },
        onError: (error) => {
          console.error("Erro ao salvar template:", error);
          toast.error("Não foi possível salvar o template.");
        },
      },
    );
  };

  const handleImageUpload = async (): Promise<string | null> => {
    if (!selectedImageFile) {
      toast.error("Por favor, selecione uma imagem primeiro.");
      return null;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedImageFile);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/templates-images/upload`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Falha no upload da imagem.");
      }

      toast.success("Imagem enviada com sucesso!");
      return result.url;
    } catch (error) {
      let errorMessage = "Não foi possível enviar a imagem.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Erro no upload:", error);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const startTriggerMessage = async (id: string) => {
    const webhookUrl = import.meta.env.VITE_TRIGGER_MESSAGE_WEBHOOK;

    const listToTrigger = contactLists.find((list) => list.id === id);

    if (!listToTrigger) {
      toast.error("Erro: Lista de contatos não encontrada.");
      return;
    }

    if (!listToTrigger.contacts || listToTrigger.contacts.length === 0) {
      toast.error("Esta lista está vazia. Não há contatos para disparar.");
      return;
    }

    if (!listToTrigger.campaign || !listToTrigger.campaign.body) {
      toast.error("Esta lista não possui um template de campanha configurado.");
      return;
    }

    const contactsToSend = listToTrigger.contacts.map(
      (relation) => relation.contact,
    );

    toast.info(
      `Iniciando disparo para ${listToTrigger.contacts.length} contato(s) da lista "${listToTrigger.name}"...`,
    );

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
          listId: listToTrigger.id,
          listName: listToTrigger.name,
          contacts: contactsToSend,
          template: listToTrigger.campaign,
          companyId: user?.companyId || "",
          connectionName: connectionsName?.name || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.statusText}`);
      }

      toast.success("Disparo iniciado com sucesso! Workflow do n8n ativado.");
    } catch (error) {
      console.error("Falha ao ativar o webhook do n8n:", error);
      toast.error("Não foi possível acionar o disparo. Tente novamente.");
    }
  };

  if (isLoadingContactLists) {
    return <p className="p-6">Carregando listas...</p>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600">
            Gerencie suas listas de contatos para campanhas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 pl-10"
            />
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#00183E] hover:bg-[#00183E]/90">
                <Plus className="mr-2 h-4 w-4" />
                NOVA LISTA
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Lista de Contatos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Lista</Label>
                  <Input
                    id="name"
                    placeholder="Ex: Clientes VIP"
                    value={newList.name}
                    onChange={(e) =>
                      setNewList({ ...newList, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva o propósito desta lista..."
                    value={newList.description ?? ""}
                    onChange={(e) =>
                      setNewList({ ...newList, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateList}
                  className="bg-[#00183E] hover:bg-[#00183E]/90"
                >
                  Criar Lista
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isEditModalOpen} onOpenChange={handleCloseEditModal}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Editar Lista de Contatos</DialogTitle>
              </DialogHeader>
              {/* Mostra um loader enquanto busca os detalhes */}
              {isLoadingDetails && (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              )}

              {editingList && !isLoadingDetails && (
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome da Lista</Label>
                    <Input
                      id="edit-name"
                      value={editingList.name}
                      onChange={(e) =>
                        setEditingList({ ...editingList, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={editingList.description ?? ""}
                      onChange={(e) =>
                        setEditingList({
                          ...editingList,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Contatos da Lista</Label>
                    {editingList.contacts && editingList.contacts.length > 0 ? (
                      <Table className="mt-2">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {editingList.contacts.map((contactRelation) => (
                            <TableRow
                              key={
                                contactRelation.contact?.id ||
                                contactRelation.contactId
                              }
                            >
                              <TableCell>
                                {contactRelation.contact?.name ||
                                  "Não encontrado"}
                              </TableCell>
                              <TableCell>
                                {contactRelation.contact?.phone ||
                                  "Não encontrado"}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setContactToDelete({
                                      listId: editingList.id,
                                      contactId: contactRelation.contactId,
                                    });
                                    setIsConfirmDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="mt-1 text-sm text-gray-500">
                        Nenhum contato nesta lista.
                      </p>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseEditModal}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditList}
                  className="bg-[#00183E] hover:bg-[#00183E]/90"
                >
                  Salvar Alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={isTemplateModalOpen}
            onOpenChange={handleCloseTemplateModal}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Template da Campanha</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="template-title">Título</Label>
                  <Input
                    id="template-title"
                    placeholder="Ex: Oferta Especial!"
                    value={templateData.title || ""}
                    onChange={(e) =>
                      setTemplateData({
                        ...templateData,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-body">Corpo da Mensagem</Label>
                  <Textarea
                    id="template-body"
                    placeholder="Olá {contactName}, temos uma novidade para você..."
                    value={templateData.body}
                    onChange={(e) =>
                      setTemplateData({ ...templateData, body: e.target.value })
                    }
                    rows={5}
                  />
                </div>
                <div className="space-y-2 rounded-md border p-4">
                  <Label htmlFor="image-upload">Enviar Imagem</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedImageFile(e.target.files[0]);
                        }
                      }}
                      className="flex-1"
                    />
                  </div>
                  {selectedImageFile && !isUploading && (
                    <p className="text-muted-foreground mt-2 text-xs">
                      Arquivo selecionado: {selectedImageFile.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template-footer">Rodapé (Opcional)</Label>
                  <Input
                    id="template-footer"
                    placeholder="Ex: Fale conosco!"
                    value={templateData.footer || ""}
                    onChange={(e) =>
                      setTemplateData({
                        ...templateData,
                        footer: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseTemplateModal}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  className="bg-[#00183E] hover:bg-[#00183E]/90"
                >
                  Salvar Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Listas
            </CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-muted-foreground text-xs">Listas criadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listas Ativas</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-muted-foreground text-xs">Em uso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Contatos
            </CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(stats.totalContacts)}
            </div>
            <p className="text-muted-foreground text-xs">Contatos únicos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Média por Lista
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(stats.avgContacts)}
            </div>
            <p className="text-muted-foreground text-xs">Contatos/lista</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Lists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listas de Contatos ({filteredLists.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLists.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                Nenhuma lista encontrada
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Tente ajustar sua pesquisa."
                  : "Comece criando uma nova lista de contatos."}
              </p>
              {!searchTerm && (
                <div className="mt-6">
                  <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-[#00183E] hover:bg-[#00183E]/90"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Lista
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contatos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Atualizada</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLists.map((list) => (
                  <TableRow key={list.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{list.name}</div>
                        <div className="text-sm text-gray-500">
                          {list.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {formatNumber(list.contacts.length)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          list.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {list.isActive ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-500">
                        {formatDate(list.updatedAt ?? "")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => startTriggerMessage(list.id)}
                          variant="ghost"
                          size="sm"
                          title="Disparar"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleOpenEditModal(list.id)}
                          variant="ghost"
                          size="sm"
                          title="Editar lista"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenTemplateModal(list.id)}
                            >
                              <List className="mr-2 h-4 w-4" />
                              Templates
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => toggleListStatus(list.id)}
                            >
                              {list.isActive ? (
                                <>
                                  <Users className="mr-2 h-4 w-4" />
                                  Desativar lista
                                </>
                              ) : (
                                <>
                                  <Users className="mr-2 h-4 w-4" />
                                  Ativar lista
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteList(list.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir lista
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Dialog
        open={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Você tem certeza que deseja remover este contato da lista?</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteContact}>
              Excluir Contato
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
