import { DEFAULT_FINANCE_CURRENCY } from "@/modules/finance/financeCurrencies";
import { formatMoney } from "@/services/financeApi";
import type {
  FinanceAccount,
  FinanceMethod,
  FinanceMovement,
} from "@/services/financeApi";

export type MethodReadiness = "ready" | "partial" | "blocked" | "completed";

export type MethodApplicationGuide = {
  readiness: MethodReadiness;
  summary: string;
  steps: string[];
  metric?: string;
};

export type FinanceActivitySnapshot = {
  currency: string;
  activeAccounts: FinanceAccount[];
  checking: FinanceAccount[];
  savings: FinanceAccount[];
  liabilities: FinanceAccount[];
  investments: FinanceAccount[];
  totalSavingsBalance: number;
  totalDebtBalance: number;
  monthIncome: number;
  monthExpense: number;
  savingsRate: number;
  expenseCount: number;
  incomeCount: number;
  transferCount: number;
  expensesLast7Days: number;
  topExpenseCategories: { name: string; total: number }[];
  incomeByMonth: { key: string; total: number }[];
  incomeVariability: "stable" | "moderate" | "variable" | "unknown";
  emergencyMonths: number | null;
  checkingName: string | null;
  savingsName: string | null;
  smallestDebt: FinanceAccount | null;
  highestDebt: FinanceAccount | null;
  highestAprDebt: FinanceAccount | null;
};

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function isThisMonth(dateStr: string): boolean {
  const now = new Date();
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return monthKey(dateStr) === key;
}

function isWithinDays(dateStr: string, days: number): boolean {
  const d = new Date(dateStr);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return d >= cutoff;
}

export function buildFinanceActivitySnapshot(input: {
  accounts: FinanceAccount[];
  movements: FinanceMovement[];
  currency?: string;
}): FinanceActivitySnapshot {
  const { accounts, movements, currency = DEFAULT_FINANCE_CURRENCY } = input;
  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const checking = activeAccounts.filter((a) => a.type === "CHECKING");
  const savings = activeAccounts.filter((a) => a.type === "SAVINGS");
  const liabilities = activeAccounts.filter((a) => a.isLiability && Math.abs(a.balance) > 0);
  const investments = activeAccounts.filter((a) => a.type === "INVESTMENT");

  const monthIncome = movements
    .filter((m) => m.type === "INCOME" && isThisMonth(m.date))
    .reduce((s, m) => s + m.amount, 0);
  const monthExpense = movements
    .filter((m) => m.type === "EXPENSE" && isThisMonth(m.date))
    .reduce((s, m) => s + m.amount, 0);
  const savingsRate =
    monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0;

  const expenseCount = movements.filter((m) => m.type === "EXPENSE").length;
  const incomeCount = movements.filter((m) => m.type === "INCOME").length;
  const transferCount = movements.filter((m) => m.type === "TRANSFER").length;
  const expensesLast7Days = movements.filter(
    (m) => m.type === "EXPENSE" && isWithinDays(m.date, 7)
  ).length;

  const categoryTotals = new Map<string, number>();
  for (const m of movements) {
    if (m.type !== "EXPENSE" || !m.categoryName) continue;
    categoryTotals.set(m.categoryName, (categoryTotals.get(m.categoryName) ?? 0) + m.amount);
  }
  const topExpenseCategories = [...categoryTotals.entries()]
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const incomeMonthMap = new Map<string, number>();
  for (const m of movements) {
    if (m.type !== "INCOME") continue;
    const key = monthKey(m.date);
    incomeMonthMap.set(key, (incomeMonthMap.get(key) ?? 0) + m.amount);
  }
  const incomeByMonth = [...incomeMonthMap.entries()]
    .map(([key, total]) => ({ key, total }))
    .sort((a, b) => b.key.localeCompare(a.key))
    .slice(0, 6);

  let incomeVariability: FinanceActivitySnapshot["incomeVariability"] = "unknown";
  if (incomeByMonth.length >= 2) {
    const totals = incomeByMonth.slice(0, 3).map((m) => m.total);
    const avg = totals.reduce((a, b) => a + b, 0) / totals.length;
    const maxDev = Math.max(...totals.map((t) => Math.abs(t - avg)));
    const ratio = avg > 0 ? maxDev / avg : 0;
    if (ratio < 0.15) incomeVariability = "stable";
    else if (ratio < 0.35) incomeVariability = "moderate";
    else incomeVariability = "variable";
  } else if (incomeCount > 0) {
    incomeVariability = "stable";
  }

  const totalSavingsBalance = savings.reduce((s, a) => s + a.balance, 0);
  const totalDebtBalance = liabilities.reduce((s, a) => s + Math.abs(a.balance), 0);

  const avgMonthlyExpense =
    monthExpense > 0
      ? monthExpense
      : movements
          .filter((m) => m.type === "EXPENSE" && isWithinDays(m.date, 30))
          .reduce((s, m) => s + m.amount, 0);

  const emergencyMonths =
    avgMonthlyExpense > 0 && totalSavingsBalance > 0
      ? Math.round((totalSavingsBalance / avgMonthlyExpense) * 10) / 10
      : null;

  const smallestDebt =
    liabilities.length > 0
      ? [...liabilities].sort((a, b) => Math.abs(a.balance) - Math.abs(b.balance))[0]
      : null;
  const highestDebt =
    liabilities.length > 0
      ? [...liabilities].sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))[0]
      : null;
  const highestAprDebt =
    liabilities.length > 0
      ? [...liabilities].sort((a, b) => {
          const aprA = a.aprPercent ?? -1;
          const aprB = b.aprPercent ?? -1;
          if (aprB !== aprA) return aprB - aprA;
          return Math.abs(b.balance) - Math.abs(a.balance);
        })[0]
      : null;

  return {
    currency,
    activeAccounts,
    checking,
    savings,
    liabilities,
    investments,
    totalSavingsBalance,
    totalDebtBalance,
    monthIncome,
    monthExpense,
    savingsRate,
    expenseCount,
    incomeCount,
    transferCount,
    expensesLast7Days,
    topExpenseCategories,
    incomeByMonth,
    incomeVariability,
    emergencyMonths,
    checkingName: checking[0]?.name ?? null,
    savingsName: savings[0]?.name ?? null,
    smallestDebt,
    highestDebt,
    highestAprDebt,
  };
}

