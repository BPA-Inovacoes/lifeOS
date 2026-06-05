import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import {
  fetchGameProfile,
  prestigeGameMode,
  toggleGameMode,
  type GameDashboard,
} from "@/services/gameApi";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/store/toastStore";
import { useUiStore } from "@/store/uiStore";

export function useGameMode() {
  const token = useAuthStore((state) => state.token);
  const setGameModeEnabled = useUiStore((state) => state.setGameModeEnabled);
  const gameModeEnabled = useUiStore((state) => state.gameModeEnabled);
  const queryClient = useQueryClient();
  const dashboardCached = queryClient.getQueryData<GameDashboard>(["game", "dashboard"]);

  const profileQuery = useQuery({
    queryKey: ["game", "profile"],
    queryFn: fetchGameProfile,
    enabled: Boolean(token) && !dashboardCached,
    staleTime: 60_000,
    placeholderData: () => dashboardCached?.profile,
  });

  useEffect(() => {
    const profile = dashboardCached?.profile ?? profileQuery.data;
    if (profile) {
      setGameModeEnabled(profile.gameModeEnabled);
    }
  }, [dashboardCached?.profile, profileQuery.data, setGameModeEnabled]);

  const toggle = useMutation({
    mutationFn: toggleGameMode,
    onSuccess: (profile) => {
      setGameModeEnabled(profile.gameModeEnabled);
      queryClient.setQueryData(["game", "profile"], profile);
      queryClient.invalidateQueries({ queryKey: ["game", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["game"] });
      toast.success(profile.gameModeEnabled ? "Game Mode activado" : "Focus Mode activado");
    },
    onError: () => {
      toast.error("Não foi possível alterar o modo.");
    },
  });

  const prestige = useMutation({
    mutationFn: prestigeGameMode,
    onSuccess: (profile) => {
      if (!profile) return;
      setGameModeEnabled(profile.gameModeEnabled);
      queryClient.setQueryData(["game", "profile"], profile);
      queryClient.invalidateQueries({ queryKey: ["game"] });
      toast.success("Ascensão concluída.");
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Prestige indisponível.";
      toast.error(message);
    },
  });

  const profile = dashboardCached?.profile ?? profileQuery.data;

  return {
    gameModeEnabled,
    profile,
    isLoadingProfile: !profile && profileQuery.isLoading,
    isFetchingProfile: profileQuery.isFetching,
    toggleMode: (enabled: boolean) => toggle.mutate(enabled),
    prestige: () => prestige.mutate(),
    isToggling: toggle.isPending,
    isPrestiging: prestige.isPending,
  };
}
