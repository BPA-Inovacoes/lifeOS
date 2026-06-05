import { ActivityFeed } from "@/modules/game/components/ActivityFeed";
import { GameBootGate } from "@/modules/game/components/GameBootGate";
import { GamePageShell } from "@/modules/game/components/GamePageShell";
import { GameSectionNav } from "@/modules/game/components/GameSectionNav";
import { EvolutionProgress } from "@/modules/game/components/EvolutionProgress";
import { MissionCard } from "@/modules/game/components/MissionCard";
import { PlayerProfileCard } from "@/modules/game/components/PlayerProfileCard";
import { PrestigeBadge } from "@/modules/game/components/PrestigeBadge";
import { RankCard } from "@/modules/game/components/RankCard";
import { StreakCard } from "@/modules/game/components/StreakCard";
import type { GameDashboard } from "@/services/gameApi";

export function GameProfilePage() {
  return (
    <GameBootGate loadingMessage="A carregar perfil de jogador">
      {({ userName, profile, data, prestige, isPrestiging }) => (
        <GamePageShell
          tag="// perfil"
          title="Perfil do jogador"
          description="A tua ficha de personagem — nível, rank, XP e evolução na vida real."
        >
          <ProfileContent
            data={data}
            userName={userName}
            onPrestige={profile.canPrestige ? prestige : undefined}
            prestigeLoading={isPrestiging}
          />
        </GamePageShell>
      )}
    </GameBootGate>
  );
}

function ProfileContent({
  data,
  userName,
  onPrestige,
  prestigeLoading,
}: {
  data: GameDashboard;
  userName?: string | null;
  onPrestige?: () => void;
  prestigeLoading: boolean;
}) {
  const dailyPreview = data.missions.slice(0, 3);
  const recentActivity = data.activityFeed.slice(0, 6);

  return (
    <div className="space-y-8">
      <PlayerProfileCard profile={data.profile} userName={userName} />

      <GameSectionNav />

      <div className="grid gap-4 lg:grid-cols-3">
        <EvolutionProgress profile={data.profile} />
        <RankCard profile={data.profile} />
        <PrestigeBadge
          profile={data.profile}
          onPrestige={onPrestige}
          loading={prestigeLoading}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <StreakCard current={data.profile.currentStreak} />
        <section className="border border-border bg-background/60 p-4 lg:col-span-2">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Missões de hoje
          </h2>
          {dailyPreview.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Sem missões activas. Conclui tarefas no Focus Mode para progredir.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {dailyPreview.map((mission) => (
                <MissionCard key={mission.key} mission={mission} />
              ))}
            </div>
          )}
        </section>
      </div>

      {recentActivity.length > 0 ? (
        <section>
          <h2 className="mb-4 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Actividade recente
          </h2>
          <ActivityFeed items={recentActivity} />
        </section>
      ) : null}
    </div>
  );
}
