import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import {
  METHOD_GUIDE_LABEL,
  METHOD_QUIZ_LABEL,
  METHOD_SIMULATE_LABEL,
} from "@/modules/finance/lib/methodExploreLabels";
import { FinanceMethodExploreLink } from "@/modules/finance/components/FinanceMethodExploreLink";

import { LifeOSLoading } from "@/components/LifeOSLoading";
import { FinanceMethodStepPanel } from "@/modules/finance/components/FinanceMethodStepPanel";
import { FinanceMethodApplicationPanel } from "@/modules/finance/components/FinanceMethodApplicationPanel";
import { FinanceMethodSuggestionCard } from "@/modules/finance/components/FinanceMethodSuggestionCard";
import { FinanceQueryError } from "@/modules/finance/components/FinanceQueryError";
import { FinanceMethodProgressBar } from "@/modules/finance/components/FinanceProgressBars";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import { useMethodStepDialogs } from "@/modules/finance/hooks/useMethodStepDialogs";
import {
  useFinanceAccounts,
  useFinanceCategories,
  useFinanceCurrency,
  useFinanceMovements,
  useFinanceMethods,
  useFinanceMutations,
} from "@/modules/finance/hooks/useFinance";
import { FinanceViewToggle } from "@/modules/finance/components/FinanceViewToggle";
import {
  financeViewContainerClass,
  useFinanceViewMode,
  type FinanceViewMode,
} from "@/modules/finance/hooks/useFinanceViewMode";
import type { MethodStepAction } from "@/modules/finance/lib/methodStepActions";
import {
  getSuggestedMethod,
  suggestFinanceMethod,
} from "@/modules/finance/lib/methodSuggestions";
import {
  buildFinanceActivitySnapshot,
  getMethodApplicationGuide,
  type MethodApplicationGuide,
} from "@/modules/finance/lib/methodApplicationGuide";
import {
  financeAccentBorder,
  financeCompletedText,
  financeLoadingMessages,
  financeMetaLabelClass,
  financePanelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import type { FinanceAccount, FinanceMethod, FinanceMovement } from "@/services/financeApi";
import { paths } from "@/routes/paths";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Iniciante",
  intermediate: "Intermédio",
  advanced: "Avançado",
};

const LEVEL_ORDER = ["beginner", "intermediate", "advanced"] as const;

function MethodTitleLink({ method }: { method: FinanceMethod }) {
  return (
    <Link
      to={paths.finance.method(method.id)}
      className="group inline-flex items-center gap-1 font-medium text-foreground hover:text-amber-900 dark:hover:text-amber-400"
    >
      {method.name}
      <ChevronRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
    </Link>
  );
}

