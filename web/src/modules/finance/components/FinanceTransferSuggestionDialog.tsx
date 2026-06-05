import { useFinanceAccounts, useFinanceCurrency, useFinanceMutations } from "@/modules/finance/hooks/useFinance";
import { MovementFormDialog } from "@/modules/finance/components/MovementFormDialog";
import { useFinanceTransferSuggestionStore } from "@/store/financeTransferSuggestionStore";
import { toast } from "@/store/toastStore";
import { applyRowGamificationFeedback } from "@/modules/game/utils/gamificationFeedback";
import { useQueryClient } from "@tanstack/react-query";
import { formatMoney } from "@/services/financeApi";

export function FinanceTransferSuggestionDialog() {
  const qc = useQueryClient();
  const suggestion = useFinanceTransferSuggestionStore((s) => s.suggestion);
  const clear = useFinanceTransferSuggestionStore((s) => s.clear);
  const { data: accounts = [] } = useFinanceAccounts();
  const currency = useFinanceCurrency();
  const { createMovement } = useFinanceMutations();

  if (!suggestion) return null;

  const savingsName =
    accounts.find((a) => a.id === suggestion.toAccountId)?.name ?? "poupança";

  return (
    <MovementFormDialog
      open
      accounts={accounts}
      categories={[]}
      currency={currency}
      defaultType="TRANSFER"
      defaultAccountId={suggestion.fromAccountId}
      defaultTransferDestId={suggestion.toAccountId}
      defaultAmount={suggestion.amount}
      defaultNote={suggestion.note}
      defaultDate={new Date().toISOString().slice(0, 10)}
      title="Paga-te a ti primeiro"
      subtitle={`Transferir ${formatMoney(suggestion.amount, currency)} (${suggestion.percent}%) para ${savingsName} antes de gastar o resto.`}
      lockType
      loading={createMovement.isPending}
      onClose={clear}
      onSubmit={(body) =>
        createMovement.mutate(body, {
          onSuccess: (data) => {
            applyRowGamificationFeedback(qc, data.gamification);
            toast.success("Poupança automática registada");
            clear();
          },
          onError: () => toast.error("Erro ao registar transferência."),
        })
      }
    />
  );
}
