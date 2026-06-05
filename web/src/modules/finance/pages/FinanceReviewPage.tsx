import { LifeOSLoading } from "@/components/LifeOSLoading";
import { FinanceQueryError } from "@/modules/finance/components/FinanceQueryError";
import {
  FinanceReviewCompletedSummary,
  FinanceReviewHistory,
} from "@/modules/finance/components/FinanceReviewHistory";
import { FinanceReviewWizard } from "@/modules/finance/components/FinanceReviewWizard";
import {
  useFinanceAccounts,
  useFinanceCurrency,
  useFinanceReview,
  useFinanceReviewHistory,
  useFinanceMutations,
} from "@/modules/finance/hooks/useFinance";
import {
  financeLoadingMessages,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { toast } from "@/store/toastStore";

export function FinanceReviewPage() {
  const { data, isLoading, isError, refetch } = useFinanceReview();
  const { data: history = [] } = useFinanceReviewHistory();
  const { data: accounts = [] } = useFinanceAccounts();
  const { submitReview } = useFinanceMutations();
  const currency = useFinanceCurrency();

  if (isLoading) {
    return (
      <LifeOSLoading
        variant="finance"
        message="A preparar revisão"
        rotatingMessages={financeLoadingMessages}
      />
    );
  }

  if (isError || !data) {
    return (
      <FinanceQueryError
        title="Erro"
        message="Não foi possível carregar revisão."
        onRetry={() => refetch()}
      />
    );
  }

  const done = Boolean(data.review);

  return (
    <div className="mx-auto max-w-lg">
      <p className={financeSectionLabelClass}>// revisão semanal</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Revisão semanal</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Ritual guiado — reflecte, ajusta, repete.
      </p>

      {done && data.review ? (
        <div className="mt-6">
          <FinanceReviewCompletedSummary review={data.review} weekEnd={data.weekEnd} />
        </div>
      ) : (
        <FinanceReviewWizard
          context={data}
          accounts={accounts}
          currency={currency}
          loading={submitReview.isPending}
          onSubmit={(values) =>
            submitReview.mutate(
              {
                answers: values,
                accountSnapshots: Object.fromEntries(accounts.map((a) => [a.id, a.balance])),
              },
              {
                onSuccess: () => toast.success("Revisão semanal guardada"),
                onError: () => toast.error("Erro ao guardar revisão."),
              }
            )
          }
        />
      )}

      <FinanceReviewHistory
        reviews={history}
        accounts={accounts}
        currency={currency}
        currentWeekStart={data.weekStart}
      />
    </div>
  );
}