function MethodCard({
  method,
  accounts,
  movements,
  applicationGuide,
  hasActiveMethod,
  onStart,
  onAdvance,
  onStepAction,
  startPending,
  advancePending,
  viewMode,
}: {
  method: FinanceMethod;
  accounts: FinanceAccount[];
  movements: FinanceMovement[];
  applicationGuide: MethodApplicationGuide;
  hasActiveMethod: boolean;
  onStart: (id: string) => void;
  onAdvance: () => void;
  onStepAction: (action: MethodStepAction) => void;
  startPending: boolean;
  advancePending: boolean;
  viewMode: FinanceViewMode;
}) {
  const isActive = method.active && !method.completed;
  const showFull = isActive || viewMode === "cards";

  if (!showFull && viewMode === "compact") {
    return (
      <article className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-sm">
            <MethodTitleLink method={method} />
          </h2>
          <p className="truncate text-sm text-muted-foreground">{method.tagline}</p>
          <FinanceMethodExploreLink method={method} className="mt-2 w-full sm:w-auto" />
          <FinanceMethodApplicationPanel guide={applicationGuide} compact />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {method.completed ? (
            <span className={cn("font-mono text-xs uppercase", financeCompletedText)}>
              OK
            </span>
          ) : (
            <span className="font-mono text-sm text-muted-foreground">
              {method.progressPercent}%
            </span>
          )}
          {!method.completed && !method.active ? (
            <FinanceButton
              size="sm"
              variant="outline"
              disabled={hasActiveMethod || startPending}
              onClick={() => onStart(method.id)}
            >
              Começar
            </FinanceButton>
          ) : null}
        </div>
      </article>
    );
  }

  if (!showFull && viewMode === "grid") {
    return (
      <article
        className={cn(
          "flex h-full flex-col border p-4",
          method.active ? financeAccentBorder : cn(financePanelClass, "border")
        )}
      >
        <h2 className="text-base">
          <MethodTitleLink method={method} />
        </h2>
        <p className="mt-1 flex-1 text-base text-muted-foreground">{method.tagline}</p>
        <FinanceMethodExploreLink method={method} className="mt-3 w-full" />
        <FinanceMethodApplicationPanel guide={applicationGuide} compact className="flex-none" />
        <FinanceMethodProgressBar stepIndex={method.stepIndex} totalSteps={method.totalSteps} />
        {!method.completed && !method.active ? (
          <FinanceButton
            size="sm"
            variant="outline"
            className="mt-3"
            disabled={hasActiveMethod || startPending}
            onClick={() => onStart(method.id)}
          >
            Começar
          </FinanceButton>
        ) : null}
      </article>
    );
  }

  return (
    <article
      className={cn(
        "border p-5",
        method.active ? financeAccentBorder : cn(financePanelClass, "border")
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg">
            <MethodTitleLink method={method} />
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{method.tagline}</p>
          <FinanceMethodExploreLink method={method} />
          <p className={cn("mt-2", financeMetaLabelClass)}>
            {LEVEL_LABELS[method.level] ?? method.level} · {method.durationLabel} ·{" "}
            {method.totalSteps} passos
          </p>
        </div>
        {method.completed ? (
          <span className={cn("font-mono text-xs uppercase", financeCompletedText)}>
            Concluído
          </span>
        ) : method.active ? (
          <span className="font-mono text-xs uppercase text-amber-900 dark:text-amber-400">Activo</span>
        ) : null}
      </div>

      {!method.completed && !isActive ? (
        <FinanceMethodApplicationPanel guide={applicationGuide} />
      ) : isActive ? (
        <FinanceMethodApplicationPanel guide={applicationGuide} compact />
      ) : null}

      {method.active && !method.completed ? (
        <div className="mt-4">
          <FinanceMethodStepPanel
            method={method}
            accounts={accounts}
            movements={movements}
            advancing={advancePending}
            onAdvance={onAdvance}
            onStepAction={onStepAction}
          />
        </div>
      ) : !method.active && !method.completed ? (
        <>
          {method.progressPercent > 0 ? (
            <div className="mt-4">
              <FinanceMethodProgressBar
                stepIndex={method.stepIndex}
                totalSteps={method.totalSteps}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                Retomar no passo {method.stepIndex + 1}
              </p>
            </div>
          ) : null}
          <details className="mt-4">
            <summary className={cn("cursor-pointer", financeMetaLabelClass)}>
              Pré-visualizar passos
            </summary>
            <ol className="mt-3 space-y-3 border-t border-border pt-3">
              {method.steps.slice(0, 5).map((step, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-medium text-foreground">
                    {idx + 1}. {step.title}
                  </span>
                  {step.description ? (
                    <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </span>
                  ) : null}
                </li>
              ))}
              {method.steps.length > 5 ? (
                <li className="text-sm text-muted-foreground">+ {method.steps.length - 5} passos</li>
              ) : null}
            </ol>
          </details>
          <FinanceButton
            size="sm"
            variant="outline"
            className="mt-4"
            disabled={hasActiveMethod || startPending}
            onClick={() => onStart(method.id)}
          >
            {hasActiveMethod ? "Conclui o método activo primeiro" : "Começar"}
          </FinanceButton>
        </>
      ) : null}
    </article>
  );
}

export function FinanceMethodsPage() {
  const [view, setView] = useFinanceViewMode("methods");
  const { data: methods = [], isLoading, isError, refetch } = useFinanceMethods();
  const { data: accounts = [] } = useFinanceAccounts();
  const { data: movements = [] } = useFinanceMovements();
  const { data: categories = [] } = useFinanceCategories();
  const currency = useFinanceCurrency();
  const { startMethod, advanceMethod } = useFinanceMutations();

  const { runStepAction, dialogs } = useMethodStepDialogs({
    accounts,
    categories,
    currency,
  });

  const suggestion = useMemo(
    () => suggestFinanceMethod({ accounts, methods, movements }),
    [accounts, methods, movements]
  );
  const suggestedMethod = useMemo(
    () => getSuggestedMethod(methods, suggestion),
    [methods, suggestion]
  );

  const activitySnapshot = useMemo(
    () => buildFinanceActivitySnapshot({ accounts, movements, currency }),
    [accounts, movements, currency]
  );

  if (isLoading) {
    return (
      <LifeOSLoading
        variant="finance"
        message="A carregar métodos"
        rotatingMessages={financeLoadingMessages}
      />
    );
  }
  if (isError) {
    return (
      <FinanceQueryError
        title="Erro"
        message="Não foi possível carregar métodos."
        onRetry={() => refetch()}
      />
    );
  }

  const hasActiveMethod = methods.some((m) => m.active && !m.completed);

  const handleStart = (id: string) => {
    startMethod.mutate(id, {
      onSuccess: (data) => {
        const name = data.methods.find((m) => m.id === id)?.name ?? "Método";
        toast.success(`Método «${name}» iniciado`);
      },
      onError: () => toast.error("Erro ao iniciar método."),
    });
  };

  const handleAdvance = () => {
    advanceMethod.mutate(undefined, {
      onSuccess: () => toast.success("Passo concluído"),
      onError: () => toast.error("Erro ao avançar."),
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <p className={financeSectionLabelClass}>// métodos</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Métodos guiados</h1>
          <p className="mt-2 text-base text-muted-foreground">
            {methods.length} programas — cada um com{" "}
            <span className="font-medium text-amber-950 dark:text-amber-300/90">{METHOD_GUIDE_LABEL.toLowerCase()}</span>,{" "}
            <span className="font-medium text-amber-950 dark:text-amber-300/90">{METHOD_QUIZ_LABEL.toLowerCase()}</span> e{" "}
            <span className="font-medium text-amber-950 dark:text-amber-300/90">{METHOD_SIMULATE_LABEL.toLowerCase()}</span>.
          </p>
        </div>
        <FinanceViewToggle value={view} onChange={setView} />
      </div>

      {suggestedMethod && suggestion && !hasActiveMethod ? (
        <FinanceMethodSuggestionCard
          method={suggestedMethod}
          reason={suggestion.reason}
          loading={startMethod.isPending}
          onStart={() => handleStart(suggestedMethod.id)}
        />
      ) : null}

      <div className="mt-8 space-y-10">
        {LEVEL_ORDER.map((level) => {
          const group = methods.filter((m) => m.level === level);
          if (group.length === 0) return null;

          return (
            <section key={level}>
              <h2 className={financeMetaLabelClass}>
                {LEVEL_LABELS[level]}
              </h2>
              <div
                className={cn(
                  "mt-3",
                  view === "grid"
                    ? "grid gap-4 sm:grid-cols-2"
                    : view === "compact"
                      ? financeViewContainerClass("compact")
                      : "space-y-4"
                )}
              >
                {group.map((method) => (
                  <div
                    key={method.id}
                    className={cn(view === "grid" && method.active && "sm:col-span-2")}
                  >
                    <MethodCard
                      method={method}
                      accounts={accounts}
                      movements={movements}
                      applicationGuide={getMethodApplicationGuide(method.id, activitySnapshot, {
                        completed: method.completed,
                        active: method.active,
                        stepIndex: method.stepIndex,
                      })}
                      hasActiveMethod={hasActiveMethod}
                      onStart={handleStart}
                      onAdvance={handleAdvance}
                      onStepAction={runStepAction}
                      startPending={startMethod.isPending}
                      advancePending={advanceMethod.isPending}
                      viewMode={view}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {dialogs}
    </div>
  );
}
