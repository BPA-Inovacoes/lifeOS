import { Crown, Swords } from "lucide-react";
import { Link } from "react-router-dom";

import { GameBootGate } from "@/modules/game/components/GameBootGate";
import { GamePageShell } from "@/modules/game/components/GamePageShell";
import { gameFocusBridgeLinkClass, gamePanelClass, gameXpTextClass } from "@/modules/game/styles/gameTokens";
import { paths } from "@/routes/paths";
import type { GameChallenge } from "@/services/gameApi";

export function GameDungeonsPage() {
  return (
    <GameBootGate loadingMessage="A carregar desafios">
      {({ data }) => {
        const dungeons = data.challenges.filter((c) => c.type === "dungeon");
        const bosses = data.challenges.filter((c) => c.type === "boss");

        return (
          <GamePageShell
            tag="// dungeons"
            title="Dungeons & Bosses"
            description="Objectivos activos do Focus Mode — base Objetivos (GOALS)."
          >
            {data.challenges.length === 0 ? (
              <p className="border border-border bg-background/60 px-4 py-6 text-sm text-muted-foreground">
                Sem desafios activos. Cria objectivos na base{" "}
                <strong className="text-muted-foreground">Objetivos</strong> no Focus Mode —
                prioridade Alta classifica como Boss.
              </p>
            ) : null}

            <ChallengeSection
              icon={Swords}
              title="Dungeons"
              hint="Projectos em progresso"
              items={dungeons}
            />
            <ChallengeSection
              icon={Crown}
              title="Bosses"
              hint="Metas de alto impacto"
              items={bosses}
            />
          </GamePageShell>
        );
      }}
    </GameBootGate>
  );
}

function ChallengeSection({
  icon: Icon,
  title,
  hint,
  items,
}: {
  icon: typeof Swords;
  title: string;
  hint: string;
  items: GameChallenge[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-violet-900/90 dark:text-violet-400/90" />
        <div>
          <h2 className="text-lg font-medium text-foreground">{title}</h2>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {hint}
          </p>
        </div>
      </div>
      <ul className="grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <li key={item.id} className={gamePanelClass}>
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium text-foreground">{item.title}</p>
                <span className={`shrink-0 font-mono text-xs uppercase ${gameXpTextClass}`}>
                  +{item.xpReward.toLocaleString("pt-PT")} XP
                </span>
              </div>
            </div>
            <div className="space-y-3 px-4 py-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{item.status}</span>
                <span>{item.progress}%</span>
              </div>
              <div className="h-1 overflow-hidden bg-muted">
                <div
                  className="h-full bg-violet-600 transition-all"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
              <Link
                to={paths.focus.database(item.workspaceId, item.databaseId)}
                className={gameFocusBridgeLinkClass}
              >
                Abrir no Focus Mode →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
