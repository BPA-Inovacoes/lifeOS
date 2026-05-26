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
        mission.completed && "border-emerald-700/50"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={cn(
            "size-5 shrink-0",
            mission.completed ? "text-emerald-400" : "text-zinc-500"
          )}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-white">{mission.title}</h3>
          <p className="mt-0.5 text-xs text-zinc-500">{mission.description}</p>
          <div className="mt-3 h-1.5 overflow-hidden border border-zinc-700/60 bg-zinc-900">
            <div
              className={cn(
                "h-full transition-all duration-500",
                mission.completed
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-emerald-700 to-cyan-600"
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between font-mono text-[10px]">
            <span className="text-zinc-500">
              {mission.progress}/{mission.target}
            </span>
            <span className="text-emerald-500">+{mission.xpReward} XP</span>
          </div>
        </div>
      </div>
    </article>
  );
}
