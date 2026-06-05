import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { FinanceButton } from "@/modules/finance/components/finance-ui";
import type { MethodQuizQuestion } from "@/modules/finance/content/financeMethodEducation";
import {
  financeCompletedText,
  financePanelClass,
  financeSuccessBoxClass,
} from "@/modules/finance/styles/financeTokens";
import { cn } from "@/lib/utils";

type Props = {
  questions: MethodQuizQuestion[];
};

export function FinanceMethodQuiz({ questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = questions.filter((q) => answers[q.id] === q.correctId).length;
  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div className="space-y-6">
      {questions.map((q, idx) => {
        const chosen = answers[q.id];
        const isCorrect = chosen === q.correctId;

        return (
          <fieldset
            key={q.id}
            className={cn("border p-4", financePanelClass, "border-border")}
          >
            <legend className="px-1 text-base font-medium text-foreground">
              {idx + 1}. {q.question}
            </legend>
            <div className="mt-3 space-y-2">
              {q.options.map((opt) => {
                const selected = chosen === opt.id;
                let ring = "";
                if (submitted && selected) {
                  ring = isCorrect ? "border-emerald-600/60 bg-emerald-950/20" : "border-red-600/60 bg-red-950/20";
                } else if (selected) {
                  ring = "border-amber-600/60 bg-amber-950/10";
                }

                return (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 border border-border px-3 py-3 text-base transition-colors",
                      !submitted && "hover:border-border",
                      ring
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.id}
                      checked={selected}
                      disabled={submitted}
                      className="mt-0.5 accent-amber-500"
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                      }
                    />
                    <span className="text-foreground">{opt.text}</span>
                    {submitted && selected ? (
                      isCorrect ? (
                        <CheckCircle2 className={cn("ml-auto size-4 shrink-0", financeCompletedText)} />
                      ) : (
                        <XCircle className="ml-auto size-4 shrink-0 text-red-700 dark:text-red-400" />
                      )
                    ) : null}
                  </label>
                );
              })}
            </div>
            {submitted ? (
              <p className="mt-3 border-l-2 border-amber-500/40 pl-3 text-sm leading-relaxed text-muted-foreground">
                {q.explanation}
              </p>
            ) : null}
          </fieldset>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        {!submitted ? (
          <FinanceButton disabled={!allAnswered} onClick={() => setSubmitted(true)}>
            Ver resultados
          </FinanceButton>
        ) : (
          <>
            <p className={cn("px-3 py-2 text-base", financeSuccessBoxClass)}>
              {score} / {questions.length} correctas
            </p>
            <FinanceButton
              variant="outline"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              Repetir quiz
            </FinanceButton>
          </>
        )}
      </div>
    </div>
  );
}
