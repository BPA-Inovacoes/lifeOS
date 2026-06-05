import { formatRelativeDate } from "@/utils/formatRelative";
import type { GameActivityItem } from "@/services/gameApi";
import {
  gameAccentLineClass,
  gamePanelClass,
  gamePanelGlowClass,
  gameSectionLabelClass,
  gameXpTextClass,
} from "@/modules/game/styles/gameTokens";

type ActivityFeedProps = {
  items: GameActivityItem[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section className={gamePanelClass}>
      <div className={gamePanelGlowClass} aria-hidden />
      <div className={gameAccentLineClass} aria-hidden />
      <div className="border-b border-border px-4 py-4 md:px-6">
        <p className={gameSectionLabelClass}>
          // feed
        </p>
        <h2 className="mt-1 text-lg font-medium text-foreground">Actividade recente</h2>
      </div>
      <ul className="max-h-80 divide-y divide-zinc-800/80 overflow-y-auto">
        {items.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Completa acções para ver o feed gaming.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary/40"
            >
              <div>
                <p className="text-foreground">{item.message}</p>
                <p className="mt-0.5 font-mono text-sm text-muted-foreground">
                  {formatRelativeDate(item.createdAt)}
                </p>
              </div>
              {item.xpDelta > 0 ? (
                <span className={`shrink-0 font-mono text-xs ${gameXpTextClass}`}>
                  +{item.xpDelta}
                </span>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}

