import { Link } from "react-router-dom";

import { LevelBadge } from "@/modules/game/components/LevelBadge";
import { XPBar } from "@/modules/game/components/XPBar";
import type { GameProfile } from "@/services/gameApi";
import { paths } from "@/routes/paths";
import { gameGlassClass, gameHudBorderClass } from "@/modules/game/styles/gameTokens";

type GameHudProps = {
  profile: GameProfile;
};

export function GameHud({ profile }: GameHudProps) {
  return (
    <Link
      to={paths.game.home}
      className={`hidden items-center gap-3 border px-3 py-1.5 sm:flex ${gameGlassClass} ${gameHudBorderClass}`}
    >
      <LevelBadge level={profile.level} rank={profile.rank} rankLabel={profile.rankLabel} size="sm" />
      <div className="w-24">
        <XPBar
          compact
          percent={profile.levelPercent}
          xpInLevel={profile.xpInLevel}
          xpNeeded={profile.xpNeeded}
        />
      </div>
      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {profile.prestigeLabel}
      </span>
    </Link>
  );
}
