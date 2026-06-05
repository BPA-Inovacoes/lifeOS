import { X } from "lucide-react";

import { getToastThemeEntry } from "@/components/toastThemes";
import type { AppMode } from "@/routes/paths";
import { useToastStore } from "@/store/toastStore";
import { cn } from "@/lib/utils";

type Props = {
  /** Modo activo — cores do toast seguem Focus / Game / Finanças */
  mode?: AppMode;
};

export function Toaster({ mode = "focus" }: Props) {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[300] flex max-w-md flex-col gap-2 p-4 sm:bottom-6 sm:right-6"
      aria-live="polite"
      aria-label="Notificações"
    >
      {toasts.map((t) => {
        const v = getToastThemeEntry(mode, t.variant);
        const Icon = v.icon;
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto relative overflow-hidden border bg-background shadow-xl transition-opacity",
              v.border
            )}
            role="status"
          >
            <div className={cn("absolute left-0 top-0 h-1 w-full", v.bar)} />
            <div className="flex items-start gap-3 px-4 py-3.5 pr-11">
              <Icon className={cn("mt-0.5 size-5 shrink-0", v.iconClass)} />
              <p className="text-base leading-snug text-foreground">{t.message}</p>
            </div>
            <button
              type="button"
              className="absolute right-2 top-2.5 p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Fechar"
              onClick={() => dismiss(t.id)}
            >
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
