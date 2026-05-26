import { cn } from "@/lib/utils";

const DEFAULT_MESSAGES = [
  "A sincronizar perfil…",
  "A preparar missões…",
  "A calcular progressão…",
];

type LifeOSLoadingProps = {
  message?: string;
  submessage?: string;
  rotatingMessages?: string[];
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
};

export function LifeOSLoading({
  message = "A carregar",
  submessage,
  rotatingMessages = DEFAULT_MESSAGES,
  size = "md",
  className,
  fullScreen = false,
}: LifeOSLoadingProps) {
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
          className="lifeos-loader-ring absolute inset-0 border-emerald-500/30"
          aria-hidden
        />
        <span
          className="lifeos-loader-ring lifeos-loader-ring-delay absolute inset-1 border-cyan-500/20"
          aria-hidden
        />
        <div
          className={cn(
            "relative z-10 font-bold tracking-tighter text-white",
            size === "sm" && "text-lg",
            size === "md" && "text-xl",
            size === "lg" && "text-2xl"
          )}
        >
          Life<span className="text-emerald-500">OS</span>
        </div>
        <span className="absolute -bottom-0.5 left-1/2 z-10 flex -translate-x-1/2 gap-0.5">
          <span className="lifeos-loader-dot size-1 bg-emerald-500" />
          <span className="lifeos-loader-dot lifeos-loader-dot-2 size-1 bg-emerald-500/70" />
          <span className="lifeos-loader-dot lifeos-loader-dot-3 size-1 bg-emerald-500/40" />
        </span>
      </div>

      <p
        className={cn(
          "mt-6 font-mono uppercase tracking-[0.2em] text-emerald-500/90",
          size === "sm" ? "text-[9px]" : "text-[10px]"
        )}
      >
        {message}
      </p>

      {submessage ? (
        <p className="mt-2 max-w-xs text-xs text-zinc-500">{submessage}</p>
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
            className="h-4 shrink-0 font-mono text-[10px] text-zinc-600"
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}
