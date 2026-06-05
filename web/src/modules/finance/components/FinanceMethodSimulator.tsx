import { useMemo, useState } from "react";

import { FinanceButton, FinanceInput } from "@/modules/finance/components/finance-ui";
import type { MethodSimulatorKind } from "@/modules/finance/content/financeMethodEducation";
import { financeLabelClass, financeMetaLabelClass, financePanelClass, financeSectionLabelClass } from "@/modules/finance/styles/financeTokens";
import { formatMoney } from "@/services/financeApi";
import { cn } from "@/lib/utils";

type DebtRow = {
  id: string;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
};

type Props = {
  kind: MethodSimulatorKind;
  currency: string;
  initialIncome?: number;
  initialExpenses?: number;
  initialSavings?: number;
  initialDebts?: DebtRow[];
};

function parseNum(value: string): number {
  const n = parseFloat(value.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2.5 text-base last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export function FinanceMethodSimulator({
  kind,
  currency,
  initialIncome = 0,
  initialExpenses = 0,
  initialSavings = 0,
  initialDebts = [],
}: Props) {
  const [income, setIncome] = useState(String(initialIncome || ""));
  const [expenses, setExpenses] = useState(String(initialExpenses || ""));
  const [savings, setSavings] = useState(String(initialSavings || ""));
  const [savePct, setSavePct] = useState("10");
  const [saveFixed, setSaveFixed] = useState("");
  const [monthsTarget, setMonthsTarget] = useState("3");
  const [monthlySave, setMonthlySave] = useState("");
  const [envelopeCount, setEnvelopeCount] = useState("4");
  const [extraMonthly, setExtraMonthly] = useState("");
  const [debts, setDebts] = useState<DebtRow[]>(
    initialDebts.length > 0
      ? initialDebts
      : [
          { id: "1", name: "Cartão A", balance: 50000, rate: 18, minPayment: 5000 },
          { id: "2", name: "Empréstimo B", balance: 200000, rate: 12, minPayment: 15000 },
        ]
  );

  const incomeN = parseNum(income);
  const expensesN = parseNum(expenses);
  const savingsN = parseNum(savings);

  const split503020 = useMemo(() => {
    if (incomeN <= 0) return null;
    return {
      needs: incomeN * 0.5,
      wants: incomeN * 0.3,
      future: incomeN * 0.2,
      actualPct: expensesN > 0 ? Math.round((expensesN / incomeN) * 100) : 0,
    };
  }, [incomeN, expensesN]);

  const emergency = useMemo(() => {
    if (expensesN <= 0) return null;
    const targetMonths = parseNum(monthsTarget) || 3;
    const target = expensesN * targetMonths;
    const monthly = parseNum(monthlySave) || Math.max(Math.round((target - savingsN) / 12), 0);
    const monthsHave = savingsN > 0 ? savingsN / expensesN : 0;
    const monthsLeft = monthly > 0 ? Math.max((target - savingsN) / monthly, 0) : null;
    return { target, monthly, monthsHave, monthsLeft, targetMonths };
  }, [expensesN, savingsN, monthsTarget, monthlySave]);

  const savingsRate = useMemo(() => {
    if (incomeN <= 0) return null;
    const saved = incomeN - expensesN;
    const rate = Math.round((saved / incomeN) * 100);
    const gap20 = Math.round(incomeN * 0.2 - saved);
    return { saved, rate, gap20 };
  }, [incomeN, expensesN]);

  const payYourself = useMemo(() => {
    if (incomeN <= 0) return null;
    const pct = parseNum(savePct) / 100;
    const fixed = parseNum(saveFixed);
    const amount = fixed > 0 ? fixed : incomeN * pct;
    const left = incomeN - amount;
    return { amount, left };
  }, [incomeN, savePct, saveFixed]);

  const envelope = useMemo(() => {
    if (incomeN <= 0) return null;
    const fixedEstimate = expensesN > 0 ? Math.min(expensesN * 0.6, incomeN * 0.5) : incomeN * 0.5;
    const discretionary = Math.max(incomeN - fixedEstimate, 0);
    const count = Math.max(Math.round(parseNum(envelopeCount)) || 4, 2);
    const perEnvelope = discretionary / count;
    return { fixedEstimate, discretionary, perEnvelope, count };
  }, [incomeN, expensesN, envelopeCount]);

  const variableIncome = useMemo(() => {
    const m1 = parseNum(income);
    const m2 = parseNum(expenses);
    const m3 = parseNum(savings);
    const values = [m1, m2, m3].filter((v) => v > 0);
    if (values.length === 0) return null;
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const base = min + (avg - min) * 0.5;
    return { avg, min, max, base: Math.round(base) };
  }, [income, expenses, savings]);

  const snowball = useMemo(() => {
    const active = debts.filter((d) => d.balance > 0);
    if (active.length === 0) return null;
    const ordered = [...active].sort((a, b) => a.balance - b.balance);
    const extra = parseNum(extraMonthly);
    const plan = ordered.map((d, i) => ({
      ...d,
      extra: i === 0 ? extra : 0,
      monthsEst:
        i === 0 && extra + d.minPayment > 0
          ? Math.ceil(d.balance / (d.minPayment + extra))
          : null,
    }));
    return { plan, totalDebt: active.reduce((s, d) => s + d.balance, 0) };
  }, [debts, extraMonthly]);

  const avalanche = useMemo(() => {
    const active = debts.filter((d) => d.balance > 0);
    if (active.length === 0) return null;
    const ordered = [...active].sort((a, b) => b.rate - a.rate);
    const extra = parseNum(extraMonthly);
    const top = ordered[0];
    const interestMonthTop = top ? (top.balance * (top.rate / 100)) / 12 : 0;
    const interestYearAll = active.reduce(
      (s, d) => s + (d.balance * (d.rate / 100)) / 12,
      0
    );
    return {
      plan: ordered,
      extra,
      interestMonthTop,
      interestYearAll: interestYearAll * 12,
      topName: top?.name,
    };
  }, [debts, extraMonthly]);

  const updateDebt = (id: string, patch: Partial<DebtRow>) => {
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  };

  const addDebt = () => {
    setDebts((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: `Dívida ${prev.length + 1}`,
        balance: 0,
        rate: 10,
        minPayment: 0,
      },
    ]);
  };

  return (
    <div className={cn("border p-5", financePanelClass, "border-border")}>
      <p className={financeSectionLabelClass}>// simular</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Ajusta valores para ver resultados em tempo real — usa os teus dados ou experimenta cenários.
      </p>

      {kind === "split-503020" ? (
        <div className="mt-4 space-y-4">
          <label className={cn("block", financeLabelClass)}>
            Receita líquida mensual
            <FinanceInput
              type="number"
              min={0}
              className="mt-1"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </label>
          <label className={cn("block", financeLabelClass)}>
            Despesas actuais (opcional — comparação)
            <FinanceInput
              type="number"
              min={0}
              className="mt-1"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
            />
          </label>
          {split503020 ? (
            <div className="mt-2 border border-border bg-background/50 p-4">
              <ResultRow label="50% necessidades" value={formatMoney(split503020.needs, currency)} />
              <ResultRow label="30% desejos" value={formatMoney(split503020.wants, currency)} />
              <ResultRow label="20% futuro" value={formatMoney(split503020.future, currency)} />
              {expensesN > 0 ? (
                <ResultRow
                  label="Despesas actuais vs receita"
                  value={`${split503020.actualPct}%`}
                />
              ) : null}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Introduz receita para calcular.</p>
          )}
        </div>
      ) : null}

      {kind === "emergency-fund" ? (
        <div className="mt-4 space-y-4">
          <label className={cn("block", financeLabelClass)}>
            Despesas mensais
            <FinanceInput type="number" min={0} className="mt-1" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
          </label>
          <label className={cn("block", financeLabelClass)}>
            Poupança actual
            <FinanceInput type="number" min={0} className="mt-1" value={savings} onChange={(e) => setSavings(e.target.value)} />
          </label>
          <label className={cn("block", financeLabelClass)}>
            Meta (meses de despesas)
            <FinanceInput type="number" min={1} max={12} className="mt-1" value={monthsTarget} onChange={(e) => setMonthsTarget(e.target.value)} />
          </label>
          <label className={cn("block", financeLabelClass)}>
            Poupança mensal planeada
            <FinanceInput type="number" min={0} className="mt-1" value={monthlySave} onChange={(e) => setMonthlySave(e.target.value)} placeholder="Auto se vazio" />
          </label>
          {emergency && expensesN > 0 ? (
            <div className="border border-border bg-background/50 p-4">
              <ResultRow label="Meta total" value={formatMoney(emergency.target, currency)} />
              <ResultRow label="Colchão actual" value={`${emergency.monthsHave.toFixed(1)} meses`} />
              <ResultRow label="Sugestão mensal" value={formatMoney(emergency.monthly, currency)} />
              {emergency.monthsLeft !== null ? (
                <ResultRow label="Meses até meta" value={`~${Math.ceil(emergency.monthsLeft)}`} />
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {kind === "savings-rate" ? (
        <div className="mt-4 space-y-4">
          <label className={cn("block", financeLabelClass)}>
            Receita mensal
            <FinanceInput type="number" min={0} className="mt-1" value={income} onChange={(e) => setIncome(e.target.value)} />
          </label>
          <label className={cn("block", financeLabelClass)}>
            Despesas mensais
            <FinanceInput type="number" min={0} className="mt-1" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
          </label>
          {savingsRate && incomeN > 0 ? (
            <div className="border border-border bg-background/50 p-4">
              <ResultRow label="Poupança líquida" value={formatMoney(savingsRate.saved, currency)} />
              <ResultRow label="Taxa de poupança" value={`${savingsRate.rate}%`} />
              <ResultRow
                label="Para atingir 20%"
                value={
                  savingsRate.gap20 <= 0
                    ? "Meta atingida ✓"
                    : `+${formatMoney(savingsRate.gap20, currency)}/mês`
                }
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {kind === "pay-yourself-first" ? (
        <div className="mt-4 space-y-4">
          <label className={cn("block", financeLabelClass)}>
            Receita mensal
            <FinanceInput type="number" min={0} className="mt-1" value={income} onChange={(e) => setIncome(e.target.value)} />
          </label>
          <label className={cn("block", financeLabelClass)}>
            % a poupar (se valor fixo vazio)
            <FinanceInput type="number" min={0} max={100} className="mt-1" value={savePct} onChange={(e) => setSavePct(e.target.value)} />
          </label>
          <label className={cn("block", financeLabelClass)}>
            Valor fixo mensal (opcional)
            <FinanceInput type="number" min={0} className="mt-1" value={saveFixed} onChange={(e) => setSaveFixed(e.target.value)} />
          </label>
          {payYourself && incomeN > 0 ? (
            <div className="border border-border bg-background/50 p-4">
              <ResultRow label="Poupar primeiro" value={formatMoney(payYourself.amount, currency)} />
              <ResultRow label="Restante para gastar" value={formatMoney(payYourself.left, currency)} />
            </div>
          ) : null}
        </div>
      ) : null}

      {kind === "envelope-budget" ? (
        <div className="mt-4 space-y-4">
          <label className={cn("block", financeLabelClass)}>
            Receita mensal
            <FinanceInput type="number" min={0} className="mt-1" value={income} onChange={(e) => setIncome(e.target.value)} />
          </label>
          <label className={cn("block", financeLabelClass)}>
            Despesas fixas estimadas (opcional)
            <FinanceInput type="number" min={0} className="mt-1" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
          </label>
          <label className={cn("block", financeLabelClass)}>
            Nº de envelopes (categorias)
            <FinanceInput type="number" min={2} max={10} className="mt-1" value={envelopeCount} onChange={(e) => setEnvelopeCount(e.target.value)} />
          </label>
          {envelope && incomeN > 0 ? (
            <div className="border border-border bg-background/50 p-4">
              <ResultRow label="Est. fixas" value={formatMoney(envelope.fixedEstimate, currency)} />
              <ResultRow label="Para envelopes" value={formatMoney(envelope.discretionary, currency)} />
              <ResultRow
                label={`Tecto por envelope (${envelope.count})`}
                value={formatMoney(envelope.perEnvelope, currency)}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {kind === "variable-income" ? (
        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">Receitas líquidas dos últimos 3 meses:</p>
          <label className={cn("block", financeLabelClass)}>
            Mês 1
            <FinanceInput type="number" min={0} className="mt-1" value={income} onChange={(e) => setIncome(e.target.value)} />
          </label>
          <label className={cn("block", financeLabelClass)}>
            Mês 2
            <FinanceInput type="number" min={0} className="mt-1" value={expenses} onChange={(e) => setExpenses(e.target.value)} />
          </label>
          <label className={cn("block", financeLabelClass)}>
            Mês 3
            <FinanceInput type="number" min={0} className="mt-1" value={savings} onChange={(e) => setSavings(e.target.value)} />
          </label>
          {variableIncome ? (
            <div className="border border-border bg-background/50 p-4">
              <ResultRow label="Média" value={formatMoney(Math.round(variableIncome.avg), currency)} />
              <ResultRow label="Mín / Máx" value={`${formatMoney(variableIncome.min, currency)} – ${formatMoney(variableIncome.max, currency)}`} />
              <ResultRow label="Base segura (sugestão)" value={formatMoney(variableIncome.base, currency)} />
            </div>
          ) : null}
        </div>
      ) : null}

      {kind === "debt-snowball" || kind === "debt-avalanche" ? (
        <div className="mt-4 space-y-4">
          <label className={cn("block", financeLabelClass)}>
            Pagamento extra mensal (além dos mínimos)
            <FinanceInput type="number" min={0} className="mt-1" value={extraMonthly} onChange={(e) => setExtraMonthly(e.target.value)} />
          </label>
          <div className="space-y-3">
            {debts.map((d) => (
              <div key={d.id} className="grid gap-2 border border-border p-3 sm:grid-cols-2">
                <FinanceInput
                  placeholder="Nome"
                  value={d.name}
                  onChange={(e) => updateDebt(d.id, { name: e.target.value })}
                />
                <FinanceInput
                  type="number"
                  placeholder="Saldo"
                  value={d.balance || ""}
                  onChange={(e) => updateDebt(d.id, { balance: parseNum(e.target.value) })}
                />
                <FinanceInput
                  type="number"
                  placeholder="Taxa juro %"
                  value={d.rate || ""}
                  onChange={(e) => updateDebt(d.id, { rate: parseNum(e.target.value) })}
                />
                <FinanceInput
                  type="number"
                  placeholder="Prestação mín."
                  value={d.minPayment || ""}
                  onChange={(e) => updateDebt(d.id, { minPayment: parseNum(e.target.value) })}
                />
              </div>
            ))}
          </div>
          <FinanceButton size="sm" variant="outline" onClick={addDebt}>
            + Dívida
          </FinanceButton>
          {kind === "debt-snowball" && snowball ? (
            <div className="border border-border bg-background/50 p-4">
              <ResultRow label="Dívida total" value={formatMoney(snowball.totalDebt, currency)} />
              <p className={cn("mt-3", financeMetaLabelClass)}>Ordem bola de neve</p>
              <ol className="mt-2 space-y-2">
                {snowball.plan.map((d, i) => (
                  <li key={d.id} className="text-sm text-muted-foreground">
                    {i + 1}. {d.name} — {formatMoney(d.balance, currency)}
                    {d.monthsEst ? ` · ~${d.monthsEst} meses c/ extra` : ""}
                    {i === 0 && parseNum(extraMonthly) > 0 ? (
                      <span className="text-amber-900/90 dark:text-amber-400/80"> ← alvo actual</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
          {kind === "debt-avalanche" && avalanche ? (
            <div className="border border-border bg-background/50 p-4">
              <ResultRow
                label="Juros/mês (todas)"
                value={formatMoney(Math.round(avalanche.interestYearAll / 12), currency)}
              />
              <ResultRow
                label={`Juros/mês (${avalanche.topName})`}
                value={formatMoney(Math.round(avalanche.interestMonthTop), currency)}
              />
              <p className={cn("mt-3", financeMetaLabelClass)}>Ordem avalanche</p>
              <ol className="mt-2 space-y-2">
                {avalanche.plan.map((d, i) => (
                  <li key={d.id} className="text-sm text-muted-foreground">
                    {i + 1}. {d.name} — {d.rate}% TAEG · {formatMoney(d.balance, currency)}
                    {i === 0 ? <span className="text-amber-900/90 dark:text-amber-400/80"> ← prioridade</span> : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
