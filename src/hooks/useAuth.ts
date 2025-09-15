import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  companyName: string;
  connectionId?: string | null;
  tokenIg?: string | null;
  instagramId?: string | null;
  instagramAuthenticated?: boolean | null;
  queues: {
    queue: {
      id: string;
      name: string;
    };
  }[];
}

interface LoginCredentials {
  email: string;
  password: string;
}

type SignUpPayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
  planId: string;
};

const authQueryKey = ["auth-user"];

const fetchUser = async (): Promise<User | null> => {
  try {
    const user = await api.get("/companies/me");
    return user;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return null;
  }
};

const login = (credentials: LoginCredentials): Promise<User> =>
  api.post("/companies/login", credentials);

const signUp = (data: SignUpPayload): Promise<User> =>
  api.post("/companies", data);

const logout = (): Promise<void> => api.post("/companies/logout", {});

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: authQueryKey,
    queryFn: fetchUser,
    retry: true,
  });

  const { mutate: loginUser, isPending: isLoggingIn } = useMutation({
    mutationFn: login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKey });
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const { mutate: signUpUser, isPending: isSigningUp } = useMutation({
    mutationFn: signUp,
    onSuccess: (userData) => {
      queryClient.setQueryData(authQueryKey, userData);
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const { mutate: logoutUser } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKey, null);
    },
  });

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoadingUser,
    loginUser,
    isLoggingIn,
    signUpUser,
    isSigningUp,
    logoutUser,
  };
};
