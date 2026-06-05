import { paths } from "@/routes/paths";
import type { FinanceAccountType, FinanceMovementType } from "@/services/financeApi";

export type MethodStepAction =
  | { type: "navigate"; to: string; label: string }
  | { type: "create-account"; accountType: FinanceAccountType; label: string }
  | {
      type: "create-movement";
      movementType: FinanceMovementType;
      label: string;
    };

/** Acções na app por método e índice de passo (0-based) */
const STEP_ACTIONS: Record<string, Record<number, MethodStepAction>> = {
  "first-30-days": {
    0: { type: "create-account", accountType: "CHECKING", label: "Criar conta à ordem" },
    1: { type: "create-account", accountType: "SAVINGS", label: "Criar conta poupança" },
    2: { type: "navigate", to: paths.finance.accounts, label: "Ver contas e saldos" },
    3: { type: "create-movement", movementType: "INCOME", label: "Registar receita" },
    4: { type: "create-movement", movementType: "EXPENSE", label: "Registar despesa fixa" },
    5: { type: "navigate", to: paths.finance.movements, label: "Registar despesas" },
    6: { type: "navigate", to: paths.finance.review, label: "Fazer revisão semanal" },
    7: { type: "create-movement", movementType: "TRANSFER", label: "Transferir para poupança" },
    8: { type: "navigate", to: paths.finance.home, label: "Ver taxa de poupança" },
    10: { type: "navigate", to: paths.finance.methods, label: "Explorar 50/30/20" },
    11: { type: "navigate", to: paths.finance.movements, label: "Continuar registo" },
    12: { type: "navigate", to: paths.finance.review, label: "Revisão semana 2" },
    13: { type: "create-movement", movementType: "TRANSFER", label: "Registar transferência" },
    14: { type: "navigate", to: paths.finance.accounts, label: "Conferir saldos" },
    15: { type: "navigate", to: paths.finance.review, label: "Revisão semana 3" },
    16: { type: "navigate", to: paths.finance.movements, label: "Ver movimentos" },
    17: { type: "navigate", to: paths.finance.review, label: "Revisão semana 4" },
    18: { type: "navigate", to: paths.finance.learn, label: "Abrir glossário" },
    19: { type: "navigate", to: paths.finance.methods, label: "Escolher método contínuo" },
  },
  "rule-50-30-20": {
    0: { type: "create-movement", movementType: "INCOME", label: "Registar receita do mês" },
    4: { type: "navigate", to: paths.finance.home, label: "Comparar no painel" },
  },
  "pay-yourself-first": {
    2: { type: "navigate", to: paths.finance.accounts, label: "Ver contas" },
    3: { type: "create-movement", movementType: "TRANSFER", label: "Registar poupança" },
    5: { type: "navigate", to: paths.finance.review, label: "Revisão mensal" },
  },
  "emergency-fund": {
    0: { type: "navigate", to: paths.finance.movements, label: "Calcular despesas" },
    2: { type: "create-movement", movementType: "TRANSFER", label: "Transferir para poupança" },
    3: { type: "create-movement", movementType: "TRANSFER", label: "Agendar transferência" },
  },
  "envelope-budget": {
    2: { type: "create-movement", movementType: "EXPENSE", label: "Registar despesa" },
    3: { type: "navigate", to: paths.finance.home, label: "Ver top categorias" },
  },
  "debt-snowball": {
    0: { type: "create-account", accountType: "CREDIT_CARD", label: "Registar dívida" },
    3: { type: "create-movement", movementType: "EXPENSE", label: "Registar pagamento extra" },
  },
  "debt-avalanche": {
    0: { type: "navigate", to: paths.finance.accounts, label: "Listar dívidas" },
    3: { type: "create-movement", movementType: "EXPENSE", label: "Registar pagamento extra" },
  },
  "weekly-money-review": {
    4: { type: "navigate", to: paths.finance.review, label: "Abrir revisão semanal" },
  },
  "savings-rate-20": {
    0: { type: "navigate", to: paths.finance.home, label: "Ver taxa actual" },
    3: { type: "create-movement", movementType: "TRANSFER", label: "Aumentar transferência" },
  },
  "intro-investing": {
    0: { type: "navigate", to: paths.finance.accounts, label: "Confirmar poupança" },
    5: { type: "create-account", accountType: "INVESTMENT", label: "Criar conta investimento" },
  },
  "no-spend-challenge": {
    3: { type: "navigate", to: paths.finance.movements, label: "Registar impulsos" },
  },
  "variable-income": {
    0: { type: "navigate", to: paths.finance.movements, label: "Ver receitas" },
    2: { type: "create-account", accountType: "SAVINGS", label: "Conta fundo mês fraco" },
  },
};

export function getMethodStepAction(methodId: string, stepIndex: number): MethodStepAction | null {
  return STEP_ACTIONS[methodId]?.[stepIndex] ?? null;
}
