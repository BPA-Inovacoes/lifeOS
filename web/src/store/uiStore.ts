import { create } from "zustand";

type UiState = {
  commandPaletteOpen: boolean;
  shortcutsHelpOpen: boolean;
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  gameModeEnabled: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setShortcutsHelpOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setGameModeEnabled: (enabled: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  commandPaletteOpen: false,
  shortcutsHelpOpen: false,
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  gameModeEnabled: false,
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setShortcutsHelpOpen: (shortcutsHelpOpen) => set({ shortcutsHelpOpen }),
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  setMobileSidebarOpen: (mobileSidebarOpen) => set({ mobileSidebarOpen }),
  setGameModeEnabled: (gameModeEnabled) => set({ gameModeEnabled }),
}));
