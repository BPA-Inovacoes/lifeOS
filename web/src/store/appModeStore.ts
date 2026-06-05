import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AppMode } from "@/routes/paths";

type AppModeState = {
  /** Modo escolhido após login; null = ainda não escolheu (vai para `/mode`). */
  activeMode: AppMode | null;
  setActiveMode: (mode: AppMode) => void;
  clearActiveMode: () => void;
};

export const useAppModeStore = create<AppModeState>()(
  persist(
    (set) => ({
      activeMode: null,
      setActiveMode: (activeMode) => set({ activeMode }),
      clearActiveMode: () => set({ activeMode: null }),
    }),
    {
      name: "lifeos-app-mode",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ activeMode: state.activeMode }),
    }
  )
);
