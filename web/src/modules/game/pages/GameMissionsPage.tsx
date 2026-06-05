import { CalendarDays, CalendarRange, Target } from "lucide-react";

import { GameBootGate } from "@/modules/game/components/GameBootGate";
import { GamePageShell } from "@/modules/game/components/GamePageShell";
import { MissionCard } from "@/modules/game/components/MissionCard";
import { gamePanelClass } from "@/modules/game/styles/gameTokens";
import type { GameMission } from "@/services/gameApi";

export function GameMissionsPage() {
  return (
    <GameBootGate loadingMessage="A carregar missões">
      {({ data }) => (
        <GamePageShell
          tag="// missões"
          title="Missões"
          description="Objectivos com recompensa — diárias, semanais e mensais."
        >
          <MissionSection
            icon={Target}
            title="Missões diárias"
            subtitle="Renovam à meia-noite"
            missions={data.missionsDaily}
          />
          <MissionSection
            icon={CalendarDays}
            title="Missões semanais"
            subtitle="Reset à segunda-feira"
            missions={data.missionsWeekly}
          />
          <MissionSection
            icon={CalendarRange}
            title="Missões mensais"
            subtitle="Reset no dia 1"
            missions={data.missionsMonthly}
          />
        </GamePageShell>
      )}
    </GameBootGate>
  );
}

function MissionSection({
  icon: Icon,
  title,
  subtitle,
  missions,
}: {
  icon: typeof Target;
  title: string;
  subtitle: string;
  missions: GameMission[];
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="size-5 text-violet-900/90 dark:text-violet-400/90" />
        <div>
          <h2 className="text-lg font-medium text-foreground">{title}</h2>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {subtitle}
          </p>
        </div>
      </div>
      <div className={`${gamePanelClass} p-4 md:p-6`}>
        {missions.length === 0 ? (
          <EmptyHint />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {missions.map((mission) => (
              <MissionCard key={mission.key} mission={mission} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyHint() {
  return (
    <p className="text-sm text-muted-foreground">
      Sem missões activas. Actividade no Focus Mode gera progresso automático.
    </p>
  );
}
