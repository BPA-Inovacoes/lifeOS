import type { GameProfile } from "@/services/gameApi";
import {
  gameGlassClass,
  gamePanelClass,
  gamePhaseGlow,
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
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Evolution
            </p>
            <h3 className="mt-1 text-lg font-medium text-white">{profile.phase}</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {profile.evolution.completedLevels}/{profile.evolution.totalLevels} níveis nesta
              phase
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs text-emerald-400">
              {profile.xpToNextLevel} XP
            </p>
            <p className="font-mono text-[10px] text-zinc-500">para o próximo nível</p>
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden border border-zinc-700/60 bg-zinc-900/80">
          <div
            className="h-full bg-gradient-to-r from-emerald-600 via-cyan-500 to-violet-500 transition-all duration-700"
            style={{ width: `${profile.evolution.percent}%` }}
          />
        </div>
      </div>
    </section>
  );
}
