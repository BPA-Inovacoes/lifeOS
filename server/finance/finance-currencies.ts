/** Moeda por defeito da app (Kwanza angolano) */
export const FINANCE_CURRENCIES = [
  { code: "AOA", label: "Kwanza angolano" },
  { code: "EUR", label: "Euro" },
  { code: "USD", label: "Dólar americano" },
  { code: "GBP", label: "Libra esterlina" },
  { code: "BRL", label: "Real brasileiro" },
  { code: "CHF", label: "Franco suíço" },
  { code: "CAD", label: "Dólar canadiano" },
  { code: "AUD", label: "Dólar australiano" },
  { code: "JPY", label: "Iene japonês" },
  { code: "SEK", label: "Coroa sueca" },
  { code: "NOK", label: "Coroa norueguesa" },
  { code: "PLN", label: "Zloty polaco" },
  { code: "MZN", label: "Metical moçambicano" },
] as const;

export type FinanceCurrencyCode = (typeof FINANCE_CURRENCIES)[number]["code"];

export const DEFAULT_FINANCE_CURRENCY: FinanceCurrencyCode = "AOA";

export const FINANCE_CURRENCY_CODES: FinanceCurrencyCode[] = FINANCE_CURRENCIES.map(
  (c) => c.code
);

export function isFinanceCurrency(code: string): code is FinanceCurrencyCode {
  return (FINANCE_CURRENCY_CODES as readonly string[]).includes(code);
}
