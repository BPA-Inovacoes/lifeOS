import { Coins } from "lucide-react";
import { useMemo, useState } from "react";

import { LifeOSLoading } from "@/components/LifeOSLoading";
import { QueryErrorPanel } from "@/components/QueryErrorPanel";
import { GameBootGate } from "@/modules/game/components/GameBootGate";
import { GamePageShell } from "@/modules/game/components/GamePageShell";
import { ShopItemCard } from "@/modules/game/components/ShopItemCard";
import { ShopPurchaseDialog } from "@/modules/game/components/ShopPurchaseDialog";
import { useGameShop, useShopMutations } from "@/modules/game/hooks/useGameShop";
import type { GameShopItem } from "@/services/gameApi";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

type ShopTab = "all" | "TITLE" | "AVATAR" | "inventory";

const TABS: { id: ShopTab; label: string }[] = [
  { id: "all", label: "Tudo" },
  { id: "TITLE", label: "Títulos" },
  { id: "AVATAR", label: "Avatars" },
  { id: "inventory", label: "Inventário" },
];

export function GameShopPage() {
  return (
    <GameBootGate loadingMessage="A abrir a loja">
      {() => <GameShopContent />}
    </GameBootGate>
  );
}

function GameShopContent() {
  const { data, isLoading, isError, refetch } = useGameShop();
  const { purchase, equip } = useShopMutations();
  const [tab, setTab] = useState<ShopTab>("all");
  const [pending, setPending] = useState<GameShopItem | null>(null);

  const items = useMemo(() => {
    if (!data) return [];
    if (tab === "inventory") return data.items.filter((item) => item.owned);
    if (tab === "all") return data.items;
    return data.items.filter((item) => item.type === tab);
  }, [data, tab]);

  if (isLoading) {
    return (
      <div className="p-10">
        <LifeOSLoading variant="game" message="A carregar loja" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-10">
        <QueryErrorPanel
          title="Loja indisponível"
          message="Não foi possível carregar o catálogo."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const busy = purchase.isPending || equip.isPending;

  const confirmPurchase = async (equipNow: boolean) => {
    if (!pending) return;
    try {
      await purchase.mutateAsync({ itemId: pending.id, equip: equipNow });
      toast.rpg(
        equipNow
          ? `${pending.label} comprado e equipado`
          : `${pending.label} guardado no inventário`
      );
      setPending(null);
    } catch {
      toast.error("Não foi possível concluir a compra.");
    }
  };

  const handleEquip = async (item: GameShopItem) => {
    try {
      await equip.mutateAsync(item.id);
      toast.rpg(`${item.label} equipado`);
    } catch {
      toast.error("Não foi possível equipar este item.");
    }
  };

  return (
    <GamePageShell
      tag="// loja"
      title="Loja LifeCoins"
      description="Gasta moedas ganhas com actividade real. Compra e escolhe equipar agora ou guardar no inventário."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border border-violet-900/30 bg-violet-950/20 px-4 py-3">
        <div className="flex items-center gap-2">
          <Coins className="size-5 text-amber-900 dark:text-amber-400" />
          <div>
            <p className="font-mono text-xs uppercase text-muted-foreground">Saldo</p>
            <p className="text-lg font-semibold text-amber-950 dark:text-amber-300">
              {data.balance.lifeCoins}{" "}
              <span className="text-sm font-normal text-muted-foreground">LC</span>
            </p>
          </div>
        </div>
        <p className="font-mono text-xs uppercase text-muted-foreground">
          Total ganho: {data.balance.lifetimeCoins} LC
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className={cn(
              "border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
              tab === id
                ? "border-violet-600 bg-card text-violet-900 dark:text-violet-400"
                : "border-border text-muted-foreground hover:border-border hover:text-foreground"
            )}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="border border-border bg-background/60 px-4 py-8 text-center text-sm text-muted-foreground">
          {tab === "inventory"
            ? "Inventário vazio — compra itens na loja."
            : "Sem itens nesta categoria."}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ShopItemCard
              key={item.id}
              item={item}
              balance={data.balance.lifeCoins}
              busy={busy}
              onPurchase={setPending}
              onEquip={handleEquip}
            />
          ))}
        </div>
      )}

      <ShopPurchaseDialog
        item={pending}
        open={pending !== null}
        loading={purchase.isPending}
        onClose={() => setPending(null)}
        onPurchase={(equipNow) => void confirmPurchase(equipNow)}
      />
    </GamePageShell>
  );
}
