import { Coins } from "lucide-react";
import { Link } from "react-router-dom";

import type { GameProfile } from "@/services/gameApi";
import { LevelBadge } from "@/modules/game/components/LevelBadge";
import { XPBar } from "@/modules/game/components/XPBar";
import { resolveShopAvatarIcon } from "@/modules/game/shopAvatars";
import { paths } from "@/routes/paths";
import {
  gameAccentLineClass,
  gameBorderAccentClass,
  gameIconAccentClass,
  gameNeonTextClass,
  gamePanelClass,
  gamePanelGlowClass,
} from "@/modules/game/styles/gameTokens";

type PlayerProfileCardProps = {
  profile: GameProfile;
  userName?: string | null;
};

export function PlayerProfileCard({ profile, userName }: PlayerProfileCardProps) {
  const AvatarIcon = resolveShopAvatarIcon(profile.avatarIcon);

  return (
    <section className={gamePanelClass}>
      <div className={gamePanelGlowClass} aria-hidden />
      <div className={gameAccentLineClass} aria-hidden />
      <div className="p-6">
        <div className="flex flex-wrap items-start gap-5">
          <div className={`flex size-16 items-center justify-center border bg-secondary/80 ${gameBorderAccentClass}`}>
            <AvatarIcon className={`size-8 ${gameIconAccentClass}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Player
            </p>
            <h2 className="text-xl font-semibold text-foreground">
              {userName ?? "Operador"}
            </h2>
            {profile.displayTitle ? (
              <p className="mt-1 font-mono text-sm text-violet-950 dark:text-violet-300/90">
                {profile.displayTitle}
              </p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <LevelBadge
                level={profile.level}
                rank={profile.rank}
                rankLabel={profile.rankLabel}
                size="sm"
              />
              <span className="font-mono text-xs uppercase tracking-wider text-violet-900/90 dark:text-violet-400/90">
                {profile.playerClassLabel}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className={gameNeonTextClass}>
              <span className="text-2xl font-semibold">{profile.totalXp}</span>
              <span className="ml-1 text-sm text-muted-foreground">XP total</span>
            </p>
            <p className="mt-2 flex items-center justify-end gap-1.5 font-mono text-xs uppercase tracking-wider text-amber-900/90 dark:text-amber-400/90">
              <Coins className="size-3.5" aria-hidden />
              <Link
                to={paths.game.shop}
                className="text-sm font-semibold text-amber-950 dark:text-amber-300 transition-colors hover:text-amber-200"
              >
                {profile.lifeCoins}
              </Link>
              <span className="text-muted-foreground">LifeCoins</span>
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">
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
    <div className="border border-border bg-secondary/40 px-3 py-2">
      <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm text-foreground">{value}</dd>
    </div>
  );
}
