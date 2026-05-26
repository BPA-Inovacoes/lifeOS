import {
  gameAccentLineClass,
  gamePanelClass,
  gamePanelGlowClass,
} from "@/modules/game/styles/gameTokens";
import type { GameDashboard } from "@/services/gameApi";

type XpDistributionCardProps = {
  distribution: GameDashboard["xpDistribution"];
};

export function XpDistributionCard({ distribution }: XpDistributionCardProps) {
  const total =
    distribution.tasks +
    distribution.habits +
    distribution.goals +
    distribution.studies;

  const items = [
    { label: "Tarefas", value: distribution.tasks, color: "bg-emerald-500" },
    { label: "Hábitos", value: distribution.habits, color: "bg-cyan-500" },
    { label: "Objectivos", value: distribution.goals, color: "bg-violet-500" },
    { label: "Estudos", value: distribution.studies, color: "bg-amber-500" },
  ];

  return (
    <section className={gamePanelClass}>
      <div className={gamePanelGlowClass} aria-hidden />
      <div className={gameAccentLineClass} aria-hidden />
      <div className="border-b border-zinc-800 px-4 py-4 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-600/80">
          // distribuição
        </p>
        <h2 className="mt-1 text-lg font-medium text-white">Origem do XP</h2>
      </div>
      <div className="space-y-4 p-4 md:p-6">
        <div className="flex h-3 overflow-hidden border border-zinc-800 bg-zinc-900">
          {items.map((item) => {
            const w = total > 0 ? (item.value / total) * 100 : 0;
            if (w <= 0) return null;
            return (
              <div
                key={item.label}
                className={`${item.color} transition-all duration-700`}
                style={{ width: `${w}%` }}
                title={`${item.label}: ${item.value}`}
              />
            );
          })}
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <li
              key={item.label}
              className="flex items-center justify-between border border-zinc-800/80 px-3 py-2 font-mono text-[10px]"
            >
              <span className="flex items-center gap-2 text-zinc-500">
                <span className={`size-2 ${item.color}`} />
                {item.label}
              </span>
              <span className="text-zinc-300">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

