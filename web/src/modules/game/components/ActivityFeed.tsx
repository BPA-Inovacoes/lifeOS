import { formatRelativeDate } from "@/utils/formatRelative";
import type { GameActivityItem } from "@/services/gameApi";
import {
  gameAccentLineClass,
  gamePanelClass,
  gamePanelGlowClass,
} from "@/modules/game/styles/gameTokens";

type ActivityFeedProps = {
  items: GameActivityItem[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section className={gamePanelClass}>
      <div className={gamePanelGlowClass} aria-hidden />
      <div className={gameAccentLineClass} aria-hidden />
      <div className="border-b border-zinc-800 px-4 py-4 md:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-600/80">
          // feed
        </p>
        <h2 className="mt-1 text-lg font-medium text-white">Actividade recente</h2>
      </div>
      <ul className="max-h-80 divide-y divide-zinc-800/80 overflow-y-auto">
        {items.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-zinc-600">
            Completa acções para ver o feed gaming.
          </li>
        ) : (
          items.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-zinc-900/40"
            >
              <div>
                <p className="text-zinc-300">{item.message}</p>
                <p className="mt-0.5 font-mono text-[10px] text-zinc-600">
                  {formatRelativeDate(item.createdAt)}
                </p>
              </div>
              {item.xpDelta > 0 ? (
                <span className="shrink-0 font-mono text-xs text-emerald-400">
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

