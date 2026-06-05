import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ViewToolbarProps = {
  label: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
};

/** Cabeçalho uniforme das vistas de database (A8). */
export function ViewToolbar({ label, hint, action, className }: ViewToolbarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-end justify-between gap-3",
        className
      )}
    >
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-600/80">
          {label}
        </p>
        {hint ? <p className="mt-1 text-sm text-muted-foreground">{hint}</p> : null}
      </div>
      {action ?? null}
    </div>
  );
}
