import { financePanelClass, financeSectionLabelClass } from "@/modules/finance/styles/financeTokens";
import { formatMoney } from "@/services/financeApi";
import { cn } from "@/lib/utils";

type Props = {
  categories: { id: string; name: string; total: number }[];
  currency: string;
  monthExpense: number;
};

export function FinanceTopCategories({ categories, currency, monthExpense }: Props) {
  if (categories.length === 0 || monthExpense <= 0) return null;

  const max = categories[0]?.total ?? 1;

  return (
    <section className="mt-8">
      <p className={financeSectionLabelClass}>// despesas do mês</p>
      <h2 className="mt-1 font-medium text-foreground">Top categorias</h2>
      <ul className={cn("mt-3 space-y-3", financePanelClass, "border p-4")}>
        {categories.map((cat) => {
          const pct = Math.round((cat.total / monthExpense) * 100);
          const width = Math.max(4, Math.round((cat.total / max) * 100));
          return (
            <li key={cat.id}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span className="text-foreground">{cat.name}</span>
                <span className="shrink-0 font-mono text-sm text-muted-foreground">
                  {formatMoney(cat.total, currency)} · {pct}%
                </span>
              </div>
              <div className="mt-1.5 h-1.5 bg-card">
                <div
                  className="h-full bg-amber-600/70 transition-all duration-300"
                  style={{ width: `${width}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
