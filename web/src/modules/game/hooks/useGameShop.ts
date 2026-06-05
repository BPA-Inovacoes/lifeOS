import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  equipShopItem,
  fetchGameShop,
  purchaseShopItem,
  type GameShopResponse,
} from "@/services/gameApi";

export const gameShopQueryKey = ["game", "shop"] as const;

export function useGameShop() {
  return useQuery({
    queryKey: gameShopQueryKey,
    queryFn: fetchGameShop,
  });
}

export function useShopMutations() {
  const qc = useQueryClient();

  const sync = (data: GameShopResponse) => {
    qc.setQueryData(gameShopQueryKey, data);
    void qc.invalidateQueries({ queryKey: ["game", "profile"], refetchType: "none" });
    void qc.invalidateQueries({ queryKey: ["game", "dashboard"], refetchType: "none" });
  };

  const purchase = useMutation({
    mutationFn: ({ itemId, equip }: { itemId: string; equip: boolean }) =>
      purchaseShopItem(itemId, equip),
    onSuccess: sync,
  });

  const equip = useMutation({
    mutationFn: (itemId: string) => equipShopItem(itemId),
    onSuccess: sync,
  });

  return { purchase, equip };
}
