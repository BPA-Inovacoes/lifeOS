/** Mapeamento do questionário F1.1 (6 perguntas) → método sugerido */

export type FinanceShortTermGoal = "pay_debt" | "save" | "organize";

export type FinanceQuestionnaireAnswers = {
  hasHighInterestDebt: boolean;
  incomeType: "fixed" | "variable";
  hasEmergencyFund: boolean;
  weeklyTime: "minimal" | "moderate" | "full";
  wantsGameLink: boolean;
  shortTermGoal: FinanceShortTermGoal;
};

export type QuestionnaireSuggestion = {
  methodId: string;
  reason: string;
};

export function suggestMethodFromQuestionnaire(
  answers: FinanceQuestionnaireAnswers,
  context: { hasAccounts: boolean; hasChecking: boolean; hasSavings: boolean }
): QuestionnaireSuggestion {
  if (!context.hasAccounts || !context.hasChecking || !context.hasSavings) {
    return {
      methodId: "first-30-days",
      reason: "Começa por mapear contas à ordem e poupança — trilho guiado de 30 dias.",
    };
  }

  if (answers.hasHighInterestDebt || answers.shortTermGoal === "pay_debt") {
    return {
      methodId: "debt-avalanche",
      reason:
        answers.shortTermGoal === "pay_debt" && !answers.hasHighInterestDebt
          ? "Objectivo de reduzir dívida — foco na ordem que paga menos juro no total."
          : "Dívidas com juro alto — prioriza a taxa mais elevada para pagar menos no total.",
    };
  }

  if (!answers.hasEmergencyFund) {
    return {
      methodId: "emergency-fund",
      reason: "Ainda sem colchão de emergência — segurança antes de optimizar ou investir.",
    };
  }

  if (answers.shortTermGoal === "save") {
    return {
      methodId: answers.wantsGameLink ? "envelope-budget" : "rule-50-30-20",
      reason: answers.wantsGameLink
        ? "Objectivo de poupar — envelopes com tectos canalizam o excedente mês a mês."
        : "Objectivo de poupar — 50/30/20 define quanto reservar em cada mês.",
    };
  }

  if (answers.shortTermGoal === "organize") {
    if (answers.weeklyTime === "minimal") {
      return {
        methodId: "weekly-money-review",
        reason: "Organizar com pouco tempo — revisão semanal de 15 minutos mantém o controlo.",
      };
    }
    return {
      methodId: "first-30-days",
      reason: "Organizar hábitos e registo — trilho guiado de 30 dias para pôr tudo em ordem.",
    };
  }

  if (answers.incomeType === "variable") {
    return {
      methodId: "variable-income",
      reason: "Renda variável — base + pico + fundo para meses mais fracos.",
    };
  }

  if (answers.weeklyTime === "minimal") {
    return {
      methodId: "weekly-money-review",
      reason: "Pouco tempo por semana — ritual de 15 minutos mantém consciência sem sobrecarga.",
    };
  }

  if (answers.weeklyTime === "full") {
    return {
      methodId: "first-30-days",
      reason: "Tens tempo para um reset completo — fortalece hábitos e registo nos próximos 30 dias.",
    };
  }

  if (answers.wantsGameLink) {
    return {
      methodId: "envelope-budget",
      reason: "Orçamento por envelopes com tectos — combina bem com missões no Game Mode.",
    };
  }

  return {
    methodId: "rule-50-30-20",
    reason: "Renda estável e bases ok — framework 50/30/20 como bússola mensal.",
  };
}
