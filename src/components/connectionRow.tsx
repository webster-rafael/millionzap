// components/ConnectionRow.tsx
import React, { useEffect } from "react";
import { useQrCodeStatus } from "@/hooks/useQrCodeStatus";
import { useWhatsAppConnections } from "@/hooks/useWhatsConnection";
import type { WhatsAppConnection } from "@/interfaces/whatsappConnection-interface";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Edit,
  MoreHorizontal,
  Power,
  RotateCcw,
  Trash2,
  Smartphone,
  Copy,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ConnectionRowProps {
  connection: WhatsAppConnection;
  handleOpenModal: (connection: WhatsAppConnection) => void;
  handleDelete: (id: string) => void;
  handleShowQrCode: (connection: WhatsAppConnection) => void;
  handleDesconnect: (connection: WhatsAppConnection) => void;
  showQrCode: (value: boolean) => void;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "OPEN":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "CLOSED":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "PENDING":
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
    default:
      return <XCircle className="h-4 w-4 text-gray-500" />;
  }
};

export const ConnectionRow = ({
  connection,
  handleOpenModal,
  handleDelete,
  handleShowQrCode,
  handleDesconnect,
  showQrCode,
}: ConnectionRowProps) => {
  const { connectionStatus, refetchStatus } = useQrCodeStatus(connection.name, {
    enabled: true,
  });

  const { updateConnection } = useWhatsAppConnections();

  useEffect(() => {
    if (connectionStatus === "open" && connection.status !== "OPEN") {
      updateConnection({ ...connection, status: "OPEN" });
      toast.success(`Conexão ${connection.name} atualizada para Conectado!`);
      showQrCode(false);
    } else if (connectionStatus === "close" && connection.status !== "CLOSED") {
      updateConnection({ ...connection, status: "CLOSED" });
      toast.error(`Conexão ${connection.name} desconectada.`);
    }
  }, [connectionStatus, connection, updateConnection]);

  return (
    <tr key={connection.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
            <Smartphone className="h-4 w-4 text-green-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">
              {connection.name}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          {getStatusBadge(connectionStatus.toUpperCase())}
          <span className="ml-2 text-sm text-gray-900 capitalize">
            {connectionStatus === "open"
              ? "Conectado"
              : connectionStatus === "close"
                ? "Desconectado"
                : "Aguardando"}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {connectionStatus === "open" ? (
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 bg-transparent text-red-600 hover:bg-red-50"
            onClick={() => handleDesconnect(connection)}
          >
            DESCONECTAR
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="border-blue-200 bg-transparent text-blue-600 hover:bg-blue-50"
            onClick={() => handleShowQrCode(connection)}
          >
            QR CODE
          </Button>
        )}
      </td>
      <td className="px-6 py-4 font-mono text-sm whitespace-nowrap text-gray-900">
        {new Date(connection.updatedAt).toLocaleDateString("pt-BR")}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {connection.isDefault && (
          <CheckCircle className="h-5 w-5 text-green-500" />
        )}
      </td>
      <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenModal(connection)}
            className="text-blue-600 hover:text-blue-900"
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
              <DropdownMenuItem onClick={() => handleOpenModal(connection)}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDesconnect(connection)}>
                <Power className="mr-2 h-4 w-4" />
                {connectionStatus === "open" ? "Desconectar" : "Conectar"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => refetchStatus()}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reiniciar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(connection.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
};
