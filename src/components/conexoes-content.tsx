import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Plus,
  Smartphone,
  XCircle,
  Loader2,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { useWhatsAppConnections } from "@/hooks/useWhatsConnection";
import { useQueues } from "@/hooks/useQueues";
import { usePrompts } from "@/hooks/usePrompts";
import {
  connectionSchema,
  type ConnectionFormData,
} from "@/validations/whatsConnectionSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { WhatsAppConnection } from "@/interfaces/whatsappConnection-interface";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ConnectionRow } from "@/components/connectionRow";

export function ConexoesContent() {
  const {
    connections,
    isLoadingConnection,
    isErrorConnection,
    createConnection,
    isCreating,
    updateConnection,
    isUpdating,
    deleteConnection,
  } = useWhatsAppConnections();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setCurrentConnection] = useState<WhatsAppConnection | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [editingConexao, setEditingConexao] =
    useState<WhatsAppConnection | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState("");
  const { queues } = useQueues();
  const { prompts } = usePrompts();
  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      name: "",
      isDefault: false,
      greetingMessage: "",
      conclusionMessage: "",
      outOfOfficeHoursMessage: "",
      reviewMessage: "",
      token: "",
      queueId: "",
      promptId: "",
      transferQueueId: "",
      timeToTransfer: "0",
      expiresInactiveMessage: "",
    },
  });

  const filteredConexoes = connections.filter((conexao) =>
    conexao.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // const handleConnectionSuccess = () => {
  //   toast.success("Instância conectada com sucesso!");
  //   setIsQrModalOpen(false);
  //   if (currentConnection) {
  //     updateConnection({ ...currentConnection, status: "OPEN" });
  //   } else {
  //     console.error("Erro: A conexão atual é nula e não pode ser atualizada.");
  //   }
  // };

  // useEffect(() => {
  //   if (connectionStatus === "open") {
  //     handleConnectionSuccess();
  //     setIsQrModalOpen(false);
  //   }
  // }, [connectionStatus]);

  const handleOpenModal = (conexao?: WhatsAppConnection) => {
    if (conexao) {
      setEditingConexao(conexao);
      form.reset({
        name: conexao.name,
        isDefault: conexao.isDefault,
        greetingMessage: conexao.greetingMessage || "",
        conclusionMessage: conexao.conclusionMessage || "",
        outOfOfficeHoursMessage: conexao.outOfOfficeHoursMessage || "",
        reviewMessage: conexao.reviewMessage || "",
        token: conexao.token || "",
        queueId: conexao.queueId || "",
        promptId: conexao.promptId || "",
        transferQueueId: conexao.transferQueueId || "",
        timeToTransfer: conexao.timeToTransfer || "0",
        expiresInactiveMessage: conexao.expiresInactiveMessage || "",
      });
    } else {
      setEditingConexao(null);
      form.reset();
    }
    setIsModalOpen(true);
  };

  const onSubmit = (data: ConnectionFormData) => {
    const mutationCallback = () => {
      setIsModalOpen(false);
      setEditingConexao(null);
      toast.success(
        `Conexão ${editingConexao ? "atualizada" : "criada"} com sucesso!`,
      );
    };

    if (editingConexao) {
      updateConnection(
        { ...editingConexao, ...data },
        { onSuccess: mutationCallback },
      );
    } else {
      const payload = {
        ...data,
        session: "",
        qrCode: "",
        status: "CLOSED",
      };
      createConnection(payload, { onSuccess: mutationCallback });
    }
  };

  const handleDelete = (id: string) => {
    deleteConnection(id, {
      onSuccess: () => toast.success("Conexão excluída com sucesso!"),
      onError: (err) => toast.error(`Falha ao excluir: ${err.message}`),
    });
  };

  const handleShowQrCode = async (connection: WhatsAppConnection) => {
    setCurrentConnection(connection);
    setIsQrModalOpen(true);
    setQrCodeImage("");

    try {
      const webhookUrl = import.meta.env.VITE_CONNECTION_WEBHOOK;
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName: connection.name,
          userId: connection.id,
          connectionId: connection.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao gerar o QR Code. Status: ${response.status}`);
      }

      const imageBlob = await response.blob();
      const imageObjectURL = URL.createObjectURL(imageBlob);
      setQrCodeImage(imageObjectURL);
    } catch (error) {
      console.error("Falha ao gerar o QR Code:", error);
      toast.error("Não foi possível gerar o QR Code.");
      setIsQrModalOpen(false);
    }
  };

  const handleDesconnect = async (connection: WhatsAppConnection) => {
    setCurrentConnection(connection);
    try {
      const webhookUrl = import.meta.env.VITE_DESCONECTION_WEBHOOK;
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instanceName: connection.name,
          connectionId: connection.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao desconectar.`);
      }
    } catch (error) {
      console.error("Falha ao desconectar", error);
      toast.error("Não foi possível desconectar.");
    }
  };

  if (isLoadingConnection) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-[#00183E]" />
      </div>
    );
  }

  if (isErrorConnection) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-red-500">
        <XCircle className="mb-4 h-16 w-16" />
        <h2 className="text-xl font-semibold">Erro ao carregar conexões</h2>
        <p>Tente recarregar a página.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
            <Smartphone className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conexões</h1>
            <p className="text-sm text-gray-500">
              Gerencie suas conexões WhatsApp
            </p>
          </div>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-[#00183E] hover:bg-[#00183E]/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          ADICIONAR WHATSAPP
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Pesquisar conexões..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Sessão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Última atualização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Padrão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredConexoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Smartphone className="mb-4 h-12 w-12 text-gray-400" />
                      <h3 className="mb-2 text-lg font-medium text-gray-900">
                        Nenhuma conexão encontrada
                      </h3>
                      <p className="mb-4 text-gray-500">
                        {searchTerm
                          ? "Tente ajustar sua pesquisa."
                          : "Comece criando sua primeira conexão WhatsApp."}
                      </p>
                      {!searchTerm && (
                        <Button
                          onClick={() => handleOpenModal()}
                          className="bg-[#00183E] hover:bg-[#00183E]/90"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Conexão
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredConexoes.map((conexao) => (
                  <ConnectionRow
                    key={conexao.id}
                    connection={conexao}
                    handleOpenModal={handleOpenModal}
                    handleDelete={handleDelete}
                    handleShowQrCode={handleShowQrCode}
                    handleDesconnect={handleDesconnect}
                    showQrCode={setIsQrModalOpen}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Adicionar/Editar Conexão */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConexao ? "Editar WhatsApp" : "Adicionar WhatsApp"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome e Padrão */}
              <div className="grid grid-cols-2 items-start gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da conexão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 pt-8">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel>Padrão</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              {/* Mensagens */}
              <FormField
                control={form.control}
                name="greetingMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem de saudação</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mensagem de boas-vindas..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ... (outros campos de Textarea seguem o mesmo padrão) ... */}
              <FormField
                control={form.control}
                name="conclusionMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem de conclusão</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mensagem de despedida..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outOfOfficeHoursMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem de fora de expediente</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Mensagem para horário não comercial..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Filas e Prompt */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="queueId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fila Padrão</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma fila" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {queues.map((q) => (
                            <SelectItem key={q.id} value={q.id}>
                              {q.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="promptId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um prompt" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {prompts.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 border-t pt-6">
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
                  {editingConexao ? "ATUALIZAR" : "ADICIONAR"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal QR Code */}
      <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              Leia o QrCode para iniciar a sessão
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <div className="rounded-lg border-2 border-gray-200 bg-white p-4">
              <div className="flex h-64 w-64 items-center justify-center">
                {qrCodeImage ? (
                  <img
                    src={qrCodeImage}
                    alt="QR Code para conexão do WhatsApp"
                  />
                ) : (
                  <Loader2 className="h-16 w-16 animate-spin text-[#00183E]" />
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster />
    </div>
  );
}
