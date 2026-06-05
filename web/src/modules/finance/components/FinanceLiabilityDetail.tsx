import type { FinanceAccount } from "@/services/financeApi";
import { formatMoney } from "@/services/financeApi";
import { financePanelClass } from "@/modules/finance/styles/financeTokens";
import { formatDisplayDate } from "@/lib/datePickerUtils";
import { cn } from "@/lib/utils";

type Props = {
  account: FinanceAccount;
  currency: string;
  className?: string;
};

export function FinanceLiabilityDetail({ account, currency, className }: Props) {
  if (!account.isLiability) return null;

  const isCard = account.type === "CREDIT_CARD";
  const isLoan = account.type === "LOAN";
  const hasMeta =
    account.creditLimit != null ||
    account.billingCycleDay != null ||
    account.aprPercent != null ||
    account.minimumPayment != null ||
    account.originalPrincipal != null;

  if (!hasMeta && !account.billingPeriod) return null;

  const debtAmount = Math.abs(account.balance);
  const availableCredit =
    isCard && account.creditLimit != null
      ? Math.round((account.creditLimit - debtAmount) * 100) / 100
      : null;
  const paidOffPercent =
    isLoan && account.originalPrincipal != null && account.originalPrincipal > 0
      ? Math.min(
          100,
          Math.round(
            ((account.originalPrincipal - debtAmount) / account.originalPrincipal) * 1000
          ) / 10
        )
      : null;

  return (
    <div className={cn(financePanelClass, "mt-4 grid gap-3 p-4 text-sm sm:grid-cols-2", className)}>
      <p className="col-span-full font-mono text-xs uppercase text-muted-foreground">
        {isCard ? "// cartão de crédito" : "// empréstimo"}
      </p>

      {isCard && account.creditLimit != null ? (
        <>
          <div>
            <p className="text-muted-foreground">Limite</p>
            <p className="text-foreground">{formatMoney(account.creditLimit, currency)}</p>
          </div>
          {availableCredit != null ? (
            <div>
              <p className="text-muted-foreground">Disponível</p>
              <p className="text-foreground">{formatMoney(availableCredit, currency)}</p>
            </div>
          ) : null}
        </>
      ) : null}

      {isCard && account.billingCycleDay != null ? (
        <div>
          <p className="text-muted-foreground">Fecho do ciclo</p>
          <p className="text-foreground">Dia {account.billingCycleDay}</p>
        </div>
      ) : null}

      {isCard && account.paymentDueDay != null ? (
        <div>
          <p className="text-muted-foreground">Pagamento até</p>
          <p className="text-foreground">Dia {account.paymentDueDay}</p>
        </div>
      ) : null}

      {account.billingPeriod ? (
        <>
          <div>
            <p className="text-muted-foreground">Ciclo actual</p>
            <p className="text-foreground">
              {formatDisplayDate(account.billingPeriod.from)} —{" "}
              {formatDisplayDate(account.billingPeriod.to)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Próximo fecho</p>
            <p className="text-foreground">
              {formatDisplayDate(account.billingPeriod.nextClosing)}
            </p>
          </div>
          {account.billingPeriod.nextPaymentDue ? (
            <div>
              <p className="text-muted-foreground">Próximo pagamento</p>
              <p className="text-foreground">
                {formatDisplayDate(account.billingPeriod.nextPaymentDue)}
              </p>
            </div>
          ) : null}
          {account.cycleSpend != null ? (
            <div>
              <p className="text-muted-foreground">Gasto no ciclo</p>
              <p className="text-foreground">{formatMoney(account.cycleSpend, currency)}</p>
            </div>
          ) : null}
        </>
      ) : null}

      {account.aprPercent != null ? (
        <div>
          <p className="text-muted-foreground">TAEG / juro anual</p>
          <p className="text-foreground">{account.aprPercent}%</p>
        </div>
      ) : null}

      {isLoan && account.originalPrincipal != null ? (
        <div>
          <p className="text-muted-foreground">Capital inicial</p>
          <p className="text-foreground">{formatMoney(account.originalPrincipal, currency)}</p>
        </div>
      ) : null}

      {isLoan && paidOffPercent != null ? (
        <div>
          <p className="text-muted-foreground">Amortizado</p>
          <p className="text-foreground">{paidOffPercent}%</p>
        </div>
      ) : null}

      {isLoan && account.minimumPayment != null ? (
        <div>
          <p className="text-muted-foreground">Prestação mínima</p>
          <p className="text-foreground">{formatMoney(account.minimumPayment, currency)}</p>
        </div>
      ) : null}
    </div>
  );
}
