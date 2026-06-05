import type { CaseAppMode, CaseContextSnapshot } from "./case-types";

export type CaseInsightPriority = "high" | "medium" | "low";

export type CaseInsightItem = {
  id: string;
  priority: CaseInsightPriority;
  text: string;
  /** Prompt pré-preenchido ao abrir o chat. */
  prompt: string;
  mode: CaseAppMode;
};

export function buildCaseInsights(ctx: CaseContextSnapshot, limit = 5): CaseInsightItem[] {
  const items: CaseInsightItem[] = [];
  const f = ctx.finance;
  const focus = ctx.focus;

  if (f.enabled && f.weeklyReviewPending) {
    items.push({
      id: "finance-weekly-review",
      priority: "high",
      text: "Revisão semanal pendente — fecha o ritual em Finanças.",
      prompt: "O que devo rever na minha revisão semanal desta semana?",
      mode: "finance",
    });
  }

  if (f.enabled && f.overBudgetCount > 0) {
    items.push({
      id: "finance-over-budget",
      priority: "high",
      text:
        f.overBudgetCount === 1
          ? "1 envelope acima do tecto este mês."
          : `${f.overBudgetCount} envelopes acima do tecto este mês.`,
      prompt: "Quais categorias estão acima do orçamento e o que posso fazer?",
      mode: "finance",
    });
  }

  if (f.enabled && f.accountCount > 0 && f.savingsRate < 10 && f.monthIncome > 0) {
    items.push({
      id: "finance-low-savings",
      priority: "medium",
      text: `Taxa de poupança baixa (${f.savingsRate}%) — vale a pena rever despesas.`,
      prompt: "Como posso melhorar a minha taxa de poupança este mês?",
      mode: "finance",
    });
  }

  if (f.enabled && f.accountCount === 0) {
    items.push({
      id: "finance-no-accounts",
      priority: "medium",
      text: "Ainda não tens contas registadas — começa por aí para ver números reais.",
      prompt: "Ajuda-me a criar a minha primeira conta financeira.",
      mode: "finance",
    });
  }

  if (focus.habitsTotal > 0 && focus.habitsDoneToday < focus.habitsTotal) {
    const left = focus.habitsTotal - focus.habitsDoneToday;
    items.push({
      id: "focus-habits-pending",
      priority: "medium",
      text:
        left === 1
          ? "Falta 1 hábito para fechar o dia."
          : `Faltam ${left} hábitos para fechar o dia (${focus.habitsDoneToday}/${focus.habitsTotal}).`,
      prompt: "Quais hábitos devo priorizar ainda hoje?",
      mode: "focus",
    });
  }

  if (focus.tasksOpen > 0 && focus.focusTasks.length > 0) {
    items.push({
      id: "focus-priority-task",
      priority: "medium",
      text: `Prioridade sugerida: «${focus.focusTasks[0]}».`,
      prompt: `Ajuda-me a planear a tarefa: ${focus.focusTasks[0]}`,
      mode: "focus",
    });
  } else if (focus.tasksOpen >= 5) {
    items.push({
      id: "focus-many-tasks",
      priority: "low",
      text: `${focus.tasksOpen} tarefas em aberto — escolhe 1–3 para hoje.`,
      prompt: "Ajuda-me a escolher o foco do dia entre as minhas tarefas.",
      mode: "focus",
    });
  }

  if (f.enabled && f.activeMethodName && f.activeMethodStep) {
    items.push({
      id: "finance-method-step",
      priority: "low",
      text: `Método «${f.activeMethodName}»: ${f.activeMethodStep}`,
      prompt: `Qual o próximo passo do método ${f.activeMethodName}?`,
      mode: "finance",
    });
  }

  if (ctx.game.enabled && ctx.game.level > 0) {
    items.push({
      id: "game-progress",
      priority: "low",
      text: `Nível ${ctx.game.level} (${ctx.game.rankTitle}) — ${ctx.game.totalXp} XP total.`,
      prompt: "O que falta para subir de nível?",
      mode: "game",
    });
  }

  const order: Record<CaseInsightPriority, number> = { high: 0, medium: 1, low: 2 };
  return items
    .sort((a, b) => order[a.priority] - order[b.priority])
    .slice(0, limit);
}
