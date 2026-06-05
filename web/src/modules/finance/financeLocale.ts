import { DEFAULT_FINANCE_CURRENCY, type FinanceCurrencyCode } from "@/modules/finance/financeCurrencies";

/** Espelha server/finance/finance-default-currency.ts — fallback UI antes do perfil carregar */
const REGION_CURRENCY: Record<string, FinanceCurrencyCode> = {
  PT: "EUR",
  BR: "BRL",
  US: "USD",
  GB: "GBP",
  CH: "CHF",
  CA: "CAD",
  AU: "AUD",
  JP: "JPY",
  SE: "SEK",
  NO: "NOK",
  PL: "PLN",
  AO: "AOA",
  MZ: "MZN",
};

const TIMEZONE_REGION: Record<string, keyof typeof REGION_CURRENCY> = {
  "Europe/Lisbon": "PT",
  "America/Sao_Paulo": "BR",
  "America/New_York": "US",
  "America/Los_Angeles": "US",
  "Europe/London": "GB",
  "Europe/Zurich": "CH",
  "America/Toronto": "CA",
  "Australia/Sydney": "AU",
  "Africa/Luanda": "AO",
  "Africa/Maputo": "MZ",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Warsaw": "PL",
  "Asia/Tokyo": "JP",
};

export function detectClientDefaultCurrency(): FinanceCurrencyCode {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const region = TIMEZONE_REGION[timeZone];
    if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region];
  } catch {
    /* ignore */
  }

  try {
    const locale = navigator.language;
    const parts = locale.split("-");
    if (parts.length >= 2) {
      const code = REGION_CURRENCY[parts[1]!.toUpperCase()];
      if (code) return code;
    }
  } catch {
    /* ignore */
  }

  return DEFAULT_FINANCE_CURRENCY;
}

export function getFinanceLocaleHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timeZone) headers["X-Timezone"] = timeZone;
  } catch {
    /* ignore */
  }
  return headers;
}
