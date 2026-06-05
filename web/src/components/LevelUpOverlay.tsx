import { Sparkles, X } from "lucide-react";
import { useEffect } from "react";

import { useCelebrationStore } from "@/store/celebrationStore";
import { cn } from "@/lib/utils";

export function LevelUpOverlay() {
  const levelUp = useCelebrationStore((s) => s.levelUp);
  const dismiss = useCelebrationStore((s) => s.dismissLevelUp);

  useEffect(() => {
    if (!levelUp) return;
    const timer = window.setTimeout(dismiss, 4200);
    return () => window.clearTimeout(timer);
  }, [levelUp, dismiss]);

  if (!levelUp) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[400] flex items-center justify-center p-4"
      aria-live="assertive"
      role="dialog"
      aria-label="Subiste de nível"
    >
      <div
        className="pointer-events-auto absolute inset-0 bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-300"
        aria-hidden
      />
      <div
        className={cn(
          "pointer-events-auto relative w-full max-w-sm overflow-hidden border border-violet-500/40 bg-background shadow-2xl",
          "animate-in zoom-in-95 fade-in duration-500"
        )}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-amber-400 to-fuchsia-500" />
        <button
          type="button"
          className="absolute right-3 top-3 p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Fechar"
          onClick={dismiss}
        >
          <X className="size-4" />
        </button>

        <div className="px-6 py-10 text-center">
          <Sparkles className="mx-auto size-10 text-amber-900 dark:text-amber-400 animate-pulse" />
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.25em] text-violet-900 dark:text-violet-400">
            Level up
          </p>
          <p className="mt-2 text-5xl font-bold tabular-nums text-foreground">
            {levelUp.level}
          </p>
          {levelUp.rankTitle ? (
            <p className="mt-3 text-sm font-medium text-violet-950 dark:text-violet-300">
              {levelUp.rankTitle}
            </p>
          ) : null}
          <p className="mt-4 text-sm text-muted-foreground">
            Continua — o próximo rank está mais perto.
          </p>
        </div>
      </div>
    </div>
  );
}
