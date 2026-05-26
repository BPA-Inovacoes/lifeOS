import { cn } from "@/lib/utils";
import { gameNeonTextClass } from "@/modules/game/styles/gameTokens";

type XPBarProps = {
  percent: number;
  xpInLevel: number;
  xpNeeded: number;
  compact?: boolean;
  className?: string;
};

export function XPBar({
  percent,
  xpInLevel,
  xpNeeded,
  compact = false,
  className,
}: XPBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={className}>
      <div
        className={cn(
          "relative overflow-hidden border border-zinc-700/60 bg-zinc-900/80",
          compact ? "h-1.5" : "h-2"
        )}
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-cyan-500 transition-all duration-700 ease-out"
          style={{ width: `${clamped}%` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-60" />
      </div>
      {!compact ? (
        <p className="mt-1.5 font-mono text-[10px] text-zinc-500">
          <span className={gameNeonTextClass}>{xpInLevel}</span>
          <span className="text-zinc-600"> / {xpNeeded} XP</span>
        </p>
      ) : null}
    </div>
  );
}

