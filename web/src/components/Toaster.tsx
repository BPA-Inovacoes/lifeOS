import { CheckCircle2, Info, X, XCircle } from "lucide-react";

import { useToastStore, type ToastVariant } from "@/store/toastStore";
import { cn } from "@/lib/utils";

const variantStyles: Record<
  ToastVariant,
  { bar: string; icon: typeof Info; iconClass: string }
> = {
  success: {
    bar: "bg-emerald-600",
    icon: CheckCircle2,
    iconClass: "text-emerald-500",
  },
  error: {
    bar: "bg-red-600",
    icon: XCircle,
    iconClass: "text-red-400",
  },
  info: {
    bar: "bg-zinc-600",
    icon: Info,
    iconClass: "text-zinc-400",
  },
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[300] flex max-w-sm flex-col gap-2 p-4 sm:bottom-6 sm:right-6"
      aria-live="polite"
      aria-label="Notificações"
    >
      {toasts.map((t) => {
        const v = variantStyles[t.variant];
        const Icon = v.icon;
        return (
          <div
            key={t.id}
            className="pointer-events-auto relative overflow-hidden border border-zinc-800 bg-zinc-950 shadow-xl transition-opacity"
            role="status"
          >
            <div className={cn("absolute left-0 top-0 h-0.5 w-full", v.bar)} />
            <div className="flex items-start gap-3 px-4 py-3 pr-10">
              <Icon className={cn("size-4 shrink-0 mt-0.5", v.iconClass)} />
              <p className="text-sm text-zinc-200">{t.message}</p>
            </div>
            <button
              type="button"
              className="absolute right-2 top-2 p-1 text-zinc-600 hover:text-zinc-300"
              aria-label="Fechar"
              onClick={() => dismiss(t.id)}
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
