import { useEffect, useRef } from "react";
import { useWhatsAppConnections } from "@/hooks/useWhatsConnection";
import { useQueries } from "@tanstack/react-query";
import { fetchConnectionStatus } from "@/hooks/useQrCodeStatus";
import { toast } from "sonner";

export function useConnectionMonitor() {
  const { connections, updateConnection } = useWhatsAppConnections();
  const lastStatuses = useRef<Record<string, string>>({});

  const results = useQueries({
    queries: connections.map((conn) => ({
      queryKey: ["connectionStatus", conn.name],
      queryFn: () => fetchConnectionStatus(conn.name),
      enabled: !!conn.name,
      refetchInterval: 5000,
      refetchIntervalInBackground: true,
      staleTime: 0,
    })),
  });

  useEffect(() => {
    results.forEach((res, idx) => {
      const conn = connections[idx];
      if (!conn || !res.data) return;

      const status = res.data.state.toUpperCase();

      if (lastStatuses.current[conn.id] === status) return;
      lastStatuses.current[conn.id] = status;

      if (status === "OPEN") {
        updateConnection({ id: conn.id, payload: { status } });
        toast.success(`Conexão ${conn.name} conectada!`);
      } else if (status === "CLOSE") {
        updateConnection({ id: conn.id, payload: { status: "CLOSED" } });
        toast.error(`A Conexão ${conn.name} foi desconectada!`);
      }
    });
  }, [results, connections, updateConnection]);
}
