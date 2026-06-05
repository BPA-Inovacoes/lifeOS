import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { cn } from "@/lib/utils";
import { techCardAccentClass, techCardClass } from "@/styles/designTokens";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  hint: string;
  value: ReactNode;
  footer?: ReactNode;
  href?: string;
  linkLabel?: string;
  highlight?: boolean;
  className?: string;
};

export function MetricCard({
  icon: Icon,
  label,
  hint,
  value,
  footer,
  href,
  linkLabel = "Abrir →",
  highlight,
  className,
}: MetricCardProps) {
  return (
    <article
      className={cn(
        techCardClass,
        "group flex flex-col transition-colors hover:border-border",
        highlight && "border-emerald-900/60",
        className
      )}
    >
      <div
        className={cn(techCardAccentClass, highlight && "h-1 bg-emerald-500")}
        aria-hidden
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-9 items-center justify-center border border-border bg-card">
            <Icon className="size-4 text-emerald-800 dark:text-emerald-500" aria-hidden />
          </div>
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>

        <p className="mt-4 text-3xl font-bold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>

        {footer ? <div className="mt-4">{footer}</div> : null}

        {href ? (
          <Link
            to={href}
            className="mt-4 inline-flex font-mono text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-500 transition-colors hover:text-emerald-700 dark:hover:text-emerald-400"
          >
            {linkLabel}
          </Link>
        ) : null}
      </div>
    </article>
  );
}
