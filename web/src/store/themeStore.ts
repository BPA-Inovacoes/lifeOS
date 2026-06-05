import { create } from "zustand";

import {
  applyTheme,
  readStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/applyTheme";

type ThemeState = {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleLightDark: () => void;
};

function persistTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

const initialTheme = readStoredTheme() ?? "dark";

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  resolved: typeof window !== "undefined" ? resolveTheme(initialTheme) : "dark",
  setTheme: (theme) => {
    applyTheme(theme);
    persistTheme(theme);
    set({ theme, resolved: resolveTheme(theme) });
  },
  toggleLightDark: () => {
    const next = get().resolved === "dark" ? "light" : "dark";
    get().setTheme(next);
  },
}));
