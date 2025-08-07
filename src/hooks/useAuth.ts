import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface User {
  id: string;
  name: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  company: User;
  token: string;
}

type SignUpPayload = {
  name: string;
  phone: string;
  email: string;
  password: string;
  planId: string;
};

const API_URL = import.meta.env.VITE_BACKEND_URL;
const authQueryKey = ["auth-user"];

const fetchUser = async (): Promise<User | null> => {
  const token = localStorage.getItem("@million-token");
  if (!token) return null;

  const response = await fetch(`${API_URL}/companies/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    localStorage.removeItem("@million-token");
    return null;
  }

  return response.json();
};

const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/companies/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || "Falha ao fazer login");
  }

  return response.json();
};

const signUp = async (data: SignUpPayload): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/companies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const error = new Error(
      errorData?.message || "Falha ao criar conta",
    ) as Error & { code?: string };
    error.code = errorData?.code;
    throw error;
  }

  return response.json();
};

export const useAuth = () => {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: authQueryKey,
    queryFn: fetchUser,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const handleAuthSuccess = (data: AuthResponse) => {
    const { company, token } = data;
    localStorage.setItem("@million-token", token);
    queryClient.setQueryData(authQueryKey, company);
  };

  const { mutate: loginUser, isPending: isLoggingIn } = useMutation({
    mutationFn: login,
    onSuccess: handleAuthSuccess,
  });

  const { mutate: signUpUser, isPending: isSigningUp } = useMutation({
    mutationFn: signUp,
    onSuccess: handleAuthSuccess,
  });

  const logoutUser = () => {
    localStorage.removeItem("@million-token");
    queryClient.setQueryData(authQueryKey, null);
    queryClient.invalidateQueries();
  };

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
