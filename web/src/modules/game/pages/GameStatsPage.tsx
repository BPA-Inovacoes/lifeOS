import { ActivityFeed } from "@/modules/game/components/ActivityFeed";
import { AttributeCard } from "@/modules/game/components/AttributeCard";
import { GameBootGate } from "@/modules/game/components/GameBootGate";
import { GamePageShell } from "@/modules/game/components/GamePageShell";
import { HeatmapCalendar } from "@/modules/game/components/HeatmapCalendar";
import { StatsRadarChart } from "@/modules/game/components/StatsRadarChart";
import { WeeklyProgressCard } from "@/modules/game/components/WeeklyProgressCard";
import { XpDistributionCard } from "@/modules/game/components/XpDistributionCard";

export function GameStatsPage() {
  return (
    <GameBootGate loadingMessage="A carregar estatísticas">
      {({ data }) => (
        <GamePageShell
          tag="// stats"
          title="Estatísticas"
          description="Atributos, distribuição de XP, heatmap e feed de actividade."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <WeeklyProgressCard days={data.weeklyXp} />
            </div>
            <XpDistributionCard distribution={data.xpDistribution} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
            <StatsRadarChart attributes={data.attributes} />
            <HeatmapCalendar cells={data.heatmap} className="h-full" />
          </div>

          <section>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Atributos
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              7 eixos de vida — Conhecimento, Finanças, Liderança, Disciplina,
              Relacionamentos, Espiritualidade, Saúde.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {data.attributes.map((attribute) => (
                <AttributeCard key={attribute.key} attribute={attribute} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Feed de actividade
            </h2>
            <ActivityFeed items={data.activityFeed} />
          </section>
        </GamePageShell>
      )}
    </GameBootGate>
  );
}
