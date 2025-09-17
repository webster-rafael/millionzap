import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";

export type ConnectionStatus = {
  state: "connecting" | "open" | "close";
};

const resourceUrl = "/qrcode-status";
const queryKey = ["connectionStatus"];

export const fetchConnectionStatus = async (
  instanceName: string,
): Promise<ConnectionStatus> => {
  const response = await api.get(`${resourceUrl}?instanceName=${instanceName}`);
  return { state: response.instance.state };
};

type UseQrCodeStatusOptions = {
  enabled: boolean;
};

export const useQrCodeStatus = (
  instanceName: string | null,
  options: UseQrCodeStatusOptions,
) => {
  const { enabled } = options;

  const {
    data,
    isLoading: isLoadingStatus,
    isError: isErrorStatus,
    refetch: refetchStatus,
  } = useQuery<ConnectionStatus>({
    queryKey: [...queryKey, instanceName],
    queryFn: () => {
      if (!instanceName) return Promise.resolve({ state: "close" });
      return fetchConnectionStatus(instanceName);
    },
    enabled: !!instanceName && enabled,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  return {
    connectionStatus: data?.state ?? "close",
    isLoadingStatus,
    isErrorStatus,
    refetchStatus,
  };
};
