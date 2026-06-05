import { AppModal } from "@/components/AppModal";
import { Button } from "@/components/ui/button";
import { resolveShopItemIcon } from "@/modules/game/shopAvatars";
import type { GameShopItem } from "@/services/gameApi";

type ShopPurchaseDialogProps = {
  item: GameShopItem | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onPurchase: (equip: boolean) => void;
};

export function ShopPurchaseDialog({
  item,
  open,
  loading,
  onClose,
  onPurchase,
}: ShopPurchaseDialogProps) {
  if (!item) return null;

  const Icon = resolveShopItemIcon(item.type, item.icon);

  return (
    <AppModal
      open={open}
      onClose={onClose}
      disabled={loading}
      ariaLabel="Confirmar compra"
      panelClassName="w-full max-w-md border border-border bg-background p-6 shadow-xl"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center border border-violet-800/50 bg-card">
          <Icon className="size-6 text-violet-900 dark:text-violet-400" />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-violet-500/90">
            Confirmar compra
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">{item.label}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          <p className="mt-3 font-mono text-sm text-amber-900 dark:text-amber-400">{item.price} LifeCoins</p>
        </div>
      </div>

      <p className="mt-5 text-sm text-muted-foreground">
        Queres equipar já ou guardar no inventário?
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          className="flex-1"
          disabled={loading}
          onClick={() => onPurchase(true)}
        >
          Comprar e equipar
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-violet-900/40"
          disabled={loading}
          onClick={() => onPurchase(false)}
        >
          Guardar no inventário
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-3 w-full text-muted-foreground"
        disabled={loading}
        onClick={onClose}
      >
        Cancelar
      </Button>
    </AppModal>
  );
}
