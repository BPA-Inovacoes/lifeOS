import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Calculator, ClipboardCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { LifeOSLoading } from "@/components/LifeOSLoading";
import { FinanceMethodApplicationPanel } from "@/modules/finance/components/FinanceMethodApplicationPanel";
import { FinanceMethodQuiz } from "@/modules/finance/components/FinanceMethodQuiz";
import { FinanceMethodSimulator } from "@/modules/finance/components/FinanceMethodSimulator";
import { FinancePayYourselfPanel } from "@/modules/finance/components/FinancePayYourselfPanel";
import { FinanceMethodStepPanel } from "@/modules/finance/components/FinanceMethodStepPanel";
import { FinanceQueryError } from "@/modules/finance/components/FinanceQueryError";
import { FinanceMethodProgressBar } from "@/modules/finance/components/FinanceProgressBars";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import { getMethodEducation } from "@/modules/finance/content/financeMethodEducation";
import { useMethodStepDialogs } from "@/modules/finance/hooks/useMethodStepDialogs";
import {
  useFinanceAccounts,
  useFinanceCategories,
  useFinanceCurrency,
  useFinanceMovements,
  useFinanceMethods,
  useFinanceMutations,
} from "@/modules/finance/hooks/useFinance";
import {
  buildFinanceActivitySnapshot,
  getMethodApplicationGuide,
} from "@/modules/finance/lib/methodApplicationGuide";
import {
  financeAccentBorder,
  financeBodyClass,
  financeBodyMutedClass,
  financeCompletedText,
  financeLinkClass,
  financeLoadingMessages,
  financeMetaLabelClass,
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

import {
  METHOD_GUIDE_LABEL,
  METHOD_QUIZ_LABEL,
  METHOD_SIMULATE_LABEL,
} from "@/modules/finance/lib/methodExploreLabels";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermédio",
  advanced: "Avançado",
};

type TabId = "explain" | "quiz" | "simulator";

const TABS: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: "explain", label: METHOD_GUIDE_LABEL, icon: BookOpen },
  { id: "quiz", label: METHOD_QUIZ_LABEL, icon: ClipboardCheck },
  { id: "simulator", label: METHOD_SIMULATE_LABEL, icon: Calculator },
];

