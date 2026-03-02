import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";

interface AppState {
  token: string | null;
  user: User | null;
  activeTaskId: number | null;

  setToken: (token: string) => void;
  setUser: (user: User) => void;
  setActiveTask: (taskId: number | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      activeTaskId: null,

      setToken: (token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", token);
        }
        set({ token });
      },

      setUser: (user) => set({ user }),

      setActiveTask: (taskId) => set({ activeTaskId: taskId }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token");
        }
        set({ token: null, user: null, activeTaskId: null });
      },
    }),
    {
      name: "devtaskr-store",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
