import axios from "axios";

const normalizeApiBase = (value?: string) => {
  if (!value) return null;
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed || /localhost|127\.0\.0\.1/.test(trimmed)) {
    return null;
  }
  return trimmed;
};

const getRuntimeApiBaseUrl = () => {
  const configured = normalizeApiBase(process.env.NEXT_PUBLIC_API_URL);
  if (configured) return configured;

  if (typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  return "https://backend-rho-lemon-54.vercel.app/api";
};

const baseURL = getRuntimeApiBaseUrl();

// Public API instance (no auth interceptors)
export const publicApi = axios.create({
  baseURL,
  withCredentials: true,
});

// Authenticated API instance
export const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && !config.headers.Authorization) {
    const accessToken = window.localStorage.getItem("accessToken");
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

// Error handling helper (Toast replacement - to be implemented in UI layer usually, 
// but we'll return rejected promises to let TanStack Query handle it)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 handling is primarily done in useAuth.tsx where we have the refresh loop
    return Promise.reject(error);
  }
);
