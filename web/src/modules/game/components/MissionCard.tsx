import {
  BookOpen,
  CheckSquare,
  Flame,
  MoonStar,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  gameGlassClass,
  gamePanelClass,
  gameProgressBarClass,
  gameProgressBarCompleteClass,
  gameXpTextClass,
} from "@/modules/game/styles/gameTokens";
import type { GameMission } from "@/services/gameApi";

const ICONS: Record<string, LucideIcon> = {
  "check-square": CheckSquare,
  "book-open": BookOpen,
  flame: Flame,
  "moon-star": MoonStar,
  zap: Zap,
};

type MissionCardProps = {
  mission: GameMission;
};

export function MissionCard({ mission }: MissionCardProps) {
  const Icon = ICONS[mission.icon] ?? Zap;
  const percent = Math.min(
    100,
    mission.target > 0 ? (mission.progress / mission.target) * 100 : 0
  );

  return (
    <article
      className={cn(
        gamePanelClass,
        gameGlassClass,
        "p-4",
        mission.completed && "border-violet-700/50"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "size-5 shrink-0",
            mission.completed ? "text-violet-900 dark:text-violet-400" : "text-muted-foreground"
          )}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground">{mission.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{mission.description}</p>
          <div className="mt-3 h-1.5 overflow-hidden border border-border/60 bg-card">
            <div
              className={cn(
                "h-full transition-all duration-500",
                mission.completed
                  ? gameProgressBarCompleteClass
                  : gameProgressBarClass
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-xs">
            <span className="text-muted-foreground">
              {mission.progress}/{mission.target}
            </span>
            <span className={gameXpTextClass}>+{mission.xpReward} XP</span>
          </div>
        </div>
      </div>
    </article>
  );
}
