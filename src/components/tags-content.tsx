import { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2, Tag } from "lucide-react";
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
import { useTags } from "@/hooks/useTags";
import type { CreateTags, Tags } from "@/interfaces/tag-interface";
import { toast, Toaster } from "sonner";
import { z } from "zod";
import { tagSchema } from "@/validations/tagSchema";
import { useAuth } from "@/hooks/useAuth";

const predefinedColors = [
  "#EF4444", // Red
  "#F97316", // Orange
  "#F59E0B", // Amber
  "#EAB308", // Yellow
  "#84CC16", // Lime
  "#10B981", // Emerald
  "#06B6D4", // Cyan
  "#3B82F6", // Blue
  "#6366F1", // Indigo
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F43F5E", // Rose
];

export function TagsContent() {
  const { user } = useAuth();
  const {
    tags,
    create,
    update,
    remove,
    isCreating,
    isUpdating,
    isErrorTags,
    isLoadingTags,
  } = useTags();
  const [listTags, setListTags] = useState<Tags[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Tags | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTag, setNewTag] = useState<CreateTags>({
    title: "",
    color: "",
    order: 0,
    description: "",
    companyId: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    title?: string[];
    color?: string[];
    order?: string[];
    description?: string[];
  }>({});

  useEffect(() => {
    if (!isLoadingTags && !isErrorTags) {
      setListTags(tags);
    }
  }, [tags, isLoadingTags, isErrorTags]);

  const filteredTags = tags.filter(
    (tag) =>
      tag.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tag.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addTag = () => {
    const tagToCreate = {
      ...newTag,
      order: listTags.length + 1,
    };
    const result = tagSchema.safeParse(newTag);

    if (!result.success) {
      const tree = z.treeifyError(result.error);

      const validationErrorsFormatted = {
        title: tree.properties?.title?.errors ?? [],
        color: tree.properties?.color?.errors ?? [],
        description: tree.properties?.description?.errors ?? [],
      };

      setValidationErrors(validationErrorsFormatted);
      return;
    }

    create(tagToCreate, {
      onSuccess: () => {
        setNewTag({
          title: "",
          color: "",
          order: 0,
          description: "",
          companyId: user?.id || "",
        });
        setIsAddingTag(false);
        toast.success("Tag criada com sucesso!");
      },
    });
  };

  const handleUpdateTag = () => {
    if (!editingTag) return;

    const result = tagSchema.safeParse(editingTag);

    if (!result.success) {
      setValidationErrors(result.error.flatten().fieldErrors);
      return;
    }

    const currentTag = listTags.find((t) => t.id === editingTag.id);
    if (!currentTag) return;

    const oldOrder = currentTag.order;
    const newOrder = editingTag.order;

    if (oldOrder === newOrder) {
      update(editingTag, {
        onSuccess: () => {
          setEditingTag(null);
          toast.success("Tag editada com sucesso!");
        },
      });
      return;
    }

    const reorderedTags = [...listTags];
    reorderedTags.forEach((tag) => {
      if (tag.id === editingTag.id) return;

      if (
        newOrder < oldOrder &&
        tag.order >= newOrder &&
        tag.order < oldOrder
      ) {
        tag.order += 1;
      }

      if (
        newOrder > oldOrder &&
        tag.order <= newOrder &&
        tag.order > oldOrder
      ) {
        tag.order -= 1;
      }
    });

    const updatedTag = { ...editingTag, order: newOrder };

    const tagsToUpdate = [
      ...reorderedTags.filter((t) => t.id !== updatedTag.id),
      updatedTag,
    ];

    tagsToUpdate.forEach((tag) => {
      update(tag, {
        onSuccess: () => {
          setEditingTag(null);
          toast.success("Tag editada com sucesso!");
        },
      });
    });
  };

  const handleDeleteTag = (id: string) => {
    remove(id, {
      onSuccess: () => toast("Tag excluída com sucesso!"),
      onError: (error) => toast("Erro ao excluir tag: " + error.message),
    });
  };

  const getTagStats = () => {
    const total = tags.length;
    return { total };
  };

  const stats = getTagStats();

  if (isLoadingTags) {
    return <div className="p-6">Carregando tags...</div>;
  }

  if (isErrorTags) {
    return (
      <div className="p-6 text-red-500">
        Falha ao carregar as tags. Tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="text-gray-600">
            Gerencie as tags do sistema e organize seus dados
          </p>
        </div>
        <Dialog open={isAddingTag} onOpenChange={setIsAddingTag}>
          <DialogTrigger asChild>
            <Button className="bg-[#00183E] hover:bg-[#00183E]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Tag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={newTag.title}
                  onChange={(e) =>
                    setNewTag({ ...newTag, title: e.target.value })
                  }
                  placeholder="Digite o nome da tag"
                />
                {validationErrors?.title && (
                  <p className="text-sm text-red-500">
                    {validationErrors.title[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={newTag.description}
                  onChange={(e) =>
                    setNewTag({ ...newTag, description: e.target.value })
                  }
                  placeholder="Descrição da tag (opcional)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <div className="flex items-center space-x-2">
                  <div
                    className="h-8 w-8 cursor-pointer rounded border-2 border-gray-300"
                    style={{ backgroundColor: newTag.color }}
                    onClick={() => {
                      const colorInput = document.createElement("input");
                      colorInput.type = "color";
                      colorInput.value = newTag.color;
                      colorInput.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        setNewTag({ ...newTag, color: target.value });
                      };
                      colorInput.click();
                    }}
                  />
                  <div className="flex flex-wrap gap-1">
                    {predefinedColors.map((color) => (
                      <div
                        key={color}
                        className="h-6 w-6 cursor-pointer rounded border border-gray-300 transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        onClick={() => setNewTag({ ...newTag, color })}
                      />
                    ))}
                  </div>
                </div>
                {validationErrors?.title && (
                  <p className="text-sm text-red-500">
                    {validationErrors.color}
                  </p>
                )}
              </div>

              {/* <div className="space-y-2">
                <Label htmlFor="order">Ordem</Label>
                <Input
                  type="text"
                  value={newTag?.order}
                  onChange={(e) =>
                    setNewTag({
                      ...newTag,
                      order: Number(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
              </div> */}

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddingTag(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={addTag}
                  className="bg-[#00183E] hover:bg-[#00183E]/90"
                >
                  {isCreating ? "Adicionando" : "Adicionar"}
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
              <Tag className="h-8 w-8 text-[#00183E]" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-600">Total de Tags</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Pesquisar tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tags Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tags ({filteredTags.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Nome</TableHead>
                <TableHead className="text-center">Cor</TableHead>
                <TableHead className="text-center">Ordem</TableHead>
                <TableHead className="text-center">Criado em</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTags
                .sort((a, b) => a.order - b.order)
                .map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-3">
                        <div className="flex w-44 items-center gap-2">
                          <div
                            className="h-4 w-4 rounded"
                            style={{ backgroundColor: tag.color }}
                          />
                          <div className="">
                            <p className="font-medium text-gray-900">
                              {tag.title}
                            </p>
                            {tag.description && (
                              <p className="text-sm text-gray-500">
                                {tag.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <div
                          className="h-6 w-6 rounded border"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-mono text-sm">{tag.color}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{tag.order}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-gray-800"
                      >
                        {new Date(tag.createdAt).toLocaleDateString("pt-BR")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingTag(tag)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTag(tag.id)}
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

          {filteredTags.length === 0 && (
            <div className="py-8 text-center">
              <Tag className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Nenhuma tag encontrada
              </h3>
              <p className="text-gray-500">
                Tente ajustar sua pesquisa ou criar uma nova tag.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Tag</DialogTitle>
          </DialogHeader>
          {editingTag && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingTag.title}
                  onChange={(e) =>
                    setEditingTag({ ...editingTag, title: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Input
                  id="edit-description"
                  value={editingTag.description || ""}
                  onChange={(e) =>
                    setEditingTag({
                      ...editingTag,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="edit-color">Cor</Label>
                <div className="mt-2 flex items-center space-x-2">
                  <div
                    className="h-8 w-8 cursor-pointer rounded border-2 border-gray-300"
                    style={{ backgroundColor: editingTag.color }}
                    onClick={() => {
                      const colorInput = document.createElement("input");
                      colorInput.type = "color";
                      colorInput.value = editingTag.color;
                      colorInput.onchange = (e) => {
                        const target = e.target as HTMLInputElement;
                        setEditingTag({ ...editingTag, color: target.value });
                      };
                      colorInput.click();
                    }}
                  />
                  <div className="flex flex-wrap gap-1">
                    {predefinedColors.map((color) => (
                      <div
                        key={color}
                        className="h-6 w-6 cursor-pointer rounded border border-gray-300 transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingTag({ ...editingTag, color })}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="edit-order">Ordem</Label>
                <Select
                  value={editingTag.order.toString()}
                  onValueChange={(value) =>
                    setEditingTag({
                      ...editingTag,
                      order: Number.parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: tags.length }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setEditingTag(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleUpdateTag}
                  disabled={isUpdating}
                  className="bg-[#00183E] hover:bg-[#00183E]/90"
                >
                  {isUpdating ? "Salvando..." : "Salvar Alterações"}
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
