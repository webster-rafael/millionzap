const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface RequestOptions extends RequestInit {
  data?: unknown;
}

const client = async (
  endpoint: string,
  { data, headers: customHeaders, ...customConfig }: RequestOptions = {},
) => {
  const config: RequestInit = {
    method: data ? "POST" : "GET",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
    },
    credentials: "include",
    ...customConfig,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Ocorreu um erro na requisição" }));
    return Promise.reject(new Error(errorData.message));
  }

  if (response.status === 204) {
    return;
  }

  return response.json();
};

export const api = {
  get: (endpoint: string, options?: RequestOptions) =>
    client(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, data: unknown, options?: RequestOptions) =>
    client(endpoint, { ...options, data, method: "POST" }),
  put: (endpoint: string, data: unknown, options?: RequestOptions) =>
    client(endpoint, { ...options, data, method: "PUT" }),
  delete: (endpoint: string, options?: RequestOptions) =>
    client(endpoint, { ...options, method: "DELETE" }),
};
