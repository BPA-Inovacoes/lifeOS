export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "lifeos-theme";

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

export function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

export function readStoredTheme(): Theme | null {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Chamado antes do React montar — evita flash de tema errado. */
export function initThemeBeforeRender(defaultTheme: Theme = "dark") {
  const stored = readStoredTheme();
  applyTheme(stored ?? defaultTheme);
}
