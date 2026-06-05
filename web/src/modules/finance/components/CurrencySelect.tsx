import { ChevronDown } from "lucide-react";

import {
  FINANCE_CURRENCIES,
  formatCurrencyOptionLabel,
  getFinanceCurrency,
} from "@/modules/finance/financeCurrencies";
import { financeAccentBorder } from "@/modules/finance/styles/financeTokens";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Mostra badge com código + símbolo à esquerda */
  showBadge?: boolean;
};

export function CurrencySelect({
  value,
  onChange,
  disabled,
  className,
  id,
  showBadge = true,
}: Props) {
  const current = getFinanceCurrency(value);

  return (
    <div
      className={cn(
        "flex overflow-hidden border bg-background transition-colors focus-within:border-amber-600/70",
        financeAccentBorder,
        disabled && "opacity-60",
        className
      )}
    >
      {showBadge && current ? (
        <div
          className="flex shrink-0 flex-col items-center justify-center gap-0.5 border-r border-amber-300/50 bg-amber-50/80 px-3 py-2 dark:border-amber-900/30 dark:bg-amber-950/30"
          aria-hidden
        >
          <span className="font-mono text-base font-semibold leading-none text-amber-900 dark:text-amber-300">
            {value}
          </span>
          {current.symbol ? (
            <span className="font-mono text-xs leading-none text-amber-700/80 dark:text-amber-500/80">
              {current.symbol}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="relative min-w-0 flex-1">
        <select
          id={id}
          className={cn(
            "h-full min-h-[3rem] w-full cursor-pointer appearance-none border-0 bg-transparent py-2.5 pl-3 pr-10 text-base text-foreground outline-none",
            "focus:ring-0 disabled:cursor-not-allowed"
          )}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        >
          {FINANCE_CURRENCIES.map((c) => (
            <option key={c.code} value={c.code} className="bg-background text-base">
              {formatCurrencyOptionLabel(c)}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    </div>
  );
}
