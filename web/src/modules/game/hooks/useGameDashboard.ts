import { useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchGameDashboard } from "@/services/gameApi";

export function useGameDashboard() {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["game", "dashboard"],
    queryFn: async () => {
      const data = await fetchGameDashboard();
      queryClient.setQueryData(["game", "profile"], data.profile);
      return data;
    },
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });
}
