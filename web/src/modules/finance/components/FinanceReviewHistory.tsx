import { useState } from "react";
import { ChevronDown, History } from "lucide-react";

import { FinanceViewToggle } from "@/modules/finance/components/FinanceViewToggle";
import {
  financeViewContainerClass,
  useFinanceViewMode,
} from "@/modules/finance/hooks/useFinanceViewMode";
import {
  financePanelClass,
  financeSectionLabelClass,
  financeSuccessBoxClass,
} from "@/modules/finance/styles/financeTokens";
import { formatDisplayDate } from "@/lib/datePickerUtils";
import {
  formatMoney,
  METHOD_FOLLOWED_LABELS,
  type FinanceAccount,
  type FinanceWeeklyReview,
} from "@/services/financeApi";
import { cn } from "@/lib/utils";

type Props = {
  reviews: FinanceWeeklyReview[];
  accounts: FinanceAccount[];
  currency: string;
  currentWeekStart?: string;
};

function ReviewHistoryItem({
  review,
  accounts,
  currency,
  defaultOpen,
}: {
  review: FinanceWeeklyReview;
  accounts: FinanceAccount[];
  currency: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const answers = review.answers;
  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name ?? id.slice(0, 8);

  return (
    <li className={cn(financePanelClass, "border")}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-foreground">Semana de {formatDisplayDate(review.weekStart)}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {answers.incomeNote ? (
            <p>
              <span className="text-muted-foreground">Receitas: </span>
              {answers.incomeNote}
            </p>
          ) : null}
          {answers.expenseNote ? (
            <p className="mt-1">
              <span className="text-muted-foreground">Despesas: </span>
              {answers.expenseNote}
            </p>
          ) : null}
          {answers.methodFollowed ? (
            <p className="mt-1">
              <span className="text-muted-foreground">Método: </span>
              {METHOD_FOLLOWED_LABELS[answers.methodFollowed as keyof typeof METHOD_FOLLOWED_LABELS] ??
                answers.methodFollowed}
            </p>
          ) : null}
          {answers.improvement ? (
            <p className="mt-1">
              <span className="text-muted-foreground">Melhoria: </span>
              {answers.improvement}
            </p>
          ) : null}
          {Object.keys(review.accountSnapshots).length > 0 ? (
            <ul className="mt-3 space-y-1 border-t border-border pt-3 font-mono text-xs">
              {Object.entries(review.accountSnapshots).map(([id, balance]) => (
                <li key={id} className="flex justify-between gap-2">
                  <span>{accountName(id)}</span>
                  <span className="text-amber-950 dark:text-amber-300/80">{formatMoney(balance, currency)}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export function FinanceReviewCompletedSummary({
  review,
  weekEnd,
}: {
  review: FinanceWeeklyReview;
  weekEnd: string;
}) {
  const answers = review.answers;
  return (
    <div className={cn("px-4 py-4 text-sm", financeSuccessBoxClass)}>
      <p className="font-medium text-amber-100">
        Revisão concluída — semana de {formatDisplayDate(review.weekStart)} a{" "}
        {formatDisplayDate(weekEnd)}
      </p>
      {answers.improvement ? (
        <p className="mt-2 text-amber-200/80">
          Melhoria escolhida: <span className="text-foreground">{answers.improvement}</span>
        </p>
      ) : null}
      <p className="mt-2 text-sm text-amber-900 dark:text-amber-400/70">Volta na próxima segunda-feira.</p>
    </div>
  );
}

export function FinanceReviewHistory({
  reviews,
  accounts,
  currency,
  currentWeekStart,
}: Props) {
  const [view, setView] = useFinanceViewMode("review-history", "cards");
  const past = currentWeekStart
    ? reviews.filter((r) => r.weekStart !== currentWeekStart)
    : reviews;

  if (past.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <p className={financeSectionLabelClass}>// histórico</p>
        </div>
        <FinanceViewToggle value={view} onChange={setView} compact />
      </div>

      {view === "grid" ? (
        <ul className={cn("mt-4", financeViewContainerClass("grid"))}>
          {past.map((review) => (
            <li key={review.id} className={cn(financePanelClass, "border p-4")}>
              <p className="text-sm font-medium text-foreground">
                Semana {formatDisplayDate(review.weekStart)}
              </p>
              {review.answers.improvement ? (
                <p className="mt-2 text-sm text-muted-foreground">{review.answers.improvement}</p>
              ) : null}
              {review.answers.methodFollowed ? (
                <p className="mt-2 font-mono text-xs uppercase text-muted-foreground">
                  Método:{" "}
                  {METHOD_FOLLOWED_LABELS[
                    review.answers.methodFollowed as keyof typeof METHOD_FOLLOWED_LABELS
                  ] ?? review.answers.methodFollowed}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : view === "compact" ? (
        <div className={cn("mt-4", financeViewContainerClass("compact"))}>
          <div className="hidden grid-cols-[1fr_auto_auto] gap-2 px-4 py-2 font-mono text-xs uppercase text-muted-foreground sm:grid">
            <span>Semana</span>
            <span>Método</span>
            <span>Melhoria</span>
          </div>
          <ul>
            {past.map((review) => (
              <li
                key={review.id}
                className="grid grid-cols-1 gap-1 px-4 py-2.5 text-xs sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3 sm:text-sm"
              >
                <span className="text-foreground">{formatDisplayDate(review.weekStart)}</span>
                <span className="font-mono text-xs uppercase text-muted-foreground sm:text-xs">
                  {review.answers.methodFollowed
                    ? METHOD_FOLLOWED_LABELS[
                        review.answers.methodFollowed as keyof typeof METHOD_FOLLOWED_LABELS
                      ]
                    : "—"}
                </span>
                <span className="truncate text-muted-foreground">
                  {review.answers.improvement ?? "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {past.map((review, idx) => (
            <ReviewHistoryItem
              key={review.id}
              review={review}
              accounts={accounts}
              currency={currency}
              defaultOpen={idx === 0}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
