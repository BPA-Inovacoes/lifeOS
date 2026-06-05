import {
  BookOpen,
  CheckCircle2,
  Flame,
  Repeat,
  Sparkles,
  Target,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  gameGlassClass,
  gamePanelClass,
  gameXpTextClass,
  rarityClass,
} from "@/modules/game/styles/gameTokens";
import type { GameAchievement } from "@/services/gameApi";

const ICONS: Record<string, LucideIcon> = {
  flame: Flame,
  "check-circle": CheckCircle2,
  "book-open": BookOpen,
  sparkles: Sparkles,
  target: Target,
  zap: Zap,
  repeat: Repeat,
};

type AchievementCardProps = {
  achievement: GameAchievement;
};

export function AchievementCard({ achievement }: AchievementCardProps) {
  const Icon = ICONS[achievement.icon] ?? Sparkles;
  const rarity = rarityClass[achievement.rarity] ?? rarityClass.COMMON;

  return (
    <article
      className={cn(
        gamePanelClass,
        gameGlassClass,
        "p-4 transition-all duration-200",
        achievement.unlocked ? "border-violet-800/40" : "opacity-50 grayscale"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center border",
            rarity
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">{achievement.name}</h3>
            <span
              className={cn(
                "font-mono text-xs uppercase tracking-wider",
                rarity
              )}
            >
              {achievement.rarity}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{achievement.description}</p>
          <p className={`mt-2 font-mono text-xs ${gameXpTextClass}`}>
            +{achievement.xpReward} XP
          </p>
        </div>
      </div>
    </article>
  );
}

