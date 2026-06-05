import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { techCardClass, transitionColorsClass } from "@/styles/designTokens";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        techCardClass,
        transitionColorsClass,
        "relative text-center",
        compact ? "px-6 py-10" : "px-8 py-14",
        className
      )}
    >
      <div className="absolute left-0 top-0 h-0.5 w-full bg-zinc-700" aria-hidden />
      <span
        className={cn(
          "mx-auto flex items-center justify-center border border-border bg-card",
          compact ? "size-10" : "size-12"
        )}
      >
        <Icon
          className={cn(
            "text-emerald-600/70",
            compact ? "size-5" : "size-6"
          )}
        />
      </span>
      <p
        className={cn(
          "font-medium text-foreground",
          compact ? "mt-3 text-sm" : "mt-4 text-base"
        )}
      >
        {title}
      </p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center gap-2">{action}</div> : null}
    </div>
  );
}
