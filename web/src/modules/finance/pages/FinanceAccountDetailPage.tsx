import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Archive, ArchiveRestore } from "lucide-react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { LifeOSLoading } from "@/components/LifeOSLoading";
import { AccountFormDialog } from "@/modules/finance/components/AccountFormDialog";
import { FinanceQueryError } from "@/modules/finance/components/FinanceQueryError";
import { FinanceRecentMovements } from "@/modules/finance/components/FinanceRecentMovements";
import { FinanceRollupDetailDialog } from "@/modules/finance/components/FinanceRollupDetailDialog";
import { FinanceViewToggle } from "@/modules/finance/components/FinanceViewToggle";
import { useFinanceViewMode } from "@/modules/finance/hooks/useFinanceViewMode";
import { MovementFormDialog } from "@/modules/finance/components/MovementFormDialog";
import { FinanceLiabilityDetail } from "@/modules/finance/components/FinanceLiabilityDetail";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import {
  useFinanceAccount,
  useFinanceAccounts,
  useFinanceCategories,
  useFinanceCurrency,
  useFinanceMovements,
  useFinanceMutations,
} from "@/modules/finance/hooks/useFinance";
import {
  financeLoadingMessages,
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import { ACCOUNT_TYPE_LABELS, formatMoney } from "@/services/financeApi";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/datePickerUtils";

export function FinanceAccountDetailPage() {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { data: account, isLoading, isError, refetch } = useFinanceAccount(accountId);
  const { data: movements = [] } = useFinanceMovements(
    accountId ? { accountId } : undefined
  );
  const { data: activeAccounts = [] } = useFinanceAccounts(false);
  const { data: categories = [] } = useFinanceCategories();
  const { updateAccount, createMovement } = useFinanceMutations();
  const currency = useFinanceCurrency();
  const [movementsView, setMovementsView] = useFinanceViewMode("movements");

  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [rollupId, setRollupId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <LifeOSLoading
        variant="finance"
        message="A carregar conta"
        rotatingMessages={financeLoadingMessages}
      />
    );
  }

  if (isError || !account) {
    return (
      <FinanceQueryError
        title="Conta não encontrada"
        message="Não foi possível carregar esta conta."
        onRetry={() => refetch()}
      />
    );
  }

  const balanceDisplay =
    account.isLiability && account.balance < 0
      ? `−${formatMoney(Math.abs(account.balance), currency)}`
      : formatMoney(account.balance, currency);

  const handleArchiveToggle = () => {
    updateAccount.mutate(
      { accountId: account.id, body: { isArchived: !account.isArchived } },
      {
        onSuccess: () => {
          setArchiveOpen(false);
          toast.success(account.isArchived ? "Conta restaurada" : "Conta arquivada");
          if (!account.isArchived) navigate(paths.finance.accounts);
        },
        onError: () => toast.error("Erro ao actualizar conta."),
      }
    );
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={paths.finance.accounts}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-amber-900 dark:hover:text-amber-400/80"
      >
        <ArrowLeft className="size-4" />
        Contas
      </Link>

      <p className={cn(financeSectionLabelClass, "mt-4")}>// detalhe</p>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase text-muted-foreground">
            {ACCOUNT_TYPE_LABELS[account.type]}
            {account.isArchived ? " · arquivada" : ""}
          </p>
          <h1 className="text-2xl font-semibold text-foreground">{account.name}</h1>
          {account.institution ? (
            <p className="mt-1 text-sm text-muted-foreground">{account.institution}</p>
          ) : null}
        </div>
        <p className="text-3xl font-medium text-amber-950 dark:text-amber-300">{balanceDisplay}</p>
      </div>

      <div className={cn(financePanelClass, "mt-6 grid gap-3 p-4 text-sm sm:grid-cols-2")}>
        <div>
          <p className="text-sm text-muted-foreground">Saldo inicial</p>
          <p className="text-foreground">{formatMoney(account.initialBalance, currency)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Data de referência</p>
          <p className="text-foreground">{formatDisplayDate(account.initialBalanceDate)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Património líquido</p>
          <p className="text-foreground">{account.includeInNetWorth ? "Incluída" : "Excluída"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Moeda</p>
          <p className="text-foreground">{account.currency}</p>
        </div>
        {account.maskedIdentifier ? (
          <div>
            <p className="text-sm text-muted-foreground">Referência</p>
            <p className="font-mono text-foreground">{account.maskedIdentifier}</p>
          </div>
        ) : null}
      </div>

      <FinanceLiabilityDetail account={account} currency={currency} />

      <div className="mt-4 flex flex-wrap gap-2">
        {!account.isArchived ? (
          <>
            <FinanceButton size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" />
              Editar
            </FinanceButton>
            <FinanceButton size="sm" variant="outline" onClick={() => setMovementOpen(true)}>
              Registar movimento
            </FinanceButton>
            <FinanceButton size="sm" variant="ghost" onClick={() => setArchiveOpen(true)}>
              <Archive className="size-3.5" />
              Arquivar
            </FinanceButton>
          </>
        ) : (
          <FinanceButton size="sm" variant="outline" onClick={() => setArchiveOpen(true)}>
            <ArchiveRestore className="size-3.5" />
            Restaurar conta
          </FinanceButton>
        )}
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={financeSectionLabelClass}>// movimentos desta conta</p>
          {movements.length > 0 ? (
            <FinanceViewToggle value={movementsView} onChange={setMovementsView} compact />
          ) : null}
        </div>
        <div className="mt-3">
          <FinanceRecentMovements
            movements={movements}
            currency={currency}
            view={movementsView}
            onRollupOpen={setRollupId}
          />
        </div>
      </section>

      <AccountFormDialog
        open={editOpen}
        loading={updateAccount.isPending}
        currency={currency}
        account={account}
        onClose={() => setEditOpen(false)}
        onSubmit={(payload) =>
          updateAccount.mutate(
            {
              accountId: account.id,
              body: {
                name: payload.name,
                type: payload.type,
                institution: payload.institution ?? null,
                maskedIdentifier: payload.maskedIdentifier ?? null,
                includeInNetWorth: payload.includeInNetWorth,
                color: payload.color ?? null,
                creditLimit: payload.creditLimit,
                billingCycleDay: payload.billingCycleDay,
                paymentDueDay: payload.paymentDueDay,
                aprPercent: payload.aprPercent,
                minimumPayment: payload.minimumPayment,
                originalPrincipal: payload.originalPrincipal,
              },
            },
            {
              onSuccess: () => {
                setEditOpen(false);
                toast.success("Conta actualizada");
              },
              onError: () => toast.error("Erro ao guardar."),
            }
          )
        }
      />

      <ConfirmDialog
        open={archiveOpen}
        variant="warning"
        title={account.isArchived ? "Restaurar conta?" : "Arquivar conta?"}
        description={
          account.isArchived
            ? "A conta volta a aparecer na lista activa e pode receber novos movimentos."
            : "A conta deixa de aparecer nas listas activas. O histórico de movimentos mantém-se."
        }
        confirmLabel={account.isArchived ? "Restaurar" : "Arquivar"}
        loading={updateAccount.isPending}
        loadingLabel="A processar…"
        onCancel={() => setArchiveOpen(false)}
        onConfirm={handleArchiveToggle}
      />

      {!account.isArchived ? (
        <MovementFormDialog
          open={movementOpen}
          loading={createMovement.isPending}
          accounts={activeAccounts}
          categories={categories}
          currency={currency}
          defaultAccountId={account.id}
          onClose={() => setMovementOpen(false)}
          onSubmit={(body) =>
            createMovement.mutate(body, {
              onSuccess: () => {
                setMovementOpen(false);
                toast.success("Movimento registado");
              },
              onError: () => toast.error("Erro ao registar."),
            })
          }
        />
      ) : null}

      <FinanceRollupDetailDialog
        rollupId={rollupId}
        currency={currency}
        onClose={() => setRollupId(null)}
      />
    </div>
  );
}
