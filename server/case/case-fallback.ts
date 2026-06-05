import { caseBullet, caseHeading, caseParagraph, caseSection } from "./case-format";
import type { CaseContextSnapshot } from "./case-types";

function fmtMoney(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function financeSection(ctx: CaseContextSnapshot): string[] {
  const f = ctx.finance;
  const cur = f.currency;
  if (!f.enabled || f.accountCount === 0) return [];

  const bullets = [
    caseBullet("Património líquido", fmtMoney(f.netWorth, cur)),
    caseBullet("Fluxo do mês", fmtMoney(f.monthNet, cur)),
    caseBullet("Receitas", fmtMoney(f.monthIncome, cur)),
    caseBullet("Despesas", fmtMoney(f.monthExpense, cur)),
    caseBullet("Taxa de poupança", `${f.savingsRate}%`),
  ];

  if (f.activeMethodName) {
    bullets.push(caseBullet("Método activo", f.activeMethodName));
  }
  if (f.totalDebt > 0) {
    bullets.push(caseBullet("Dívida total", fmtMoney(f.totalDebt, cur)));
  }
  if (f.overBudgetCount > 0) {
    bullets.push(caseBullet("Envelopes acima do tecto", String(f.overBudgetCount)));
  }
  if (f.weeklyReviewPending) {
    bullets.push("- Revisão semanal **pendente** — fecha-a em Finanças.");
  }

  return bullets;
}

function focusSection(ctx: CaseContextSnapshot): string[] {
  const focus = ctx.focus;
  const bullets = [
    caseBullet("Hábitos hoje", `${focus.habitsDoneToday}/${focus.habitsTotal}`),
    caseBullet("Tarefas em aberto", String(focus.tasksOpen)),
    caseBullet("Pontos hoje", String(focus.pointsToday)),
  ];

  for (const [i, t] of focus.focusTasks.slice(0, 3).entries()) {
    bullets.push(caseBullet(`Prioridade ${i + 1}`, t));
  }

  return bullets;
}

function gameSection(ctx: CaseContextSnapshot): string[] {
  if (!ctx.game.enabled) return [];
  const g = ctx.game;
  return [
    caseBullet("Nível", `${g.level} — ${g.rankTitle}`),
    caseBullet("XP total", String(g.totalXp)),
    caseBullet("LifeCoins", String(g.lifeCoins)),
  ];
}

function buildDaySummary(ctx: CaseContextSnapshot): string {
  const parts = [caseHeading("O teu dia", 2), ""];

  const finance = financeSection(ctx);
  if (finance.length) {
    parts.push(caseSection("Finanças", finance));
  } else {
    parts.push(caseSection("Finanças", [
      "- Ainda sem contas — cria uma em **Modo Finanças** para ver números reais.",
    ]));
  }

  parts.push(caseSection("Foco", focusSection(ctx)));

  const game = gameSection(ctx);
  if (game.length) {
    parts.push(caseSection("Game", game));
  }

  parts.push(
    caseHeading("Próximo passo", 3),
    "",
    caseParagraph(
      "Pergunta sobre o **mês**, **categorias de gasto**, **método activo** ou **dívidas** — respondo com os teus dados."
    ).trim()
  );

  return parts.join("\n").trim();
}

export function caseFallbackReply(message: string, ctx: CaseContextSnapshot): string {
  const q = message.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  const f = ctx.finance;
  const cur = f.currency;

  if (!f.enabled || f.accountCount === 0) {
    return [
      caseHeading("Finanças por configurar", 2),
      "",
      caseParagraph(
        "Ainda não tens contas em Finanças. Cria pelo menos uma conta à ordem no **Modo Finanças** — depois consigo explicar o teu mês e métodos com dados reais."
      ).trim(),
    ].join("\n");
  }

  if (/dia|hoje|como esta|como estao|resumo/.test(q)) {
    return buildDaySummary(ctx);
  }

  if (/divida|snowball|avalanche|emprestimo|cartao/.test(q)) {
    if (f.totalDebt <= 0) {
      return [
        caseHeading("Dívidas", 2),
        "",
        caseParagraph(
          "Não há dívidas registadas — óptimo sinal. Se tiveres cartão ou crédito, adiciona como conta passivo para os métodos **Snowball** e **Avalanche** funcionarem."
        ).trim(),
      ].join("\n");
    }
    return [
      caseHeading("Dívidas", 2),
      "",
      caseSection("Resumo", [caseBullet("Total em dívida", fmtMoney(f.totalDebt, cur))]),
      caseHeading("O que fazer", 3),
      "",
      "- Abre o painel **Dívidas** na home Finanças.",
      "- Compara ordem **Snowball** vs **Avalanche**.",
      "- Prioriza extra na dívida que o método indicar.",
    ].join("\n").trim();
  }

  if (/metodo|50\/30|paga|primeiro|passo|programa/.test(q)) {
    if (!f.activeMethodName) {
      return [
        caseHeading("Método financeiro", 2),
        "",
        caseParagraph(
          "Sem método activo. Vai a **Finanças → Métodos** e escolhe um (ex.: Primeiros 30 dias ou Paga-te a ti primeiro)."
        ).trim(),
      ].join("\n");
    }
    const bullets = [caseBullet("Programa", f.activeMethodName)];
    if (f.activeMethodStep) {
      bullets.push(caseBullet("Próximo passo", f.activeMethodStep));
    }
    return [
      caseHeading("Método activo", 2),
      "",
      caseSection("Estado", bullets),
      caseParagraph("Segue os passos na home ou na página do método."),
    ].join("\n").trim();
  }

  if (/gast|despesa|categoria|onde|aliment|top/.test(q)) {
    if (!f.topExpenseCategories.length) {
      return [
        caseHeading("Despesas por categoria", 2),
        "",
        caseParagraph(
          "Sem despesas categorizadas este mês. Regista movimentos com categoria — assim mostro onde o dinheiro sai."
        ).trim(),
      ].join("\n");
    }
    const bullets = f.topExpenseCategories.map(
      (c) => caseBullet(c.name, fmtMoney(c.total, cur))
    );
    bullets.push(caseBullet("Total despesas", fmtMoney(f.monthExpense, cur)));
    return [caseHeading("Onde gastas mais", 2), "", caseSection("Top categorias", bullets)].join(
      "\n"
    ).trim();
  }

  if (/mes|receita|poupan|taxa|fluxo|resumo|como estou/.test(q)) {
    const bullets = [
      caseBullet("Receitas", fmtMoney(f.monthIncome, cur)),
      caseBullet("Despesas", fmtMoney(f.monthExpense, cur)),
      caseBullet("Líquido", fmtMoney(f.monthNet, cur)),
      caseBullet("Taxa de poupança", `${f.savingsRate}%`),
      caseBullet("Património líquido", fmtMoney(f.netWorth, cur)),
    ];
    if (f.overBudgetCount > 0) {
      bullets.push(caseBullet("Envelopes acima do tecto", String(f.overBudgetCount)));
    }
    if (f.weeklyReviewPending) {
      bullets.push("- Revisão semanal **pendente**.");
    }
    return [caseHeading("Resumo do mês", 2), "", caseSection("Números", bullets)].join("\n").trim();
  }

  if (/patrimon|liquido|saldo|total/.test(q)) {
    return [
      caseHeading("Património", 2),
      "",
      caseSection("Agregados", [
        caseBullet("Património líquido", fmtMoney(f.netWorth, cur)),
        caseBullet("Contas activas", String(f.accountCount)),
        caseBullet("Fluxo do mês", fmtMoney(f.monthNet, cur)),
      ]),
    ].join("\n").trim();
  }

  if (/foco|tarefa|habito|agora|prioriz/.test(q)) {
    return [
      caseHeading("Foco de hoje", 2),
      "",
      caseSection("Estado", focusSection(ctx)),
    ].join("\n").trim();
  }

  if (/nivel|xp|game|rpg|moeda/.test(q) && ctx.game.enabled) {
    return [caseHeading("Game Mode", 2), "", caseSection("Progresso", gameSection(ctx))].join(
      "\n"
    ).trim();
  }

  return buildDaySummary(ctx);
}
