import type { FinanceQuestionnaireAnswers } from "@/services/financeApi";

export type QuestionnaireStepDef = {
  key: keyof FinanceQuestionnaireAnswers;
  title: string;
  /** Texto curto sob o título (contexto sem abrir o glossário) */
  subtitle?: string;
  glossaryId?: string;
  options: {
    value: boolean | string;
    label: string;
    hint?: string;
    glossaryId?: string;
  }[];
};

export const FINANCE_QUESTIONNAIRE_STEPS: QuestionnaireStepDef[] = [
  {
    key: "hasHighInterestDebt",
    title: "Tens dívidas com juro alto?",
    subtitle: "Ex.: cartão revolving, crédito pessoal com TAEG elevada",
    glossaryId: "high-interest-debt",
    options: [
      { value: true, label: "Sim — cartão ou crédito caro", hint: "prioridade: reduzir juros" },
      { value: false, label: "Não / só juro baixo", hint: "ex.: hipoteca, empréstimo barato" },
    ],
  },
  {
    key: "incomeType",
    title: "A tua renda é…",
    subtitle: "Salário mensal estável vs rendimento que muda de mês para mês",
    glossaryId: "variable-income",
    options: [
      { value: "fixed", label: "Fixa (salário estável)" },
      {
        value: "variable",
        label: "Variável (freelance, comissões…)",
        hint: "orçamenta pela média, não pelo melhor mês",
        glossaryId: "variable-income",
      },
    ],
  },
  {
    key: "hasEmergencyFund",
    title: "Já tens fundo de emergência?",
    subtitle: "Reserva para imprevistos graves (não férias nem compras)",
    glossaryId: "emergency-fund",
    options: [
      { value: true, label: "Sim — pelo menos 1 mês de despesas" },
      { value: false, label: "Ainda não", hint: "meta típica: 1 → 3 meses de despesas" },
    ],
  },
  {
    key: "weeklyTime",
    title: "Quanto tempo podes dedicar por semana?",
    subtitle: "Ritual fixo conta mais do que horas perfeitas",
    glossaryId: "weekly-review",
    options: [
      {
        value: "minimal",
        label: "~15 min (revisão rápida)",
        glossaryId: "weekly-review",
      },
      { value: "moderate", label: "30–60 min" },
      { value: "full", label: "Trilho completo (~30 dias)", hint: "mapeamento e hábitos" },
    ],
  },
  {
    key: "wantsGameLink",
    title: "Queres motivação extra no Game Mode?",
    subtitle: "Missões e XP por hábitos financeiros (opcional)",
    options: [
      { value: true, label: "Sim — missões financeiras" },
      { value: false, label: "Não por agora" },
    ],
  },
  {
    key: "shortTermGoal",
    title: "Os teus objectivos nos próximos 3 meses?",
    subtitle: "Desempata a sugestão de método quando as bases estão ok",
    options: [
      {
        value: "pay_debt",
        label: "Pagar dívida ou crédito",
        glossaryId: "debt-avalanche",
      },
      {
        value: "save",
        label: "Poupar mais (fundo ou objectivo)",
        glossaryId: "pay-yourself-first",
      },
      {
        value: "organize",
        label: "Organizar gastos e hábitos",
        glossaryId: "cash-flow",
      },
    ],
  },
];
