import type { GameProfile } from "@/services/gameApi";
import {
  gameGlassClass,
  gamePanelClass,
  gamePhaseGlow,
  gameProgressBarClass,
  gameXpTextClass,
} from "@/modules/game/styles/gameTokens";

type EvolutionProgressProps = {
  profile: GameProfile;
};

export function EvolutionProgress({ profile }: EvolutionProgressProps) {
  const phaseGlow = gamePhaseGlow(profile.phaseTheme);

  return (
    <section className={`${gamePanelClass} ${gameGlassClass} overflow-hidden`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${phaseGlow}`} />
      <div className="relative p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Evolution
            </p>
            <h3 className="mt-1 text-lg font-medium text-foreground">{profile.phase}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.evolution.completedLevels}/{profile.evolution.totalLevels} níveis nesta
              phase
            </p>
          </div>
          <div className="text-right">
            <p className={`font-mono text-xs ${gameXpTextClass}`}>
              {profile.xpToNextLevel} XP
            </p>
            <p className="font-mono text-sm text-muted-foreground">para o próximo nível</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden border border-border/60 bg-secondary/80">
          <div
            className={`h-full transition-all duration-700 ${gameProgressBarClass}`}
            style={{ width: `${profile.evolution.percent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
