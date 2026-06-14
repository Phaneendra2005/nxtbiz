import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? API_URL;

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nxtbiz_access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && original && !original._retry && !original.url?.includes("/api/auth/")) {
      original._retry = true;
      const response = await api.post("/api/auth/refresh");
      localStorage.setItem("nxtbiz_access_token", response.data.accessToken);
      original.headers.Authorization = `Bearer ${response.data.accessToken}`;
      return api(original);
    }

    return Promise.reject(error);
  }
);
