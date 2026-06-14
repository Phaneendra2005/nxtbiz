import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../api/client.js";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: localStorage.getItem("nxtbiz_access_token"),
      isBootstrapping: true,
      login: async (credentials) => {
        const response = await api.post("/api/auth/login", credentials);
        localStorage.setItem("nxtbiz_access_token", response.data.accessToken);
        set({ user: response.data.user, accessToken: response.data.accessToken });
        return response.data.user;
      },
      register: async (payload) => {
        const response = await api.post("/api/auth/register", payload);
        localStorage.setItem("nxtbiz_access_token", response.data.accessToken);
        set({ user: response.data.user, accessToken: response.data.accessToken });
        return response.data.user;
      },
      logout: async () => {
        try {
          await api.post("/api/auth/logout");
        } finally {
          localStorage.removeItem("nxtbiz_access_token");
          set({ user: null, accessToken: null });
        }
      },
      loadSession: async () => {
        if (!get().accessToken) {
          set({ isBootstrapping: false });
          return;
        }

        try {
          const response = await api.get("/api/auth/me");
          set({ user: response.data.user, isBootstrapping: false });
        } catch (error) {
          localStorage.removeItem("nxtbiz_access_token");
          set({ user: null, accessToken: null, isBootstrapping: false });
        }
      },
      setBootstrapped: () => set({ isBootstrapping: false })
    }),
    {
      name: "nxtbiz-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken
      })
    }
  )
);
