import { ArrowRightLeft, Plus, TrendingUp, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { LifeOSLoading } from "@/components/LifeOSLoading";
import { AccountFormDialog } from "@/modules/finance/components/AccountFormDialog";
import { toCreateAccountBody } from "@/modules/finance/lib/accountFormPayload";
import { FinanceActiveMethodCard } from "@/modules/finance/components/FinanceActiveMethodCard";
import { FinanceMethodSuggestionCard } from "@/modules/finance/components/FinanceMethodSuggestionCard";
import { FinanceCurrencyPicker } from "@/modules/finance/components/FinanceCurrencyPicker";
import { FinanceEnvelopesPanel } from "@/modules/finance/components/FinanceEnvelopesPanel";
import { FinanceDebtsPanel } from "@/modules/finance/components/FinanceDebtsPanel";
import { FinanceExportButton } from "@/modules/finance/components/FinanceExportButton";
import { FinanceMonthlyReportButton } from "@/modules/finance/components/FinanceMonthlyReportButton";
import { FinanceGoalsPanel } from "@/modules/finance/components/FinanceGoalsPanel";
import { FinanceOnboardingCard } from "@/modules/finance/components/FinanceOnboardingCard";
import { FinanceQuestionnaireDialog } from "@/modules/finance/components/FinanceQuestionnaireDialog";
import { FinanceRollupDetailDialog } from "@/modules/finance/components/FinanceRollupDetailDialog";
import { FinanceQueryError } from "@/modules/finance/components/FinanceQueryError";
import { FinanceViewToggle } from "@/modules/finance/components/FinanceViewToggle";
import {
  financeViewContainerClass,
  useFinanceViewMode,
} from "@/modules/finance/hooks/useFinanceViewMode";
import { FinanceAccountCard } from "@/modules/finance/components/FinanceAccountCard";
import { FinanceRecentMovements } from "@/modules/finance/components/FinanceRecentMovements";
import { FinanceReviewBanner } from "@/modules/finance/components/FinanceReviewBanner";
import { FinanceSavingsRateGauge } from "@/modules/finance/components/FinanceProgressBars";
import { FinanceTopCategories } from "@/modules/finance/components/FinanceTopCategories";
import { MovementFormDialog } from "@/modules/finance/components/MovementFormDialog";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import {
  useFinanceCategories,
  useFinanceDashboard,
  useFinanceMovements,
  useFinanceMutations,
} from "@/modules/finance/hooks/useFinance";
import { useMethodStepDialogs } from "@/modules/finance/hooks/useMethodStepDialogs";
import {
  getSuggestedMethod,
  suggestFinanceMethod,
} from "@/modules/finance/lib/methodSuggestions";
import {
  financeAccentBorder,
  financeExpenseText,
  financeIncomeText,
  financeLinkClass,
  financeLoadingMessages,
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { formatMoney } from "@/services/financeApi";
import { paths } from "@/routes/paths";
import { detectClientDefaultCurrency } from "@/modules/finance/financeLocale";
import { cn } from "@/lib/utils";
import { toast } from "@/store/toastStore";

export function FinanceHomePage() {
  const { data, isLoading, isError, refetch } = useFinanceDashboard();
  const { data: categories = [] } = useFinanceCategories();
  const { data: movements = [] } = useFinanceMovements();
  const { createAccount, createMovement, advanceMethod, startMethod } = useFinanceMutations();
  const navigate = useNavigate();
  const [accountOpen, setAccountOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementType, setMovementType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [rollupId, setRollupId] = useState<string | null>(null);

  const currency = data?.profile?.currency ?? detectClientDefaultCurrency();
  const [accountsView, setAccountsView] = useFinanceViewMode("home-accounts", "grid");
  const [movementsView, setMovementsView] = useFinanceViewMode("home-movements");

  const { runStepAction, dialogs: stepDialogs } = useMethodStepDialogs({
    accounts: data?.accounts ?? [],
    categories,
    currency,
    defaultAccountId: data?.profile?.defaultExpenseAccountId,
  });

  useEffect(() => {
    if (!data) return;
    if (data.accounts.length > 0 && !data.profile.questionnaireCompletedAt) {
      setQuestionnaireOpen(true);
    }
  }, [data?.profile?.questionnaireCompletedAt, data?.accounts.length]);

  const suggestion = useMemo(() => {
    if (!data) return null;
    return suggestFinanceMethod({
      accounts: data.accounts,
      methods: data.methods,
      movements,
    });
  }, [data, movements]);

  const suggestedMethod = useMemo(
    () => (data ? getSuggestedMethod(data.methods, suggestion) : null),
    [data, suggestion]
  );

  if (isLoading) {
    return (
      <LifeOSLoading
        variant="finance"
        message="A carregar finanças"
        rotatingMessages={financeLoadingMessages}
      />
    );
  }

  if (isError || !data) {
    return (
      <FinanceQueryError
        title="Finanças indisponíveis"
        message="Não foi possível carregar o painel."
        onRetry={() => refetch()}
      />
    );
  }

  const openMovement = (type: "EXPENSE" | "INCOME" | "TRANSFER") => {
    setMovementType(type);
    setMovementOpen(true);
  };

  const isNewUser = data.accounts.length === 0;
  const showQuestionnaire =
    !isNewUser && !data.profile.questionnaireCompletedAt && data.accounts.length >= 1;
  const monthNet = data.month.income - data.month.expense;

  return (
    <div className="mx-auto max-w-4xl">
      <p className={financeSectionLabelClass}>// início</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Modo Finanças</h1>
          <p className="mt-1 text-sm text-muted-foreground">{data.insight}</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:items-end">
          <Link
            to={paths.finance.manual}
            className={cn("font-mono text-xs uppercase tracking-wider sm:text-right", financeLinkClass)}
          >
            Manual →
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <FinanceExportButton />
            <FinanceMonthlyReportButton />
            <FinanceCurrencyPicker className="w-full sm:min-w-[17rem] sm:max-w-xs" compact />
          </div>
        </div>
      </div>

      {showQuestionnaire ? (
        <div className={cn(financePanelClass, "mt-4 border border-amber-400/40 bg-amber-50/60 p-4 dark:bg-amber-950/25")}>
          <p className="text-sm text-muted-foreground">
            Responde a 6 perguntas rápidas — sugerimos o método certo para ti (com glossário).
          </p>
          <FinanceButton size="sm" className="mt-3" onClick={() => setQuestionnaireOpen(true)}>
            Iniciar questionário
          </FinanceButton>
        </div>
      ) : null}

      {isNewUser ? <FinanceOnboardingCard onCreateAccount={() => setAccountOpen(true)} /> : null}

      <div className={cn("mt-6 grid gap-4 sm:grid-cols-3")}>
        <div className={cn("border bg-background/80 p-4 sm:col-span-1", financeAccentBorder)}>
          <p className="font-mono text-xs uppercase text-muted-foreground">Património líquido</p>
          <p className="mt-1 text-2xl font-semibold text-amber-950 dark:text-amber-300">
            {formatMoney(data.netWorth, currency)}
          </p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {data.accounts.length} conta{data.accounts.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className={cn(financePanelClass, "p-4")}>
          <p className="font-mono text-xs uppercase text-muted-foreground">Fluxo do mês</p>
          <p className={cn("mt-1 text-lg", financeIncomeText)}>+{formatMoney(data.month.income, currency)}</p>
          <p className={cn("text-lg", financeExpenseText)}>−{formatMoney(data.month.expense, currency)}</p>
          <p
            className={cn(
              "mt-1 font-mono text-xs",
              monthNet >= 0 ? "text-amber-900/90 dark:text-amber-400/80" : financeExpenseText
            )}
          >
            Líquido {monthNet >= 0 ? "+" : ""}
            {formatMoney(monthNet, currency)}
          </p>
        </div>
        <div className={cn(financePanelClass, "p-4")}>
          <p className="font-mono text-xs uppercase text-muted-foreground">Taxa poupança</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{data.month.savingsRate}%</p>
          <FinanceSavingsRateGauge rate={data.month.savingsRate} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <FinanceButton size="sm" onClick={() => openMovement("EXPENSE")} disabled={isNewUser}>
          <Plus className="size-4" /> Despesa
        </FinanceButton>
        <FinanceButton size="sm" variant="outline" onClick={() => openMovement("INCOME")} disabled={isNewUser}>
          <TrendingUp className="size-4" /> Receita
        </FinanceButton>
        <FinanceButton size="sm" variant="outline" onClick={() => openMovement("TRANSFER")} disabled={isNewUser}>
          <ArrowRightLeft className="size-4" /> Transferir
        </FinanceButton>
        <FinanceButton size="sm" variant="outline" onClick={() => setAccountOpen(true)}>
          <Wallet className="size-4" /> Nova conta
        </FinanceButton>
      </div>

      {data.activeMethod && !data.activeMethod.completed ? (
        <FinanceActiveMethodCard
          method={data.activeMethod}
          accounts={data.accounts}
          movements={movements}
          advancing={advanceMethod.isPending}
          onAdvance={() =>
            advanceMethod.mutate(undefined, {
              onSuccess: () => toast.success("Passo concluído"),
              onError: () => toast.error("Não foi possível avançar."),
            })
          }
          onStepAction={runStepAction}
        />
      ) : !isNewUser && !data.profile.activeMethodId && suggestedMethod && suggestion ? (
        <FinanceMethodSuggestionCard
          method={suggestedMethod}
          reason={suggestion.reason}
          loading={startMethod.isPending}
          onStart={() =>
            startMethod.mutate(suggestedMethod.id, {
              onSuccess: () => {
                toast.success(`Método «${suggestedMethod.name}» iniciado`);
                navigate(paths.finance.methods);
              },
              onError: () => toast.error("Erro ao iniciar método."),
            })
          }
        />
      ) : !isNewUser && !data.profile.activeMethodId ? (
        <div className={cn("mt-6 border border-dashed border-border px-4 py-4 text-sm text-muted-foreground")}>
          Sem método activo —{" "}
          <Link to={paths.finance.methods} className={financeLinkClass}>
            escolhe um programa
          </Link>
        </div>
      ) : null}

      <FinanceTopCategories
        categories={data.topExpenseCategories}
        currency={currency}
        monthExpense={data.month.expense}
      />

      {!isNewUser ? (
        <>
          <FinanceEnvelopesPanel />
          <FinanceGoalsPanel />
          <FinanceDebtsPanel className="mt-8" />
        </>
      ) : null}

      {!isNewUser ? (
        <section className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-medium text-foreground">Contas</h2>
            <div className="flex items-center gap-2">
              <FinanceViewToggle value={accountsView} onChange={setAccountsView} compact />
              <Link to={paths.finance.accounts} className={cn("text-xs", financeLinkClass)}>
                Ver todas
              </Link>
            </div>
          </div>
          <ul
            className={cn(
              "list-none",
              accountsView === "grid" && "grid gap-3 sm:grid-cols-2",
              accountsView === "compact" && financeViewContainerClass("compact"),
              accountsView === "cards" && "space-y-3"
            )}
          >
            {data.accounts.slice(0, 4).map((account) => (
              <li key={account.id}>
                <FinanceAccountCard account={account} currency={currency} view={accountsView} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!isNewUser ? (
        <section className="mt-8">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-medium text-foreground">Movimentos recentes</h2>
            <div className="flex items-center gap-2">
              {data.recentMovements.length > 0 ? (
                <FinanceViewToggle value={movementsView} onChange={setMovementsView} compact />
              ) : null}
              <Link to={paths.finance.movements} className={cn("text-xs", financeLinkClass)}>
                Ver todos
              </Link>
            </div>
          </div>
          <FinanceRecentMovements
            movements={data.recentMovements}
            currency={currency}
            view={movementsView}
            onRollupOpen={setRollupId}
          />
        </section>
      ) : null}

      <FinanceReviewBanner
        completed={data.weeklyReview.completed}
        weekStart={data.weeklyReview.weekStart}
      />

      <AccountFormDialog
        open={accountOpen}
        loading={createAccount.isPending}
        currency={currency}
        onClose={() => setAccountOpen(false)}
        onSubmit={(payload) => {
          createAccount.mutate(toCreateAccountBody(payload), {
            onSuccess: () => {
              setAccountOpen(false);
              toast.success("Conta criada");
            },
            onError: () => toast.error("Não foi possível criar a conta."),
          });
        }}
      />

      <MovementFormDialog
        open={movementOpen}
        loading={createMovement.isPending}
        accounts={data.accounts}
        categories={categories}
        currency={currency}
        defaultType={movementType}
        defaultAccountId={data.profile.defaultExpenseAccountId}
        onClose={() => setMovementOpen(false)}
        onSubmit={(body) =>
          createMovement.mutate(body, {
            onSuccess: () => {
              setMovementOpen(false);
              toast.success("Movimento registado");
            },
            onError: () => toast.error("Não foi possível registar."),
          })
        }
      />

      {stepDialogs}

      <FinanceQuestionnaireDialog
        open={questionnaireOpen}
        onClose={() => setQuestionnaireOpen(false)}
      />

      <FinanceRollupDetailDialog
        rollupId={rollupId}
        currency={currency}
        onClose={() => setRollupId(null)}
      />
    </div>
  );
}
