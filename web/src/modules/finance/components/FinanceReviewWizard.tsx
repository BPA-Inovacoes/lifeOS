import { useState } from "react";
import { CalendarCheck, ChevronLeft, ChevronRight } from "lucide-react";

import {
  FinanceButton,
  FinanceInput,
  FinanceSelect,
} from "@/modules/finance/components/finance-ui";
import { FinanceMethodProgressBar } from "@/modules/finance/components/FinanceProgressBars";
import {
  financeExpenseText,
  financeIncomeText,
  financeLabelClass,
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { formatDisplayDate } from "@/lib/datePickerUtils";
import {
  formatMoney,
  METHOD_FOLLOWED_LABELS,
  type FinanceAccount,
  type FinanceReviewContext,
} from "@/services/financeApi";
import { cn } from "@/lib/utils";

export type ReviewFormValues = {
  incomeNote: string;
  expenseNote: string;
  methodFollowed: "yes" | "partial" | "no";
  improvement: string;
};

const STEPS = [
  { id: "intro", title: "Introdução" },
  { id: "income", title: "Receitas" },
  { id: "expense", title: "Despesas" },
  { id: "method", title: "Método" },
  { id: "improve", title: "Melhoria" },
  { id: "balances", title: "Saldos" },
  { id: "summary", title: "Resumo" },
] as const;

type Props = {
  context: FinanceReviewContext;
  accounts: FinanceAccount[];
  currency: string;
  loading: boolean;
  onSubmit: (values: ReviewFormValues) => void;
};

export function FinanceReviewWizard({ context, accounts, currency, loading, onSubmit }: Props) {
  const [step, setStep] = useState(0);
  const [incomeNote, setIncomeNote] = useState("");
  const [expenseNote, setExpenseNote] = useState("");
  const [methodFollowed, setMethodFollowed] = useState<"yes" | "partial" | "no">("partial");
  const [improvement, setImprovement] = useState("");

  const { weekSummary, activeMethod } = context;
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;

  const goNext = () => {
    if (isLast) {
      onSubmit({ incomeNote, expenseNote, methodFollowed, improvement });
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div>
      <div className="mt-6">
        <FinanceMethodProgressBar stepIndex={step} totalSteps={STEPS.length} />
        <p className="mt-2 font-mono text-xs uppercase text-muted-foreground">
          Passo {step + 1} / {STEPS.length} · {STEPS[step]!.title}
        </p>
      </div>

      <div className={cn(financePanelClass, "mt-6 p-5")}>
        {step === 0 ? (
          <>
            <p className={financeSectionLabelClass}>// ritual semanal</p>
            <h2 className="mt-2 text-lg font-medium text-foreground">15 minutos de clareza</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Semana de {formatDisplayDate(context.weekStart)} a {formatDisplayDate(context.weekEnd)}.
              Reflecte sem julgamento — consistência importa mais do que perfeição.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>· Receitas e despesas da semana (movimentos + resumos compactados)</li>
              <li>· Se seguiste o método activo</li>
              <li>· Uma melhoria concreta para a próxima semana</li>
              <li>· Conferência dos saldos das contas</li>
            </ul>
            {weekSummary.movementCount === 0 ? (
              <p className="mt-4 text-sm text-amber-900/90 dark:text-amber-400/80">
                Ainda não há movimentos esta semana — podes reflectir na mesma com notas.
              </p>
            ) : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <p className={financeSectionLabelClass}>// 1 · receitas</p>
            <p className="mt-2 text-sm text-muted-foreground">Quanto entrou esta semana?</p>
            {weekSummary.income > 0 ? (
              <p className={cn("mt-3 text-xl", financeIncomeText)}>
                +{formatMoney(weekSummary.income, currency)} registado na app
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Sem receitas registadas esta semana.</p>
            )}
            <label className={cn(financeLabelClass, "mt-4 block")}>
              Notas (opcional)
            </label>
            <FinanceInput
              className="mt-1"
              value={incomeNote}
              onChange={(e) => setIncomeNote(e.target.value)}
              placeholder="Salário, freelance, reembolsos…"
            />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <p className={financeSectionLabelClass}>// 2 · despesas</p>
            <p className="mt-2 text-sm text-muted-foreground">Quanto saiu? Onde gastaste mais?</p>
            {weekSummary.expense > 0 ? (
              <>
                <p className={cn("mt-3 text-xl", financeExpenseText)}>
                  −{formatMoney(weekSummary.expense, currency)} registado na app
                </p>
                {weekSummary.movementCount > 0 ? (
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    {weekSummary.movementCount} movimento
                    {weekSummary.movementCount === 1 ? "" : "s"} (detalhe + resumos)
                  </p>
                ) : null}
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Sem despesas registadas esta semana.</p>
            )}
            {weekSummary.topExpenseCategories.length > 0 ? (
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {weekSummary.topExpenseCategories.map((c) => (
                  <li key={c.id} className="flex justify-between gap-2">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">{formatMoney(c.total, currency)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <label className={cn(financeLabelClass, "mt-4 block")}>
              Notas (opcional)
            </label>
            <FinanceInput
              className="mt-1"
              value={expenseNote}
              onChange={(e) => setExpenseNote(e.target.value)}
              placeholder="O que te surpreendeu, o que evitarias…"
            />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <p className={financeSectionLabelClass}>// 3 · método</p>
            <p className="mt-2 text-sm text-muted-foreground">Seguiste o plano financeiro?</p>
            {activeMethod ? (
              <p className="mt-3 text-sm text-foreground">
                Método activo: <span className="text-foreground">{activeMethod.name}</span>
                {activeMethod.currentStepTitle ? (
                  <span className="block text-sm text-muted-foreground">
                    Passo actual: {activeMethod.currentStepTitle}
                  </span>
                ) : null}
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Sem método activo — responde com base no teu plano geral.</p>
            )}
            <label className={cn(financeLabelClass, "mt-4 block")}>Como correu?</label>
            <FinanceSelect
              className="mt-1"
              value={methodFollowed}
              onChange={(e) => setMethodFollowed(e.target.value as "yes" | "partial" | "no")}
            >
              <option value="yes">{METHOD_FOLLOWED_LABELS.yes}</option>
              <option value="partial">{METHOD_FOLLOWED_LABELS.partial}</option>
              <option value="no">{METHOD_FOLLOWED_LABELS.no}</option>
            </FinanceSelect>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <p className={financeSectionLabelClass}>// 4 · melhoria</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Uma coisa concreta a melhorar na próxima semana — pequena e realizável.
            </p>
            <label className={cn(financeLabelClass, "mt-4 block")}>A tua acção</label>
            <FinanceInput
              className="mt-1"
              value={improvement}
              onChange={(e) => setImprovement(e.target.value)}
              placeholder="Ex.: registar despesas no dia, transferir 50€ na segunda…"
            />
          </>
        ) : null}

        {step === 5 ? (
          <>
            <p className={financeSectionLabelClass}>// 5 · saldos</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Confere os saldos na app com o teu banco real.
            </p>
            {accounts.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">Ainda não tens contas — cria-as em Contas.</p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {accounts.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-2 border-b border-border pb-2">
                    <span className="text-foreground">{a.name}</span>
                    <span className="font-mono text-amber-950 dark:text-amber-300/90">
                      {formatMoney(a.balance, currency)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : null}

        {step === 6 ? (
          <>
            <p className={financeSectionLabelClass}>// resumo</p>
            <h2 className="mt-2 text-lg font-medium text-foreground">Pronto para guardar</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Receitas</dt>
                <dd className="text-foreground">
                  {weekSummary.income > 0
                    ? formatMoney(weekSummary.income, currency)
                    : "—"}
                  {incomeNote ? ` · ${incomeNote}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Despesas</dt>
                <dd className="text-foreground">
                  {weekSummary.expense > 0
                    ? formatMoney(weekSummary.expense, currency)
                    : "—"}
                  {expenseNote ? ` · ${expenseNote}` : ""}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Método</dt>
                <dd className="text-foreground">{METHOD_FOLLOWED_LABELS[methodFollowed]}</dd>
              </div>
              {improvement ? (
                <div>
                  <dt className="text-muted-foreground">Melhoria</dt>
                  <dd className="text-foreground">{improvement}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted-foreground">Fluxo da semana</dt>
                <dd
                  className={cn(
                    weekSummary.net >= 0 ? financeIncomeText : financeExpenseText
                  )}
                >
                  {weekSummary.net >= 0 ? "+" : ""}
                  {formatMoney(weekSummary.net, currency)}
                </dd>
              </div>
            </dl>
          </>
        ) : null}
      </div>

      <div className="mt-6 flex gap-2">
        {!isFirst ? (
          <FinanceButton variant="outline" onClick={goBack} disabled={loading}>
            <ChevronLeft className="size-4" />
            Anterior
          </FinanceButton>
        ) : null}
        <FinanceButton className="flex-1" disabled={loading} onClick={goNext}>
          {isLast ? (
            <>
              <CalendarCheck className="size-4" />
              {loading ? "A guardar…" : "Guardar revisão"}
            </>
          ) : (
            <>
              Seguinte
              <ChevronRight className="size-4" />
            </>
          )}
        </FinanceButton>
      </div>
    </div>
  );
}
