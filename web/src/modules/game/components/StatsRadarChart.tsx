import type { GameAttribute } from "@/services/gameApi";
import {
  gameAccentLineClass,
  gamePanelClass,
  gamePanelGlowClass,
  gameSectionLabelClass,
} from "@/modules/game/styles/gameTokens";

type StatsRadarChartProps = {
  attributes: GameAttribute[];
};

export function StatsRadarChart({ attributes }: StatsRadarChartProps) {
  if (attributes.length === 0) return null;

  const cx = 120;
  const cy = 120;
  const maxR = 80;
  const count = attributes.length;

  const points = attributes.map((attr, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const r = (attr.percent / 100) * maxR;
    return {
      x: cx + Math.cos(angle) * r,
      y: cy + Math.sin(angle) * r,
      labelX: cx + Math.cos(angle) * (maxR + 28),
      labelY: cy + Math.sin(angle) * (maxR + 28),
      label: attr.label,
      value: attr.value,
    };
  });

  const polygon = points.map((p) => `${p.x},${p.y}`).join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <section className={gamePanelClass}>
      <div className={gamePanelGlowClass} aria-hidden />
      <div className={gameAccentLineClass} aria-hidden />
      <div className="border-b border-border px-4 py-4 md:px-6">
        <p className={gameSectionLabelClass}>
          // atributos
        </p>
        <h2 className="mt-1 text-lg font-medium text-foreground">Perfil de execução</h2>
      </div>
      <div className="flex justify-center p-6">
        <svg viewBox="0 0 240 240" className="h-56 w-56 max-w-full">
          {gridLevels.map((level) => {
            const gridPoints = attributes
              .map((_, i) => {
                const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
                const r = maxR * level;
                return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
              })
              .join(" ");
            return (
              <polygon
                key={level}
                points={gridPoints}
                fill="none"
                stroke="rgb(63 63 70 / 0.5)"
                strokeWidth="1"
              />
            );
          })}
          <polygon
            points={polygon}
            fill="rgb(139 92 246 / 0.25)"
            stroke="rgb(167 139 250)"
            strokeWidth="2"
          />
          {points.map((p) => (
            <g key={p.label}>
              <circle cx={p.x} cy={p.y} r="3" fill="rgb(167 139 250)" />
              <text
                x={p.labelX}
                y={p.labelY}
                textAnchor="middle"
                className="fill-zinc-500 text-[8px] font-mono uppercase"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

