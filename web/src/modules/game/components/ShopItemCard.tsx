import { cn } from "@/lib/utils";
import { resolveShopItemIcon } from "@/modules/game/shopAvatars";
import { rarityClass } from "@/modules/game/styles/gameTokens";
import type { GameShopItem } from "@/services/gameApi";
import { Button } from "@/components/ui/button";

type ShopItemCardProps = {
  item: GameShopItem;
  balance: number;
  onPurchase: (item: GameShopItem) => void;
  onEquip: (item: GameShopItem) => void;
  busy?: boolean;
};

export function ShopItemCard({
  item,
  balance,
  onPurchase,
  onEquip,
  busy,
}: ShopItemCardProps) {
  const Icon = resolveShopItemIcon(item.type, item.icon);
  const rarity = rarityClass[item.rarity] ?? rarityClass.COMMON;
  const canAfford = balance >= item.price;

  return (
    <article
      className={cn(
        "relative flex flex-col border bg-background/80 p-4 transition-colors",
        item.equipped ? "border-violet-600/60" : "border-border",
        item.locked && !item.owned && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center border",
            rarity
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">{item.label}</h3>
            <span className={cn("font-mono text-xs uppercase", rarity)}>
              {item.rarity}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          <p className="mt-2 font-mono text-xs uppercase text-amber-900/90 dark:text-amber-400/90">
            {item.price} LC
          </p>
          {item.lockReason ? (
            <p className="mt-1 font-mono text-xs uppercase text-muted-foreground">
              {item.lockReason}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {item.equipped ? (
          <span className="font-mono text-xs uppercase text-violet-900 dark:text-violet-400">
            Equipado
          </span>
        ) : item.owned ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-violet-900/40 hover:border-violet-700/60"
            disabled={busy}
            onClick={() => onEquip(item)}
          >
            Equipar
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={busy || item.locked || !canAfford}
            onClick={() => onPurchase(item)}
          >
            {item.locked
              ? "Bloqueado"
              : !canAfford
                ? `Faltam ${item.price - balance} LC`
                : "Comprar"}
          </Button>
        )}
      </div>
    </article>
  );
}
