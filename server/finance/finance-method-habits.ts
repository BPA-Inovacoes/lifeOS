export type FinanceSuggestedHabit = {
  name: string;
  frequency: "Diário" | "Semanal";
};

/** Hábitos sugeridos por método (F1.1). */
export const FINANCE_METHOD_SUGGESTED_HABITS: Record<string, FinanceSuggestedHabit[]> = {
  "first-30-days": [
    { name: "Registar despesas do dia", frequency: "Diário" },
    { name: "Conferir saldo das contas", frequency: "Semanal" },
  ],
  "weekly-money-review": [
    { name: "Revisão financeira semanal", frequency: "Semanal" },
    { name: "Registar despesas do dia", frequency: "Diário" },
  ],
  "envelope-budget": [
    { name: "Registar despesas do dia", frequency: "Diário" },
    { name: "Verificar envelopes do mês", frequency: "Semanal" },
  ],
  "pay-yourself-first": [
    { name: "Transferir para poupança no início do mês", frequency: "Semanal" },
  ],
  "variable-income": [
    { name: "Registar receitas recebidas", frequency: "Semanal" },
    { name: "Registar despesas do dia", frequency: "Diário" },
  ],
  "debt-snowball": [
    { name: "Registar pagamento de dívida", frequency: "Semanal" },
  ],
  "debt-avalanche": [
    { name: "Registar pagamento de dívida", frequency: "Semanal" },
  ],
};

export function getSuggestedHabitsForMethod(methodId: string): FinanceSuggestedHabit[] {
  return FINANCE_METHOD_SUGGESTED_HABITS[methodId] ?? [];
}
