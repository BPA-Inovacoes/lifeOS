import { DEFAULT_FINANCE_CURRENCY, type FinanceCurrencyCode } from "./finance-currencies";

export type FinanceLocaleHints = {
  locale?: string;
  timeZone?: string;
};

/** ISO 3166-1 alpha-2 → moeda suportada na app */
const REGION_CURRENCY: Record<string, FinanceCurrencyCode> = {
  PT: "EUR",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  FI: "EUR",
  GR: "EUR",
  LU: "EUR",
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

/** Fusos comuns → país (localização física) */
const TIMEZONE_REGION: Record<string, string> = {
  "Europe/Lisbon": "PT",
  "Atlantic/Azores": "PT",
  "Atlantic/Madeira": "PT",
  "America/Sao_Paulo": "BR",
  "America/Manaus": "BR",
  "America/Recife": "BR",
  "America/Fortaleza": "BR",
  "America/Belem": "BR",
  "America/Cuiaba": "BR",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "Europe/London": "GB",
  "Europe/Zurich": "CH",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "Australia/Sydney": "AU",
  "Australia/Melbourne": "AU",
  "Africa/Luanda": "AO",
  "Africa/Maputo": "MZ",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Warsaw": "PL",
  "Asia/Tokyo": "JP",
};

function currencyForRegion(region: string): FinanceCurrencyCode | undefined {
  return REGION_CURRENCY[region.toUpperCase()];
}

function regionFromLocale(locale: string): string | undefined {
  const normalized = locale.trim().replace("_", "-");
  const parts = normalized.split("-");
  if (parts.length >= 2) return parts[1]!.toUpperCase();
  return undefined;
}

export function resolveDefaultCurrency(hints?: FinanceLocaleHints): FinanceCurrencyCode {
  if (hints?.timeZone) {
    const fromTz = TIMEZONE_REGION[hints.timeZone];
    const cur = fromTz ? currencyForRegion(fromTz) : undefined;
    if (cur) return cur;
  }

  if (hints?.locale) {
    const region = regionFromLocale(hints.locale);
    if (region) {
      const cur = currencyForRegion(region);
      if (cur) return cur;
    }
  }

  return DEFAULT_FINANCE_CURRENCY;
}

export function localeHintsFromRequest(req: {
  headers: Record<string, string | string[] | undefined>;
}): FinanceLocaleHints {
  const rawLang = req.headers["accept-language"];
  const locale =
    typeof rawLang === "string" ? rawLang.split(",")[0]?.trim() : undefined;
  const rawTz = req.headers["x-timezone"];
  const timeZone = typeof rawTz === "string" ? rawTz.trim() : undefined;
  return { locale, timeZone };
}
