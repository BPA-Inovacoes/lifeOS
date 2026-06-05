import financeManualRaw from "../../../../../docs/MANUAL-FINANCEIRO.md?raw";

/** Texto do manual Modo Finanças para a app. */
export function getFinanceManualMarkdown(): string {
  return financeManualRaw.replace(/\*Manual do utilizador[^\n]*\n?/m, "");
}
