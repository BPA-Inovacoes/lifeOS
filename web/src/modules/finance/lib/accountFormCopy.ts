import type { FinanceAccountType } from "@/services/financeApi";

export const ACCOUNT_TYPE_HINTS: Record<FinanceAccountType, string> = {
  CHECKING:
    "Conta do dia-a-dia — onde entram salários e saem despesas habituais. Será a conta predefinida para movimentos.",
  SAVINGS:
    "Reserva ou objectivo. Transferências desde a ordem contam para a taxa de poupança do mês.",
  CASH: "Dinheiro físico — útil para pequenas despesas e para não «perder» o que tens na carteira.",
  CREDIT_CARD:
    "Regista o que deves no cartão (valor em dívida). O limite disponível não é o saldo — só o que falta pagar.",
  INVESTMENT: "Carteira, PPR ou corretora — saldo actual do investimento, não o que aportaste historicamente.",
  LOAN: "Empréstimo ou crédito automóvel — saldo em dívida que ainda falta amortizar.",
  OTHER: "Conta que não encaixa nas anteriores — poupança conjunta, sub-conta, etc.",
};

export const ACCOUNT_NAME_PLACEHOLDERS: Record<FinanceAccountType, string> = {
  CHECKING: "CGD Ordem",
  SAVINGS: "Poupança emergência",
  CASH: "Carteira",
  CREDIT_CARD: "Visa CGD",
  INVESTMENT: "Degiro / PPR",
  LOAN: "Crédito habitação",
  OTHER: "Conta conjunta",
};

/** Valores guardados em FinanceAccount.color */
export const ACCOUNT_COLOR_PRESETS = [
  { id: "amber", label: "Âmbar", className: "bg-amber-500" },
  { id: "emerald", label: "Verde", className: "bg-emerald-600" },
  { id: "sky", label: "Azul", className: "bg-sky-600" },
  { id: "violet", label: "Violeta", className: "bg-violet-600" },
  { id: "rose", label: "Rosa", className: "bg-rose-600" },
  { id: "slate", label: "Neutro", className: "bg-slate-500" },
] as const;

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
