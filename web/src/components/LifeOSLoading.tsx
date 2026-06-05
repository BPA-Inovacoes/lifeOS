import { cn } from "@/lib/utils";

const DEFAULT_MESSAGES = [
  "A sincronizar perfil…",
  "A preparar missões…",
  "A calcular progressão…",
];

type LifeOSLoadingVariant = "focus" | "game" | "finance";

type LifeOSLoadingProps = {
  message?: string;
  submessage?: string;
  rotatingMessages?: string[];
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
  variant?: LifeOSLoadingVariant;
};

const variantStyles: Record<
  LifeOSLoadingVariant,
  { ring: string; ringDelay: string; logo: string; dot: string; label: string }
> = {
  focus: {
    ring: "border-emerald-500/30",
    ringDelay: "border-cyan-500/20",
    logo: "text-emerald-800 dark:text-emerald-500",
    dot: "bg-emerald-500",
    label: "text-emerald-800/90 dark:text-emerald-500/90",
  },
  game: {
    ring: "border-violet-500/30",
    ringDelay: "border-fuchsia-500/20",
    logo: "text-violet-900 dark:text-violet-400",
    dot: "bg-violet-500",
    label: "text-violet-900/90 dark:text-violet-400/90",
  },
  finance: {
    ring: "border-amber-500/30",
    ringDelay: "border-yellow-500/20",
    logo: "text-amber-900 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "text-amber-900/90 dark:text-amber-400/90",
  },
};

export function LifeOSLoading({
  message = "A carregar",
  submessage,
  rotatingMessages = DEFAULT_MESSAGES,
  size = "md",
  className,
  fullScreen = false,
  variant = "focus",
}: LifeOSLoadingProps) {
  const colors = variantStyles[variant];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        fullScreen && "min-h-[min(420px,60vh)] w-full",
        className
      )}
    >
      <div
        className={cn(
          "relative flex items-center justify-center",
          size === "sm" && "size-16",
          size === "md" && "size-24",
          size === "lg" && "size-32"
        )}
      >
        <span
          className={cn("lifeos-loader-ring absolute inset-0", colors.ring)}
          aria-hidden
        />
        <span
          className={cn(
            "lifeos-loader-ring lifeos-loader-ring-delay absolute inset-1",
            colors.ringDelay
          )}
          aria-hidden
        />
        <div
          className={cn(
            "relative z-10 font-bold tracking-tighter text-foreground",
            size === "sm" && "text-lg",
            size === "md" && "text-xl",
            size === "lg" && "text-2xl"
          )}
        >
          Life<span className={colors.logo}>OS</span>
        </div>
        <span className="absolute -bottom-0.5 left-1/2 z-10 flex -translate-x-1/2 gap-0.5">
          <span className={cn("lifeos-loader-dot size-1", colors.dot)} />
          <span
            className={cn(
              "lifeos-loader-dot lifeos-loader-dot-2 size-1 opacity-70",
              colors.dot
            )}
          />
          <span
            className={cn(
              "lifeos-loader-dot lifeos-loader-dot-3 size-1 opacity-40",
              colors.dot
            )}
          />
        </span>
      </div>

      <p
        className={cn(
          "mt-6 font-mono uppercase tracking-[0.2em]",
          colors.label,
          size === "sm" ? "text-sm" : "text-base"
        )}
      >
        {message}
      </p>

      {submessage ? (
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">{submessage}</p>
      ) : (
        <RotatingHint messages={rotatingMessages} />
      )}
    </div>
  );
}

function RotatingHint({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;

  return (
    <div className="mt-2 h-4 overflow-hidden">
      <div className="lifeos-loader-hints flex flex-col">
        {messages.map((m) => (
          <span
            key={m}
            className="h-4 shrink-0 font-mono text-sm text-muted-foreground"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
