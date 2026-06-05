import { Flame } from "lucide-react";

import { AchievementCard } from "@/modules/game/components/AchievementCard";
import { GameBootGate } from "@/modules/game/components/GameBootGate";
import { GamePageShell } from "@/modules/game/components/GamePageShell";
import { StreakCard } from "@/modules/game/components/StreakCard";
import { gameMilestoneReachedClass, gamePanelClass } from "@/modules/game/styles/gameTokens";

const STREAK_MILESTONES = [
  { days: 7, label: "Uma semana de fogo" },
  { days: 30, label: "Mês de consistência" },
  { days: 100, label: "Centurião" },
  { days: 365, label: "Lendário anual" },
];

export function GameAchievementsPage() {
  return (
    <GameBootGate loadingMessage="A carregar conquistas">
      {({ data }) => (
        <GamePageShell
          tag="// conquistas"
          title="Conquistas"
          description="Badges desbloqueadas pela tua actividade real no LifeOS."
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <StreakCard current={data.profile.currentStreak} />
            <section className={`${gamePanelClass} p-4 lg:col-span-2`}>
              <h2 className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                <Flame className="size-3.5 text-orange-400" />
                Marcos de sequência
              </h2>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {STREAK_MILESTONES.map(({ days, label }) => {
                  const reached = data.profile.currentStreak >= days;
                  return (
                    <li
                      key={days}
                      className={`border px-3 py-2 ${
                        reached ? gameMilestoneReachedClass : "border-border text-muted-foreground"
                      }`}
                    >
                      <span className="font-mono text-xs uppercase">
                        {days}d · {label}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <section>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Todas as conquistas
            </h2>
            {data.achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda sem conquistas. Continua a executar no Focus Mode.
              </p>
            ) : (
              <div className="grid gap-3">
                {data.achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </section>
        </GamePageShell>
      )}
    </GameBootGate>
  );
}
