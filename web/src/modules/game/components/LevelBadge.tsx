import { cn } from "@/lib/utils";
import { gameNeonTextClass } from "@/modules/game/styles/gameTokens";

type LevelBadgeProps = {
  level: number;
  rank: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
};

export function LevelBadge({
  level,
  rank,
  size = "md",
  className,
}: LevelBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 border border-emerald-800/50 bg-zinc-900/80 font-mono uppercase tracking-wider",
        sizeClass[size],
        className
      )}
    >
      <span className={cn("font-semibold", gameNeonTextClass)}>Lv.{level}</span>
      <span className="text-zinc-500">{rank}</span>
    </div>
  );
}

