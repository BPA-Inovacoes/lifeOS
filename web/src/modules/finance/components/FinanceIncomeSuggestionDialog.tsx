import { useFinanceAccounts, useFinanceCategories, useFinanceCurrency, useFinanceMutations } from "@/modules/finance/hooks/useFinance";
import { MovementFormDialog } from "@/modules/finance/components/MovementFormDialog";
import { useFinanceSuggestionStore } from "@/store/financeSuggestionStore";
import { toast } from "@/store/toastStore";
import { applyRowGamificationFeedback } from "@/modules/game/utils/gamificationFeedback";
import { useQueryClient } from "@tanstack/react-query";

export function FinanceIncomeSuggestionDialog() {
  const qc = useQueryClient();
  const suggestion = useFinanceSuggestionStore((s) => s.suggestion);
  const clear = useFinanceSuggestionStore((s) => s.clear);
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: categories = [] } = useFinanceCategories();
  const currency = useFinanceCurrency();
  const { createMovement } = useFinanceMutations();

  if (!suggestion) return null;

  return (
    <MovementFormDialog
      open
      accounts={accounts}
      categories={categories}
      currency={currency}
      defaultType="INCOME"
      defaultAccountId={suggestion.accountId}
      defaultAmount={suggestion.amount}
      defaultCategoryId={suggestion.categoryId}
      defaultNote={suggestion.note}
      defaultDate={new Date().toISOString().slice(0, 10)}
      linkedClientRowId={suggestion.clientRowId}
      loading={createMovement.isPending}
      onClose={clear}
      onSubmit={(body) =>
        createMovement.mutate(body, {
          onSuccess: (data) => {
            applyRowGamificationFeedback(qc, data.gamification);
            toast.success(`Receita de ${suggestion.clientName} registada`);
            clear();
          },
          onError: () => toast.error("Erro ao registar receita."),
        })
      }
    />
  );
}
