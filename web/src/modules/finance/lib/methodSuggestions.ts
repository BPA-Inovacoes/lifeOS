import type {
  FinanceAccount,
  FinanceMethod,
  FinanceMovement,
} from "@/services/financeApi";

export type MethodSuggestion = {
  methodId: string;
  reason: string;
};

export function suggestFinanceMethod(input: {
  accounts: FinanceAccount[];
  methods: FinanceMethod[];
  movements?: FinanceMovement[];
}): MethodSuggestion | null {
  const { accounts, methods, movements = [] } = input;

  if (methods.some((m) => m.active && !m.completed)) return null;

  const method = (id: string) => methods.find((m) => m.id === id);
  const completed = (id: string) => Boolean(method(id)?.completed);

  const hasChecking = accounts.some((a) => a.type === "CHECKING" && !a.isArchived);
  const hasSavings = accounts.some((a) => a.type === "SAVINGS" && !a.isArchived);
  const hasLiability = accounts.some(
    (a) => a.isLiability && !a.isArchived && Math.abs(a.balance) > 0
  );
  const expenseCount = movements.filter((m) => m.type === "EXPENSE").length;

  if (accounts.filter((a) => !a.isArchived).length === 0) {
    return {
      methodId: "first-30-days",
      reason: "Ainda não tens contas — começa por mapear o teu dinheiro.",
    };
  }

  if (!hasChecking || !hasSavings) {
    return {
      methodId: "first-30-days",
      reason: "Conta à ordem + poupança são a base — o trilho «Primeiros 30 dias» guia-te.",
    };
  }

  if (hasLiability && !completed("debt-snowball") && !completed("debt-avalanche")) {
    return {
      methodId: "debt-snowball",
      reason: "Tens dívidas activas — a bola de neve cria vitórias rápidas.",
    };
  }

  if (expenseCount < 3 && !completed("first-30-days")) {
    return {
      methodId: "first-30-days",
      reason: "Regista algumas despesas para perceberes para onde vai o dinheiro.",
    };
  }

  const first30 = method("first-30-days");
  if (first30 && !first30.completed && (first30.stepIndex ?? 0) < first30.totalSteps) {
    return {
      methodId: "first-30-days",
      reason: "Continua o onboarding — estás a meio do mapa inicial.",
    };
  }

  if (!completed("emergency-fund")) {
    return {
      methodId: "emergency-fund",
      reason: "Prioriza um colchão de emergência antes de investir.",
    };
  }

  if (!completed("rule-50-30-20")) {
    return {
      methodId: "rule-50-30-20",
      reason: "Tens bases sólidas — aplica 50/30/20 ao teu fluxo mensal.",
    };
  }

  return {
    methodId: "weekly-money-review",
    reason: "Mantém o hábito com 15 minutos de revisão por semana.",
  };
}

export function getSuggestedMethod(
  methods: FinanceMethod[],
  suggestion: MethodSuggestion | null
): FinanceMethod | null {
  if (!suggestion) return null;
  return methods.find((m) => m.id === suggestion.methodId) ?? null;
}
