import { Crown } from "lucide-react";

import type { GameProfile } from "@/services/gameApi";
import { gameGlassClass, gamePanelClass } from "@/modules/game/styles/gameTokens";

type PrestigeBadgeProps = {
  profile: GameProfile;
  onPrestige?: () => void;
  loading?: boolean;
};

export function PrestigeBadge({
  profile,
  onPrestige,
  loading = false,
}: PrestigeBadgeProps) {
  return (
    <section className={`${gamePanelClass} ${gameGlassClass} p-4`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Prestige
          </p>
          <h3 className="mt-1 text-lg font-medium text-foreground">
            {profile.prestigeLabel}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Ascensões: {profile.ascensionCount}
          </p>
        </div>
        <div className="flex size-10 items-center justify-center border border-amber-700/40 bg-amber-950/20">
          <Crown className="size-5 text-amber-900 dark:text-amber-400" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {profile.canPrestige
            ? "Nível 100 atingido. Podes reiniciar a run e manter a tua identidade."
            : "Disponível quando atingires o nível 100."}
        </p>
        {onPrestige ? (
          <button
            type="button"
            disabled={!profile.canPrestige || loading}
            onClick={onPrestige}
            className="border border-border px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-foreground disabled:cursor-not-allowed disabled:text-muted-foreground"
          >
            {loading ? "A ascender..." : "Ascender"}
          </button>
        ) : null}
      </div>
    </section>
  );
}
