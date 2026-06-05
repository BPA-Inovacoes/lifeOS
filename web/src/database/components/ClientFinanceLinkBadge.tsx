import { Link } from "react-router-dom";
import { Wallet } from "lucide-react";

import type { ClientFinanceLinkMeta } from "@/services/databaseApi";
import { formatMoney } from "@/services/financeApi";
import { paths } from "@/routes/paths";

type Props = {
  link: ClientFinanceLinkMeta;
  currency?: string;
};

export function ClientFinanceLinkBadge({ link, currency = "EUR" }: Props) {
  return (
    <Link
      to={paths.finance.movements}
      className="mt-2 inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase text-emerald-800 hover:bg-emerald-500/20 dark:text-emerald-300"
      title={`Receita registada em ${link.date}`}
    >
      <Wallet className="size-3" />
      Receita {formatMoney(link.amount, currency)}
    </Link>
  );
}
