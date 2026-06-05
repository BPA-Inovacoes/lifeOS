import { Flame } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  gameAccentLineClass,
  gameNeonTextClass,
  gamePanelClass,
  gamePanelGlowClass,
} from "@/modules/game/styles/gameTokens";

type StreakCardProps = {
  current: number;
};

export function StreakCard({ current }: StreakCardProps) {
  return (
    <section className={gamePanelClass}>
      <div className={gamePanelGlowClass} aria-hidden />
      <div className={gameAccentLineClass} aria-hidden />
      <div className="flex items-center gap-4 p-5">
        <div className="flex size-14 items-center justify-center border border-orange-800/50 bg-orange-950/30">
          <Flame className="size-7 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Streak activo
          </p>
          <p>
            <span className="text-3xl font-semibold text-foreground">{current}</span>
            <span className={cn("ml-1 text-sm", gameNeonTextClass)}>dias</span>
          </p>
        </div>
      </div>
    </section>
  );
}

