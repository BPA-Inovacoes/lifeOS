import { Monitor, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Theme } from "@/lib/applyTheme";
import { useThemeStore } from "@/store/themeStore";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  /** Mostrar opção «sistema» além de claro/escuro */
  showSystem?: boolean;
  compact?: boolean;
};

const OPTIONS: { id: Theme; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
  { id: "system", label: "Sistema", icon: Monitor },
];

export function ThemeToggle({ className, showSystem = false, compact = false }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const resolved = useThemeStore((s) => s.resolved);
  const setTheme = useThemeStore((s) => s.setTheme);
  const toggleLightDark = useThemeStore((s) => s.toggleLightDark);

  if (showSystem) {
    return (
      <div
        className={cn(
          "inline-flex rounded-none border border-border bg-card p-0.5",
          className
        )}
        role="group"
        aria-label="Tema da interface"
      >
        {OPTIONS.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1.5 px-2.5",
              theme === id && "bg-secondary text-foreground"
            )}
            aria-pressed={theme === id}
            aria-label={label}
            onClick={() => setTheme(id)}
          >
            <Icon className="size-4" />
            {!compact ? <span className="hidden sm:inline">{label}</span> : null}
          </Button>
        ))}
      </div>
    );
  }

  const Icon = resolved === "dark" ? Moon : Sun;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn("size-9 px-0", className)}
      aria-label={resolved === "dark" ? "Activar modo claro" : "Activar modo escuro"}
      title={resolved === "dark" ? "Modo claro" : "Modo escuro"}
      onClick={toggleLightDark}
    >
      <Icon className="size-4" />
    </Button>
  );
}
