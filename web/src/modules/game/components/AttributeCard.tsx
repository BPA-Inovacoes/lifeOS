import type { GameAttribute } from "@/services/gameApi";
import { gameGlassClass, gameNeonTextClass, gamePanelClass, gameProgressBarClass } from "@/modules/game/styles/gameTokens";

type AttributeCardProps = {
  attribute: GameAttribute;
};

export function AttributeCard({ attribute }: AttributeCardProps) {
  return (
    <article className={`${gamePanelClass} ${gameGlassClass} p-4`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {attribute.label}
        </span>
        <div className="text-right">
          <span className={`font-mono text-sm ${gameNeonTextClass}`}>{attribute.value}</span>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {attribute.tier}
          </p>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden bg-card">
        <div
          className={`h-full transition-all duration-700 ${gameProgressBarClass}`}
          style={{ width: `${attribute.percent}%` }}
        />
      </div>
      <p className="mt-2 font-mono text-sm text-muted-foreground">
        {attribute.delta > 0 ? `+${attribute.delta} recente` : "sem delta recente"}
      </p>
    </article>
  );
}
