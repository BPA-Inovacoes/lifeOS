import { useQuery } from "@tanstack/react-query";

import { LifeOSLoading } from "@/components/LifeOSLoading";
import { QueryErrorPanel } from "@/components/QueryErrorPanel";
import { AchievementCard } from "@/modules/game/components/AchievementCard";
import { ActivityFeed } from "@/modules/game/components/ActivityFeed";
import { AttributeCard } from "@/modules/game/components/AttributeCard";
import { EvolutionProgress } from "@/modules/game/components/EvolutionProgress";
import { GameDashboardSkeleton } from "@/modules/game/components/GameDashboardSkeleton";
import { GameModeLanding } from "@/modules/game/components/GameModeLanding";
import { GameModeToggle } from "@/modules/game/components/GameModeToggle";
import { HeatmapCalendar } from "@/modules/game/components/HeatmapCalendar";
import { MissionCard } from "@/modules/game/components/MissionCard";
import { PlayerProfileCard } from "@/modules/game/components/PlayerProfileCard";
import { PrestigeBadge } from "@/modules/game/components/PrestigeBadge";
import { RankCard } from "@/modules/game/components/RankCard";
import { StatsRadarChart } from "@/modules/game/components/StatsRadarChart";
import { StreakCard } from "@/modules/game/components/StreakCard";
import { WeeklyProgressCard } from "@/modules/game/components/WeeklyProgressCard";
import { XpDistributionCard } from "@/modules/game/components/XpDistributionCard";
import { useGameMode } from "@/modules/game/hooks/useGameMode";
import { fetchGameDashboard, type GameDashboard } from "@/services/gameApi";
import { useAuthStore } from "@/store/authStore";
import { sectionLabelClass } from "@/styles/designTokens";
import { formatRelativeDate } from "@/utils/formatRelative";

export function GameDashboardPage() {
  const userName = useAuthStore((state) => state.user?.name);
  const {
    gameModeEnabled,
    profile,
    isLoadingProfile,
    isFetchingProfile,
    toggleMode,
    prestige,
    isToggling,
    isPrestiging,
  } = useGameMode();

  const dashboard = useQuery({
    queryKey: ["game", "dashboard"],
    queryFn: fetchGameDashboard,
    enabled: gameModeEnabled,
    staleTime: 60_000,
  });

  const showActivationLoader =
    isToggling && gameModeEnabled && (dashboard.isLoading || dashboard.isFetching);

  if (isLoadingProfile || (isFetchingProfile && !profile)) {
    return (
      <LifeOSLoading
        fullScreen
        size="lg"
        message="A sincronizar command center"
        rotatingMessages={[
          "A carregar perfil de jogador...",
          "A alinhar progressão e phases...",
          "A montar feed, missões e stats...",
        ]}
      />
    );
  }

  if (showActivationLoader) {
    return (
      <LifeOSLoading
        fullScreen
        size="lg"
        message="A activar Game Mode"
        rotatingMessages={[
          "A preparar o Command Center...",
          "A sincronizar missões diárias...",
          "A aplicar tema LifeOS premium...",
        ]}
      />
    );
  }

  if (!profile || !gameModeEnabled) {
    return (
      <GameModeLanding loading={isToggling} onEnable={() => toggleMode(true)} />
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <p className={sectionLabelClass}>// game mode</p>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Command Center
          </h1>
          <p className="mt-1 max-w-xl text-sm text-zinc-500">
            Progressão, evolução e retrospetiva premium sobre o teu LifeOS.
          </p>
        </div>
        <GameModeToggle
          enabled={gameModeEnabled}
          loading={isToggling}
          onChange={toggleMode}
        />
      </header>

      {dashboard.isLoading ? (
        <GameDashboardSkeleton />
      ) : dashboard.isError ? (
        <QueryErrorPanel
          title="Game Mode indisponível"
          message="Não foi possível carregar o dashboard gaming."
          onRetry={() => dashboard.refetch()}
        />
      ) : dashboard.data ? (
        <DashboardContent
          data={dashboard.data}
          userName={userName}
          onPrestige={profile.canPrestige ? prestige : undefined}
          prestigeLoading={isPrestiging}
        />
      ) : null}
    </div>
  );
}

function DashboardContent({
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
  return (
    <div className="space-y-8">
      <PlayerProfileCard profile={data.profile} userName={userName} />

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
        <div className="lg:col-span-2">
          <WeeklyProgressCard days={data.weeklyXp} />
        </div>
        <StreakCard current={data.profile.currentStreak} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StatsRadarChart attributes={data.attributes} />
        <XpDistributionCard distribution={data.xpDistribution} />
      </div>

      <HeatmapCalendar cells={data.heatmap} />

      <section>
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Missões diárias
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.missions.map((mission) => (
            <MissionCard key={mission.key} mission={mission} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          Atributos
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          {data.attributes.map((attribute) => (
            <AttributeCard key={attribute.key} attribute={attribute} />
          ))}
        </div>
      </section>

      {data.prestigeHistory.length > 0 ? (
        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Histórico de ascensão
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {data.prestigeHistory.map((item) => (
              <article
                key={item.id}
                className="border border-zinc-800 bg-zinc-950/60 px-4 py-3"
              >
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                  Prestige {item.prestigeLevel}
                </p>
                <p className="mt-1 text-sm text-zinc-300">
                  {formatRelativeDate(item.createdAt)}
                </p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            Conquistas
          </h2>
          <div className="grid gap-3">
            {data.achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </section>
        <ActivityFeed items={data.activityFeed} />
      </div>
    </div>
  );
}
