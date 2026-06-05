import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Wallet } from "lucide-react";

import { FinanceButton } from "@/modules/finance/components/finance-ui";
import {
  financeAccentBorder,
  financeLinkClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

type Props = {
  onCreateAccount: () => void;
};

export function FinanceOnboardingCard({ onCreateAccount }: Props) {
  return (
    <div className={cn("mt-6 border p-5", financeAccentBorder, "bg-amber-950/10")}>
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-amber-900 dark:text-amber-400" />
        <div className="min-w-0 flex-1">
          <p className={financeSectionLabelClass}>// primeiros passos</p>
          <h2 className="mt-1 font-medium text-foreground">Mapa do teu dinheiro</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Começa pelo método «Primeiros 30 dias»: cria conta à ordem + poupança com o saldo de hoje.
          </p>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-mono text-amber-500/80">1</span>
              <span>Criar conta à ordem (salário e despesas)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-amber-500/80">2</span>
              <span>Criar poupança separada</span>
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-amber-500/80">3</span>
              <span>Escolher um método em Métodos</span>
            </li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <FinanceButton size="sm" onClick={onCreateAccount}>
              <Wallet className="size-4" /> Criar primeira conta
            </FinanceButton>
            <Link
              to={paths.finance.methods}
              className={cn(
                "inline-flex items-center gap-1 self-center font-mono text-xs uppercase",
                financeLinkClass
              )}
            >
              Ver métodos <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