function fmt(amount: number, currency: string): string {
  return formatMoney(amount, currency);
}

function pct(amount: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((amount / total) * 100);
}

function guide(
  partial: Omit<MethodApplicationGuide, "readiness"> & { readiness?: MethodReadiness }
): MethodApplicationGuide {
  return { readiness: partial.readiness ?? "partial", ...partial };
}

export function getMethodApplicationGuide(
  methodId: string,
  snapshot: FinanceActivitySnapshot,
  method?: Pick<FinanceMethod, "completed" | "active" | "stepIndex">
): MethodApplicationGuide {
  const { currency } = snapshot;

  if (method?.completed) {
    return guide({
      readiness: "completed",
      summary: "Já concluíste este método — mantém o hábito ou combina com outro programa.",
      steps: ["Revê mensalmente se ainda faz sentido para a tua fase actual."],
    });
  }

  switch (methodId) {
    case "first-30-days":
      if (snapshot.activeAccounts.length === 0) {
        return guide({
          readiness: "blocked",
          summary: "Ainda não mapeaste o teu dinheiro — este método começa por aí.",
          steps: [
            "Cria uma conta à ordem com o saldo actual.",
            "Adiciona uma conta poupança (mesmo subconta).",
            "Regista a tua receita mensal e 3–5 despesas reais.",
          ],
        });
      }
      if (!snapshot.checking.length) {
        return guide({
          readiness: "blocked",
          summary: "Falta a conta à ordem — onde entra salário e saem despesas.",
          steps: [
            "Cria «Conta à ordem» com saldo de hoje.",
            snapshot.savings.length
              ? `Liga despesas à ${snapshot.savingsName ?? "poupança"} só para reservas.`
              : "Depois cria poupança separada do corrente.",
          ],
        });
      }
      if (!snapshot.savings.length) {
        return guide({
          readiness: "partial",
          summary: `Tens ${snapshot.checkingName ?? "corrente"} — falta poupança dedicada.`,
          steps: [
            "Cria conta poupança com saldo actual (mesmo que pequeno).",
            "Regista uma transferência simbólica corrente → poupança.",
            "Define meta de 1 mês de despesas como primeiro alvo.",
          ],
        });
      }
      if (snapshot.expenseCount < 3) {
        return guide({
          readiness: "partial",
          summary: "Contas prontas — precisas de mais dados de gastos para o mapa ficar útil.",
          steps: [
            `Regista despesas reais na ${snapshot.checkingName ?? "conta à ordem"}.`,
            "Categoriza pelo menos 5 movimentos desta semana.",
            "Completa a revisão semanal quando tiveres 7 dias de registo.",
          ],
          metric: `${snapshot.expenseCount} despesas registadas`,
        });
      }
      return guide({
        readiness: "ready",
        summary: "Tens base sólida — segue os passos para consolidar hábitos em 30 dias.",
        steps: [
          snapshot.transferCount === 0
            ? "Faz a primeira transferência para poupança (mesmo 10€)."
            : `Mantém transferências regulares para ${snapshot.savingsName ?? "poupança"}.`,
          snapshot.savingsRate >= 0
            ? `Taxa actual: ${snapshot.savingsRate}% — meta inicial 10%.`
            : "Calcula quanto entrou vs saiu este mês.",
          "Quatro revisões semanais = hábito formado.",
        ],
        metric:
          snapshot.monthIncome > 0
            ? `${fmt(snapshot.monthIncome, currency)} receita · ${snapshot.savingsRate}% poupança`
            : undefined,
      });

    case "rule-50-30-20":
      if (snapshot.monthIncome <= 0) {
        return guide({
          readiness: "blocked",
          summary: "Precisas de receita mensal registada para dividir 50/30/20.",
          steps: [
            "Regista o salário ou rendimento líquido deste mês.",
            "Soma despesas fixas (renda, utilities, transportes).",
            "Depois aplica os tectos 50% · 30% · 20%.",
          ],
        });
      }
      const need50 = Math.round(snapshot.monthIncome * 0.5);
      const want30 = Math.round(snapshot.monthIncome * 0.3);
      const save20 = Math.round(snapshot.monthIncome * 0.2);
      const actualNeedsPct = pct(snapshot.monthExpense, snapshot.monthIncome);
      return guide({
        readiness: snapshot.expenseCount >= 5 ? "ready" : "partial",
        summary:
          actualNeedsPct > 55
            ? `Gastaste ${actualNeedsPct}% da receita — pode estar acima das «necessidades».`
            : `Com ${fmt(snapshot.monthIncome, currency)}/mês, aplica os tectos abaixo.`,
        steps: [
          `50% necessidades: até ${fmt(need50, currency)} (renda, comida, transportes).`,
          `30% desejos: até ${fmt(want30, currency)} (lazer, compras extra).`,
          `20% futuro: ${fmt(save20, currency)} para poupança ou dívida extra.`,
          snapshot.topExpenseCategories[0]
            ? `Maior categoria: ${snapshot.topExpenseCategories[0].name} (${fmt(snapshot.topExpenseCategories[0].total, currency)}).`
            : "Categoriza despesas para ver onde cortar desejos.",
        ],
        metric: `50 · 30 · 20 sobre ${fmt(snapshot.monthIncome, currency)}`,
      });

    case "emergency-fund":
      if (!snapshot.savings.length) {
        return guide({
          readiness: "blocked",
          summary: "Cria primeiro uma conta poupança só para emergências.",
          steps: [
            "Conta separada do corrente — reduz tentação de gastar.",
            "Calcula despesas mensais (fixas + média variável).",
            "Primeira meta: 1 mês de despesas na poupança.",
          ],
        });
      }
      const monthlyNeed =
        snapshot.monthExpense > 0
          ? snapshot.monthExpense
          : snapshot.topExpenseCategories.reduce((s, c) => s + c.total, 0);
      const target1 = monthlyNeed > 0 ? monthlyNeed : null;
      const target3 = monthlyNeed > 0 ? monthlyNeed * 3 : null;
      return guide({
        readiness:
          snapshot.emergencyMonths !== null && snapshot.emergencyMonths >= 3
            ? "ready"
            : snapshot.emergencyMonths !== null && snapshot.emergencyMonths >= 1
              ? "partial"
              : "partial",
        summary:
          snapshot.emergencyMonths !== null && snapshot.emergencyMonths >= 1
            ? `Tens ~${snapshot.emergencyMonths} mês(es) de colchão em ${snapshot.savingsName ?? "poupança"}.`
            : `Tens ${fmt(snapshot.totalSavingsBalance, currency)} em poupança — define meta clara.`,
        steps: [
          target1
            ? `Meta 1: ${fmt(target1, currency)} (1 mês de despesas).`
            : "Regista despesas do mês para calcular a meta.",
          target3 ? `Meta 2: ${fmt(target3, currency)} (3 meses).` : "Transferência fixa mensal para poupança.",
          snapshot.transferCount === 0
            ? "Agenda transferência automática no dia após salário."
            : "Não uses esta poupança excepto emergência real.",
        ],
        metric:
          snapshot.totalSavingsBalance > 0
            ? `${fmt(snapshot.totalSavingsBalance, currency)} reservados`
            : undefined,
      });

    case "pay-yourself-first":
      if (!snapshot.savings.length || !snapshot.checking.length) {
        return guide({
          readiness: "blocked",
          summary: "Precisas de corrente + poupança para pagares a ti primeiro.",
          steps: [
            "Conta à ordem para receitas e despesas.",
            "Poupança separada — destino da «primeira transferência».",
            "Define % ou valor fixo antes de gastar o resto.",
          ],
        });
      }
      const suggestSave =
        snapshot.monthIncome > 0
          ? Math.max(Math.round(snapshot.monthIncome * 0.1), 25)
          : 50;
      return guide({
        readiness: snapshot.transferCount > 0 ? "ready" : "partial",
        summary:
          snapshot.transferCount > 0
            ? "Já transferes para poupança — formaliza como regra no dia do salário."
            : `No dia do salário, move ${fmt(suggestSave, currency)} para ${snapshot.savingsName ?? "poupança"} antes de gastar.`,
        steps: [
          `Valor sugerido: ${fmt(suggestSave, currency)} ou 10% da receita.`,
          "Trata como despesa fixa no orçamento — «Pagar a mim».",
          snapshot.incomeCount > 0
            ? "Regista a transferência como movimento TRANSFER na app."
            : "Regista primeiro a receita mensal para calcular o %.",
        ],
      });

    case "envelope-budget":
      if (snapshot.expenseCount < 5) {
        return guide({
          readiness: "blocked",
          summary: "Regista despesas categorizadas — os «envelopes» nascem dos teus hábitos reais.",
          steps: [
            "Regista pelo menos 10 despesas com categoria.",
            "Identifica 3–5 categorias onde mais gastas.",
            "Define tecto mensal por categoria com base no histórico.",
          ],
        });
      }
      const envelopes = snapshot.topExpenseCategories.slice(0, 4);
      return guide({
        readiness: envelopes.length >= 3 ? "ready" : "partial",
        summary: "Usa as tuas categorias actuais como envelopes com tecto mensal.",
        steps: [
          ...envelopes.map(
            (c) =>
              `«${c.name}»: gastaste ${fmt(c.total, currency)} — define tecto e regista cada despesa.`
          ),
          "A meio do mês, confere quais envelopes estão perto do limite.",
        ],
        metric: `${envelopes.length} categorias principais`,
      });

    case "variable-income":
      if (snapshot.incomeVariability === "stable" && snapshot.incomeCount >= 2) {
        return guide({
          readiness: "partial",
          summary: "A tua receita parece estável — este método é mais útil se fores freelance ou irregular.",
          steps: [
            "Se tens salário fixo, considera 50/30/20 ou paga-te a ti primeiro.",
            "Se há bónus ou comissões, usa o extra para poupança.",
            "Regista meses atípicos para não distorcer a média.",
          ],
        });
      }
      const avgIncome =
        snapshot.incomeByMonth.length > 0
          ? Math.round(
              snapshot.incomeByMonth.slice(0, 3).reduce((s, m) => s + m.total, 0) /
                Math.min(snapshot.incomeByMonth.length, 3)
            )
          : 0;
      return guide({
        readiness: snapshot.incomeByMonth.length >= 2 ? "ready" : "partial",
        summary:
          snapshot.incomeVariability === "variable"
            ? "Receita irregular detectada — orçamenta pela média, não pelo melhor mês."
            : "Regista receitas de 2–3 meses para calcular a base segura.",
        steps: [
          avgIncome > 0
            ? `Média recente: ${fmt(avgIncome, currency)}/mês — vive abaixo disto.`
            : "Regista receitas dos últimos 3 meses.",
          snapshot.savings.length
            ? `Usa ${snapshot.savingsName ?? "poupança"} como fundo «mês fraco».`
            : "Cria poupança dedicada a meses fracos.",
          "Nos meses bons: metade do extra → poupança, metade → fundo fraco.",
        ],
        metric:
          snapshot.incomeByMonth.length >= 2
            ? `Variação: ${snapshot.incomeVariability === "variable" ? "alta" : "moderada"}`
            : undefined,
      });

    case "debt-snowball":
      if (!snapshot.liabilities.length) {
        return guide({
          readiness: "blocked",
          summary: "Sem dívidas registadas — adiciona cartões ou empréstimos como contas passivo.",
          steps: [
            "Cria conta tipo cartão ou empréstimo com saldo em dívida.",
            "Lista todas as dívidas antes de escolher estratégia.",
            "Se não tens dívidas, considera fundo de emergência.",
          ],
        });
      }
      const ordered = [...snapshot.liabilities].sort(
        (a, b) => Math.abs(a.balance) - Math.abs(b.balance)
      );
      return guide({
        readiness: "ready",
        summary: `${snapshot.liabilities.length} dívida(s) — ataca primeiro a mais pequena para ganhar momentum.`,
        steps: [
          `Alvo #1: ${ordered[0].name} (${fmt(Math.abs(ordered[0].balance), currency)}).`,
          "Paga mínimos em todas as restantes.",
          `Todo o extra vai para ${ordered[0].name} até zero.`,
          ordered[1]
            ? `Depois: ${ordered[1].name} (${fmt(Math.abs(ordered[1].balance), currency)}).`
            : "Celebra cada dívida liquidada antes da seguinte.",
        ],
        metric: `${fmt(snapshot.totalDebtBalance, currency)} em dívida total`,
      });

    case "debt-avalanche":
      if (!snapshot.liabilities.length) {
        return guide({
          readiness: "blocked",
          summary: "Regista dívidas com saldo — a avalanche prioriza a que mais custa em juros.",
          steps: [
            "Adiciona cada crédito/cartão como conta passivo.",
            "Anota taxa de juro (TAEG) na nota da conta se souberes.",
            "Ataca a dívida mais cara com pagamentos extra.",
          ],
        });
      }
      const avaTarget = snapshot.highestAprDebt ?? snapshot.highestDebt;
      const aprNote =
        avaTarget?.aprPercent != null ? ` · ${avaTarget.aprPercent}% TAEG` : "";
      return guide({
        readiness: "ready",
        summary: "Minimiza juros pagos — concentra extra na dívida que mais «come» rendimento.",
        steps: [
          avaTarget
            ? `Prioridade: ${avaTarget.name} (${fmt(Math.abs(avaTarget.balance), currency)}${aprNote}).`
            : "Ordena dívidas do maior para o menor juro.",
          "Mínimos em todas — nunca falhar prestações.",
          "Regista pagamentos extra como despesas na conta certa.",
          `Total em dívida: ${fmt(snapshot.totalDebtBalance, currency)}.`,
        ],
        metric: `${snapshot.liabilities.length} crédito(s) activos`,
      });

    case "no-spend-challenge":
      const discretionary = snapshot.topExpenseCategories.slice(0, 2);
      return guide({
        readiness: snapshot.expenseCount >= 3 ? "ready" : "partial",
        summary:
          discretionary.length > 0
            ? `Desafio: reduzir «${discretionary.map((c) => c.name).join("» e «")}» durante 7–30 dias.`
            : "Define regras claras — o que é gasto vs permitido.",
        steps: [
          "Escolhe 7 dias (intro) ou 30 dias (completo).",
          "Excepções: mercado, transportes, medicamentos — planeadas.",
          snapshot.expensesLast7Days > 0
            ? `${snapshot.expensesLast7Days} despesas nos últimos 7 dias — regista impulsos evitados.`
            : "Regista impulsos (o que quiseste comprar e porquê).",
        ],
      });

    case "weekly-money-review":
      return guide({
        readiness: snapshot.activeAccounts.length > 0 ? "ready" : "partial",
        summary: "15 minutos fixos por semana — usa os teus dados reais da app.",
        steps: [
          snapshot.activeAccounts.length
            ? `Confere saldos: ${snapshot.activeAccounts.slice(0, 3).map((a) => a.name).join(", ")}${snapshot.activeAccounts.length > 3 ? "…" : ""}.`
            : "Cria contas antes de iniciar o ritual.",
          snapshot.monthIncome > 0 || snapshot.monthExpense > 0
            ? `Esta semana/mês: +${fmt(snapshot.monthIncome, currency)} / −${fmt(snapshot.monthExpense, currency)}.`
            : "Pergunta: quanto entrou? Quanto saiu? Segui o plano?",
          "Uma melhoria concreta para a semana seguinte.",
          "Regista a revisão em Finanças → Revisão.",
        ],
      });

    case "savings-rate-20":
      if (snapshot.monthIncome <= 0) {
        return guide({
          readiness: "blocked",
          summary: "Regista receita do mês para medir e subir a taxa de poupança.",
          steps: [
            "Receita + despesas do mês actual.",
            "Taxa = (receita − despesas) ÷ receita.",
            "Meta: 20% ou +2 p.p. por mês até lá.",
          ],
        });
      }
      const gap = 20 - snapshot.savingsRate;
      return guide({
        readiness: snapshot.savingsRate >= 15 ? "ready" : "partial",
        summary:
          snapshot.savingsRate >= 20
            ? `Taxa actual ${snapshot.savingsRate}% — meta atingida, mantém o ritmo.`
            : `Taxa actual ${snapshot.savingsRate}% — faltam ${Math.max(gap, 0)} p.p. para 20%.`,
        steps: [
          `Precisas de poupar mais ${fmt(Math.round(snapshot.monthIncome * 0.2 - (snapshot.monthIncome - snapshot.monthExpense)), currency)}/mês para 20%.`,
          snapshot.topExpenseCategories[0]
            ? `Alavanca: reduzir «${snapshot.topExpenseCategories[0].name}».`
            : "Identifica 1–2 categorias para cortar ou aumentar receita.",
          "Automatiza incremento na transferência poupança.",
        ],
        metric: `${snapshot.savingsRate}% → meta 20%`,
      });

    case "intro-investing":
      if (snapshot.emergencyMonths !== null && snapshot.emergencyMonths < 3) {
        return guide({
          readiness: "blocked",
          summary: `Colchão ~${snapshot.emergencyMonths ?? 0} mês(es) — prioriza 3 meses antes de investir.`,
          steps: [
            "Completa fundo de emergência (3 meses de despesas).",
            snapshot.savingsName
              ? `Continua a reforçar ${snapshot.savingsName}.`
              : "Separa poupança de emergência do corrente.",
            "Investir sem colchão = vender em pânico numa queda.",
          ],
        });
      }
      return guide({
        readiness: snapshot.investments.length ? "ready" : "partial",
        summary:
          snapshot.investments.length
            ? "Tens conta investimento — mantém aportes regulares pequenos."
            : "Com colchão ok — começa com valor simbólico mensal (25–50€).",
        steps: [
          snapshot.emergencyMonths !== null
            ? `Emergência: ~${snapshot.emergencyMonths} meses — base segura.`
            : "Confirma pelo menos 3 meses de despesas em poupança.",
          snapshot.investments.length
            ? `Regista saldo em ${snapshot.investments[0].name} regularmente.`
            : "Cria conta INVESTMENT na app para património completo.",
          "Horizonte 5+ anos — revisão trimestral sem pânico.",
        ],
      });

    default:
      return guide({
        readiness: "partial",
        summary: "Explora os passos do método e adapta à tua situação.",
        steps: ["Regista contas e movimentos reais antes de começar."],
      });
  }
}

export function getAllMethodApplicationGuides(
  methods: FinanceMethod[],
  snapshot: FinanceActivitySnapshot
): Map<string, MethodApplicationGuide> {
  const map = new Map<string, MethodApplicationGuide>();
  for (const method of methods) {
    map.set(
      method.id,
      getMethodApplicationGuide(method.id, snapshot, {
        completed: method.completed,
        active: method.active,
        stepIndex: method.stepIndex,
      })
    );
  }
  return map;
}
