import {
  BookOpen,
  CalendarCheck,
  LayoutDashboard,
  Repeat2,
  ScrollText,
  Wallet,
  Waypoints,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import { AppBrand } from "@/components/AppBrand";
import { FinanceCurrencyPicker } from "@/modules/finance/components/FinanceCurrencyPicker";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import { financeSectionLabelClass } from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

type Props = {
  onLogout: () => void;
  className?: string;
};

const nav = [
  { to: paths.finance.home, label: "Início", icon: LayoutDashboard, end: true },
  { to: paths.finance.accounts, label: "Contas", icon: Wallet },
  { to: paths.finance.movements, label: "Movimentos", icon: Repeat2 },
  { to: paths.finance.methods, label: "Métodos", icon: Waypoints },
  { to: paths.finance.review, label: "Revisão semanal", icon: CalendarCheck },
  { to: paths.finance.learn, label: "Aprender", icon: BookOpen },
  { to: paths.finance.manual, label: "Manual", icon: ScrollText },
] as const;

export function FinanceSidebar({ onLogout, className }: Props) {
  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-amber-300/40 bg-background/90 backdrop-blur-sm dark:border-amber-900/25",
        className
      )}
    >
      <div className="border-b border-amber-900/20 px-4 py-4">
        <AppBrand size="sidebar" accent="finance" />
        <p className={cn(financeSectionLabelClass, "mt-3")}>// modo finanças</p>
      </div>

      <nav className="flex-1 space-y-0.5 p-2">
        {nav.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to}
            to={to}
            end={"end" in rest ? rest.end : false}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-amber-950/50 text-amber-200"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              )
            }
          >
            <Icon className="size-4 shrink-0 opacity-80" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-amber-900/20 p-3">
        <FinanceCurrencyPicker className="mb-3" />
        <FinanceButton
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            window.location.assign(paths.modeSelect);
          }}
        >
          Trocar modo
        </FinanceButton>
        <FinanceButton
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-red-400"
          onClick={onLogout}
        >
          Sair
        </FinanceButton>
      </div>
    </aside>
  );
}
