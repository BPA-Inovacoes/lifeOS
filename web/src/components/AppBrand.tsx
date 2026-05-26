import { PRODUCT_NAME, PRODUCT_TAGLINE } from "@/constants/product";
import { cn } from "@/lib/utils";

type AppBrandProps = {
  size?: "sidebar" | "default" | "compact";
  className?: string;
  showTagline?: boolean;
  tagline?: string;
};

export function AppBrand({
  size = "default",
  className,
  showTagline = true,
  tagline = PRODUCT_TAGLINE,
}: AppBrandProps) {
  const sidebar = size === "sidebar";
  const compact = size === "compact";

  return (
    <div className={cn("select-none", className)}>
      {!sidebar ? (
        <div
          className={cn(
            "mb-4 inline-flex items-center gap-2 border border-zinc-800 bg-zinc-900 px-3 py-1",
            "font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-500"
          )}
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping bg-emerald-500 opacity-40" />
            <span className="relative inline-flex size-2 bg-emerald-500" />
          </span>
          sistema pronto
        </div>
      ) : (
        <div className="mb-2 font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-600/80">
          // ligado
        </div>
      )}

      <div className={cn("relative", sidebar ? "" : "inline-block")}>
        {!sidebar && !compact ? (
          <>
            <span
              className="pointer-events-none absolute -left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-600"
              aria-hidden
            >
              [
            </span>
            <span
              className="pointer-events-none absolute -right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-zinc-600"
              aria-hidden
            >
              ]
            </span>
          </>
        ) : null}

        <div
          className={cn(
            "font-bold tracking-tighter text-white",
            sidebar ? "text-base" : compact ? "text-3xl" : "text-[2.75rem] leading-none"
          )}
        >
          {PRODUCT_NAME.slice(0, 4)}
          <span className="text-emerald-500">{PRODUCT_NAME.slice(4)}</span>
        </div>
      </div>

      {showTagline ? (
        <p
          className={cn(
            "mt-1 font-mono uppercase tracking-[0.18em] text-zinc-500",
            sidebar ? "text-[9px] leading-snug" : compact ? "text-[10px]" : "text-xs"
          )}
        >
          {tagline}
        </p>
      ) : null}
    </div>
  );
}
