import { User } from "lucide-react";

import type { GameProfile } from "@/services/gameApi";
import { LevelBadge } from "@/modules/game/components/LevelBadge";
import { XPBar } from "@/modules/game/components/XPBar";
import {
  gameAccentLineClass,
  gameNeonTextClass,
  gamePanelClass,
  gamePanelGlowClass,
} from "@/modules/game/styles/gameTokens";

type PlayerProfileCardProps = {
  profile: GameProfile;
  userName?: string | null;
};

export function PlayerProfileCard({ profile, userName }: PlayerProfileCardProps) {
  return (
    <section className={gamePanelClass}>
      <div className={gamePanelGlowClass} aria-hidden />
      <div className={gameAccentLineClass} aria-hidden />
      <div className="p-6">
        <div className="flex flex-wrap items-start gap-5">
          <div className="flex size-16 items-center justify-center border border-emerald-800/50 bg-zinc-900/80">
            <User className="size-8 text-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Player
            </p>
            <h2 className="text-xl font-semibold text-white">
              {userName ?? "Operador"}
            </h2>
            <div className="mt-2">
              <LevelBadge level={profile.level} rank={profile.rank} size="sm" />
            </div>
          </div>
          <div className="text-right">
            <p className={gameNeonTextClass}>
              <span className="text-2xl font-semibold">{profile.totalXp}</span>
              <span className="ml-1 text-xs text-zinc-500">XP total</span>
            </p>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              {profile.phase} · {profile.prestigeLabel}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <XPBar
            percent={profile.levelPercent}
            xpInLevel={profile.xpInLevel}
            xpNeeded={profile.xpNeeded}
          />
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Tarefas" value={profile.tasksCompleted} />
          <Stat label="Hábitos" value={profile.habitsCompleted} />
          <Stat label="Estudo (h)" value={profile.studyHours} />
          <Stat label="Objectivos" value={profile.goalsCompleted} />
        </dl>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <dt className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm text-white">{value}</dd>
    </div>
  );
}
