import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/constants/product";
import { cn } from "@/lib/utils";

type AppBrandAccent = "focus" | "game" | "finance";

type AppBrandProps = {
  size?: "sidebar" | "default" | "compact";
  className?: string;
  showTagline?: boolean;
  tagline?: string;
  accent?: AppBrandAccent;
};

const accentStyles: Record<
  AppBrandAccent,
  {
    status: string;
    ping: string;
    dot: string;
    logo: string;
    badge: string;
  }
> = {
  focus: {
    status: "text-emerald-800 dark:text-emerald-600/80",
    ping: "bg-emerald-500",
    dot: "bg-emerald-500",
    logo: "text-emerald-700 dark:text-emerald-500",
    badge: "text-emerald-800 dark:text-emerald-500",
  },
  game: {
    status: "text-violet-800 dark:text-violet-500/90",
    ping: "bg-violet-500",
    dot: "bg-violet-500",
    logo: "text-violet-700 dark:text-violet-400",
    badge: "text-violet-800 dark:text-violet-400",
  },
  finance: {
    status: "text-amber-800 dark:text-amber-500/90",
    ping: "bg-amber-500",
    dot: "bg-amber-500",
    logo: "text-amber-700 dark:text-amber-400",
    badge: "text-amber-800 dark:text-amber-400",
  },
};

export function AppBrand({
  size = "default",
  className,
  showTagline = true,
  tagline = PRODUCT_TAGLINE,
  accent = "focus",
}: AppBrandProps) {
  const sidebar = size === "sidebar";
  const compact = size === "compact";
  const colors = accentStyles[accent];

  return (
    <div className={cn("select-none", className)}>
      {!sidebar ? (
        <div
          className={cn(
            "inline-flex items-center gap-2 border border-border bg-card px-3 py-1",
            "font-mono text-xs uppercase tracking-[0.28em]",
            compact ? "mb-2" : "mb-3 sm:mb-4",
            colors.badge
          )}
        >
          <span className="relative flex size-2">
            <span
              className={cn(
                "absolute inline-flex size-full animate-ping opacity-40",
                colors.ping
              )}
            />
            <span className={cn("relative inline-flex size-2", colors.dot)} />
          </span>
          sistema pronto
        </div>
      ) : (
        <div
          className={cn(
            "mb-2 font-mono text-xs uppercase tracking-[0.2em]",
            colors.status
          )}
        >
          // ligado
        </div>
      )}

      <div className={cn("relative", sidebar ? "" : "inline-block")}>
        {!sidebar && !compact ? (
          <>
            <span
              className="pointer-events-none absolute -left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground"
              aria-hidden
            >
              [
            </span>
            <span
              className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 font-mono text-sm text-muted-foreground"
              aria-hidden
            >
              ]
            </span>
          </>
        ) : null}

        <div
          className={cn(
            "font-bold tracking-tighter text-foreground",
            sidebar ? "text-base" : compact ? "text-3xl" : "text-[2.75rem] leading-none"
          )}
        >
          {PRODUCT_NAME.slice(0, 4)}
          <span className={colors.logo}>{PRODUCT_NAME.slice(4)}</span>
        </div>
      </div>

      {showTagline ? (
        <p
          className={cn(
            "mt-1 font-mono uppercase tracking-[0.18em] text-muted-foreground",
            sidebar ? "text-xs leading-snug" : compact ? "text-xs" : "text-xs"
          )}
        >
          {tagline}
        </p>
      ) : null}
    </div>
  );
}
