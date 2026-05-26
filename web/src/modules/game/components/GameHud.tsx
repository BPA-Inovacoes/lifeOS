import { Link } from "react-router-dom";

import { LevelBadge } from "@/modules/game/components/LevelBadge";
import { XPBar } from "@/modules/game/components/XPBar";
import type { GameProfile } from "@/services/gameApi";
import { gameGlassClass } from "@/modules/game/styles/gameTokens";

type GameHudProps = {
  profile: GameProfile;
};

export function GameHud({ profile }: GameHudProps) {
  return (
    <Link
      to="/game"
      className={`hidden items-center gap-3 border border-emerald-900/40 px-3 py-1.5 transition-colors hover:border-emerald-700/60 sm:flex ${gameGlassClass}`}
    >
      <LevelBadge level={profile.level} rank={profile.rank} size="sm" />
      <div className="w-24">
        <XPBar
          compact
          percent={profile.levelPercent}
          xpInLevel={profile.xpInLevel}
          xpNeeded={profile.xpNeeded}
        />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        {profile.prestigeLabel}
      </span>
    </Link>
  );
}
