import { cn } from "@/lib/utils";
import { gameBorderAccentClass, gameIconAccentClass, gameNeonTextClass } from "@/modules/game/styles/gameTokens";

type LevelBadgeProps = {
  level: number;
  rank: string;
  rankLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-3 py-1 text-xs",
  lg: "px-4 py-1.5 text-sm",
};

export function LevelBadge({
  level,
  rank,
  rankLabel,
  size = "md",
  className,
}: LevelBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 border bg-secondary/80 font-mono uppercase tracking-wider",
        gameBorderAccentClass,
        sizeClass[size],
        className
      )}
    >
      <span className={cn("font-semibold", gameNeonTextClass)}>Lv.{level}</span>
      <span className={gameIconAccentClass}>{rank}</span>
      {rankLabel ? (
        <span className="normal-case text-muted-foreground">{rankLabel}</span>
      ) : null}
    </div>
  );
}

