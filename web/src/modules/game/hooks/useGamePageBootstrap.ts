import { useGameDashboard } from "@/modules/game/hooks/useGameDashboard";
import { useGameMode } from "@/modules/game/hooks/useGameMode";
import { useAuthStore } from "@/store/authStore";

/** Perfil + dashboard partilhados pelas páginas do Game Mode. */
export function useGamePageBootstrap() {
  const userName = useAuthStore((s) => s.user?.name);
  const { prestige, isPrestiging } = useGameMode();
  const dashboard = useGameDashboard();

  return {
    userName,
    profile: dashboard.data?.profile,
    dashboard,
    booting: dashboard.isLoading && !dashboard.data,
    prestige,
    isPrestiging,
  };
}
