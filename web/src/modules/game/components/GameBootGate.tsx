import type { ReactNode } from "react";

import { LifeOSLoading } from "@/components/LifeOSLoading";
import { QueryErrorPanel } from "@/components/QueryErrorPanel";
import { useGamePageBootstrap } from "@/modules/game/hooks/useGamePageBootstrap";
import type { GameDashboard, GameProfile } from "@/services/gameApi";

type GameBootGateProps = {
  loadingMessage?: string;
  children: (ctx: {
    userName?: string | null;
    profile: GameProfile;
    data: GameDashboard;
    prestige: () => void;
    isPrestiging: boolean;
  }) => ReactNode;
};

export function GameBootGate({
  loadingMessage = "A sincronizar command center",
  children,
}: GameBootGateProps) {
  const { userName, dashboard, booting, prestige, isPrestiging } =
    useGamePageBootstrap();

  if (booting) {
    return (
      <LifeOSLoading
        fullScreen
        size="lg"
        variant="game"
        message={loadingMessage}
        rotatingMessages={[
          "A carregar perfil de jogador...",
          "A alinhar atributos e missões...",
          "A preparar interface RPG...",
        ]}
      />
    );
  }

  const profile = dashboard.data?.profile;
  if (dashboard.isError || !dashboard.data || !profile) {
    return (
      <div className="p-10">
        <QueryErrorPanel
          title="Game Mode indisponível"
          message="Não foi possível carregar os dados de progressão."
          onRetry={() => dashboard.refetch()}
        />
      </div>
    );
  }

  return (
    <>
      {children({
        userName,
        profile,
        data: dashboard.data,
        prestige,
        isPrestiging,
      })}
    </>
  );
}
