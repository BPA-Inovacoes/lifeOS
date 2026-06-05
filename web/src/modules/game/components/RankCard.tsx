import type { GameProfile } from "@/services/gameApi";
import { gameGlassClass, gamePanelClass } from "@/modules/game/styles/gameTokens";

type RankCardProps = {
  profile: GameProfile;
};

export function RankCard({ profile }: RankCardProps) {
  return (
    <section className={`${gamePanelClass} ${gameGlassClass} p-4`}>
      <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        Rank
      </p>
      <h3 className="mt-1 text-lg font-medium text-foreground">
        {profile.rank}
        {profile.rankLabel ? (
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {profile.rankLabel}
          </span>
        ) : null}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {profile.playerClassLabel} · {profile.phase} · consistência{" "}
        {profile.consistencyRate}%
      </p>

      <dl className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="Dias" value={profile.activeDays} />
        <Metric label="Deep Work" value={profile.deepWorkDays} />
        <Metric label="Perfect" value={profile.perfectWeeks} />
      </dl>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-border bg-background/60 px-2 py-2">
      <dt className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-foreground">{value}</dd>
    </div>
  );
}
