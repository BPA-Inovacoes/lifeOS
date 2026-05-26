import type { GameAttribute } from "@/services/gameApi";
import { gameGlassClass, gamePanelClass } from "@/modules/game/styles/gameTokens";

type AttributeCardProps = {
  attribute: GameAttribute;
};

export function AttributeCard({ attribute }: AttributeCardProps) {
  return (
    <article className={`${gamePanelClass} ${gameGlassClass} p-4`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {attribute.label}
        </span>
        <div className="text-right">
          <span className="font-mono text-sm text-emerald-400">{attribute.value}</span>
          <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
            {attribute.tier}
          </p>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden bg-zinc-900">
        <div
          className="h-full bg-gradient-to-r from-emerald-700 to-cyan-500 transition-all duration-700"
          style={{ width: `${attribute.percent}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-[10px] text-zinc-500">
        {attribute.delta > 0 ? `+${attribute.delta} recente` : "sem delta recente"}
      </p>
    </article>
  );
}