export function FinanceMethodDetailPage() {
  const { methodId } = useParams<{ methodId: string }>();
  const [tab, setTab] = useState<TabId>("explain");

  const { data: methods = [], isLoading, isError, refetch } = useFinanceMethods();
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: movements = [] } = useFinanceMovements();
  const { data: categories = [] } = useFinanceCategories();
  const currency = useFinanceCurrency();
  const { startMethod, advanceMethod, suggestMethodHabits } = useFinanceMutations();

  const method = methods.find((m) => m.id === methodId);
  const education = methodId ? getMethodEducation(methodId) : undefined;

  const activitySnapshot = useMemo(
    () => buildFinanceActivitySnapshot({ accounts, movements, currency }),
    [accounts, movements, currency]
  );

  const applicationGuide = useMemo(
    () =>
      method
        ? getMethodApplicationGuide(method.id, activitySnapshot, {
            completed: method.completed,
            active: method.active,
            stepIndex: method.stepIndex,
          })
        : null,
    [method, activitySnapshot]
  );

  const initialDebts = useMemo(
    () =>
      activitySnapshot.liabilities.map((a) => ({
        id: a.id,
        name: a.name,
        balance: Math.abs(a.balance),
        rate: 12,
        minPayment: Math.round(Math.abs(a.balance) * 0.02) || 0,
      })),
    [activitySnapshot.liabilities]
  );

  const { runStepAction, dialogs } = useMethodStepDialogs({
    accounts,
    categories,
    currency,
  });

  const hasActiveOther =
    methods.some((m) => m.active && !m.completed && m.id !== methodId) ?? false;

  if (isLoading) {
    return (
      <LifeOSLoading
        variant="finance"
        message="A carregar método"
        rotatingMessages={financeLoadingMessages}
      />
    );
  }

  if (isError || !method || !education) {
    return (
      <FinanceQueryError
        title="Método não encontrado"
        message="Este programa não existe ou não foi possível carregá-lo."
        onRetry={() => refetch()}
      />
    );
  }

  const isActive = method.active && !method.completed;
  const visibleTabs = TABS.filter(
    (t) => t.id !== "simulator" || Boolean(education.simulator)
  );

  const handleStart = () => {
    startMethod.mutate(method.id, {
      onSuccess: () => toast.success(`Método «${method.name}» iniciado`),
      onError: () => toast.error("Erro ao iniciar método."),
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={paths.finance.methods}
        className={cn("inline-flex items-center gap-1.5 text-sm", financeLinkClass)}
      >
        <ArrowLeft className="size-4" />
        Voltar aos métodos
      </Link>

      <header className="mt-4">
        <p className={financeSectionLabelClass}>// método</p>
        <h1 className="mt-1 text-3xl font-semibold text-foreground">{method.name}</h1>
        <p className="mt-2 text-base text-muted-foreground">{method.tagline}</p>
        <p className={cn("mt-2", financeMetaLabelClass)}>
          {LEVEL_LABELS[method.level] ?? method.level} · {method.durationLabel} ·{" "}
          {method.totalSteps} passos
          {method.completed ? (
            <span className={cn("ml-2", financeCompletedText)}>· Concluído</span>
          ) : isActive ? (
            <span className="ml-2 text-amber-900 dark:text-amber-400">· Activo</span>
          ) : null}
        </p>
      </header>

      {!method.completed ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {isActive ? (
            <>
              <FinanceButton size="sm" variant="outline" onClick={() => setTab("explain")}>
                Ver passo actual abaixo
              </FinanceButton>
              <FinanceButton
                size="sm"
                variant="outline"
                disabled={suggestMethodHabits.isPending}
                onClick={() =>
                  suggestMethodHabits.mutate(method.id, {
                    onSuccess: (data) =>
                      toast.success(
                        data.created > 0
                          ? `${data.created} hábito(s) criado(s) na base Hábitos`
                          : "Hábitos sugeridos já existiam"
                      ),
                    onError: () => toast.error("Erro ao criar hábitos sugeridos."),
                  })
                }
              >
                Criar hábitos sugeridos
              </FinanceButton>
            </>
          ) : (
            <FinanceButton
              size="sm"
              disabled={hasActiveOther}
              onClick={handleStart}
              title={hasActiveOther ? "Conclui o método activo primeiro" : undefined}
            >
              {hasActiveOther ? "Outro método activo" : "Começar este método"}
            </FinanceButton>
          )}
          <div className="min-w-[120px] flex-1">
            <FinanceMethodProgressBar stepIndex={method.stepIndex} totalSteps={method.totalSteps} />
          </div>
        </div>
      ) : null}

      {applicationGuide ? (
        <FinanceMethodApplicationPanel guide={applicationGuide} className="mt-4" />
      ) : null}

      {methodId === "pay-yourself-first" ? (
        <FinancePayYourselfPanel className="mt-6" active={isActive} />
      ) : null}

      {isActive ? (
        <div className="mt-6">
          <FinanceMethodStepPanel
            method={method}
            accounts={accounts}
            movements={movements}
            advancing={advanceMethod.isPending}
            onAdvance={() =>
              advanceMethod.mutate(undefined, {
                onSuccess: () => toast.success("Passo concluído"),
                onError: () => toast.error("Erro ao avançar."),
              })
            }
            onStepAction={runStepAction}
          />
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-1 border-b border-border">
        {visibleTabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              tab === id
                ? "border-amber-500 text-amber-900 dark:text-amber-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 pb-10">
        {tab === "explain" ? (
          <div className="space-y-6">
            <p className={financeBodyClass}>{education.summary}</p>

            {education.sections.map((sec) => (
              <section key={sec.title} className={cn("border p-5", financePanelClass, "border-border")}>
                <h2 className="text-lg font-medium text-foreground">{sec.title}</h2>
                <p className={cn("mt-3", financeBodyMutedClass)}>{sec.body}</p>
              </section>
            ))}

            <div className="grid gap-4 sm:grid-cols-2">
              <section className={cn("border p-4", financeAccentBorder)}>
                <h3 className="text-sm font-medium uppercase tracking-wide text-emerald-800/90 dark:text-emerald-400/90">
                  Quando usar
                </h3>
                <ul className="mt-3 space-y-2">
                  {education.whenToUse.map((item) => (
                    <li key={item} className={financeBodyMutedClass}>
                      · {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section className={cn("border border-border p-4", financePanelClass)}>
                <h3 className={financeMetaLabelClass}>Evitar quando</h3>
                <ul className="mt-3 space-y-2">
                  {education.avoidWhen.map((item) => (
                    <li key={item} className={financeBodyMutedClass}>
                      · {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section>
              <h2 className={financeMetaLabelClass}>
                Passos do programa ({method.totalSteps})
              </h2>
              <ol className="mt-4 space-y-4">
                {method.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      "border p-5",
                      step.current ? financeAccentBorder : cn(financePanelClass, "border-border")
                    )}
                  >
                    <span className="text-base font-medium text-foreground">
                      {idx + 1}. {step.title}
                    </span>
                    {step.description ? (
                      <p className={cn("mt-3", financeBodyMutedClass)}>
                        {step.description}
                      </p>
                    ) : null}
                    {step.lesson ? (
                      <p className="mt-3 border-l-2 border-amber-500/30 pl-3 text-sm leading-relaxed text-amber-900/90 dark:text-amber-400/90">
                        {step.lesson}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        ) : null}

        {tab === "quiz" ? <FinanceMethodQuiz questions={education.quiz} /> : null}

        {tab === "simulator" && education.simulator ? (
          <FinanceMethodSimulator
            kind={education.simulator}
            currency={currency}
            initialIncome={activitySnapshot.monthIncome}
            initialExpenses={activitySnapshot.monthExpense}
            initialSavings={activitySnapshot.totalSavingsBalance}
            initialDebts={initialDebts}
          />
        ) : null}
      </div>

      {dialogs}
    </div>
  );
}
