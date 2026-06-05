import { FinanceMovementList } from "@/modules/finance/components/FinanceMovementList";
import type { FinanceViewMode } from "@/modules/finance/hooks/useFinanceViewMode";
import type { FinanceMovement } from "@/services/financeApi";

type Props = {
  movements: FinanceMovement[];
  currency: string;
  view?: FinanceViewMode;
  onRollupOpen?: (rollupId: string) => void;
};

/** Lista compacta para dashboard e detalhe de conta */
export function FinanceRecentMovements({
  movements,
  currency,
  view = "cards",
  onRollupOpen,
}: Props) {
  return (
    <FinanceMovementList
      movements={movements}
      currency={currency}
      showAccount={false}
      view={view}
      emptyMessage="Sem movimentos registados."
      onRollupOpen={onRollupOpen}
    />
  );
}
