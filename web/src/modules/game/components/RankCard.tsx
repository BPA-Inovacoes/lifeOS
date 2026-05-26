import type { GameProfile } from "@/services/gameApi";
import { gameGlassClass, gamePanelClass } from "@/modules/game/styles/gameTokens";

type RankCardProps = {
  profile: GameProfile;
};

export function RankCard({ profile }: RankCardProps) {
  return (
    <section className={`${gamePanelClass} ${gameGlassClass} p-4`}>
      <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
        Rank
      </p>
      <h3 className="mt-1 text-lg font-medium text-white">{profile.rank}</h3>
      <p className="mt-1 text-xs text-zinc-500">
        {profile.phase} · consistência {profile.consistencyRate}%
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
    <div className="border border-zinc-800 bg-zinc-950/60 px-2 py-2">
      <dt className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-zinc-100">{value}</dd>
    </div>
  );
}
