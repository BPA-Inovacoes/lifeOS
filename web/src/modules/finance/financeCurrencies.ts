/** Espelha server/finance/finance-currencies.ts */
export const FINANCE_CURRENCIES = [
  { code: "AOA", label: "Kwanza angolano", symbol: "Kz", shortLabel: "Kwanza", flag: "🇦🇴" },
  { code: "EUR", label: "Euro", symbol: "€", shortLabel: "Euro", flag: "🇪🇺" },
  { code: "USD", label: "Dólar americano", symbol: "$", shortLabel: "Dólar", flag: "🇺🇸" },
  { code: "GBP", label: "Libra esterlina", symbol: "£", shortLabel: "Libra", flag: "🇬🇧" },
  { code: "BRL", label: "Real brasileiro", symbol: "R$", shortLabel: "Real", flag: "🇧🇷" },
  { code: "CHF", label: "Franco suíço", symbol: "CHF", shortLabel: "Franco", flag: "🇨🇭" },
  { code: "CAD", label: "Dólar canadiano", symbol: "CA$", shortLabel: "Dólar CA", flag: "🇨🇦" },
  { code: "AUD", label: "Dólar australiano", symbol: "A$", shortLabel: "Dólar AU", flag: "🇦🇺" },
  { code: "JPY", label: "Iene japonês", symbol: "¥", shortLabel: "Iene", flag: "🇯🇵" },
  { code: "SEK", label: "Coroa sueca", symbol: "kr", shortLabel: "Coroa SE", flag: "🇸🇪" },
  { code: "NOK", label: "Coroa norueguesa", symbol: "kr", shortLabel: "Coroa NO", flag: "🇳🇴" },
  { code: "PLN", label: "Zloty polaco", symbol: "zł", shortLabel: "Zloty", flag: "🇵🇱" },
  { code: "MZN", label: "Metical moçambicano", symbol: "MT", shortLabel: "Metical", flag: "🇲🇿" },
] as const;

export type FinanceCurrencyCode = (typeof FINANCE_CURRENCIES)[number]["code"];

export const DEFAULT_FINANCE_CURRENCY: FinanceCurrencyCode = "AOA";

export function getFinanceCurrency(code: string) {
  return FINANCE_CURRENCIES.find((c) => c.code === code);
}

export function formatCurrencyOptionLabel(c: (typeof FINANCE_CURRENCIES)[number]) {
  return `${c.flag} ${c.shortLabel}`;
}
