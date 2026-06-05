import { useEffect } from "react";

import { applyTheme, resolveTheme } from "@/lib/applyTheme";
import { useThemeStore } from "@/store/themeStore";

/** Sincroniza tema com preferência do sistema quando `theme === "system"`. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      applyTheme("system");
      useThemeStore.setState({ resolved: resolveTheme("system") });
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  return children;
}
