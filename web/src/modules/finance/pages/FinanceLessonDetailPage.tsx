import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { FinanceClarStepNav } from "@/modules/finance/components/FinanceClarStepNav";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import {
  FINANCE_MICRO_LESSONS,
  FINANCE_PILLARS,
  getGlossaryTerm,
} from "@/modules/finance/content/financeLearnContent";
import {
  CLAR_STEPS,
  getClarLesson,
  nextClarStep,
  type ClarStepId,
} from "@/modules/finance/content/financeLearnClar";
import {
  getTrailsForLesson,
} from "@/modules/finance/content/financeLearnTrails";
import { useLearnProgress } from "@/modules/finance/hooks/useLearnProgress";
import type { MethodQuizQuestion } from "@/modules/finance/content/financeMethodEducation";
import {
  financeAccentBorder,
  financeBodyClass,
  financeBodyMutedClass,
  financeCompletedText,
  financeLinkClass,
  financeMetaLabelClass,
  financePanelClass,
  financeSectionLabelClass,
  financeSuccessBoxClass,
} from "@/modules/finance/styles/financeTokens";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

function nextStepLabel(step: ClarStepId): string {
  const next = nextClarStep(step);
  if (!next) return "";
  const meta = CLAR_STEPS.find((s) => s.id === next);
  return meta ? ` → ${meta.label}` : "";
}

export function FinanceLessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { getLessonProgress, setLessonStep, completeLesson } = useLearnProgress();

  const lesson = FINANCE_MICRO_LESSONS.find((l) => l.id === lessonId);
  const clar = lessonId ? getClarLesson(lessonId) : undefined;
  const saved = lessonId ? getLessonProgress(lessonId) : undefined;
  const trails = lessonId ? getTrailsForLesson(lessonId) : [];

  const resolveInitialStep = (): ClarStepId => {
    if (!saved?.step || saved.step === "done") return saved?.step === "done" ? "repeat" : "clarify";
    return saved.step;
  };

  const [step, setStep] = useState<ClarStepId>(resolveInitialStep);

  useEffect(() => {
    if (saved?.step && saved.step !== "done") setStep(saved.step);
  }, [saved?.step]);

  const isDone = saved?.step === "done";

  const completedSteps = useMemo(() => {
    if (isDone) return CLAR_STEPS.map((s) => s.id);
    const idx = CLAR_STEPS.findIndex((s) => s.id === step);
    return CLAR_STEPS.slice(0, idx).map((s) => s.id);
  }, [step, isDone]);

  const advance = useCallback(() => {
    const next = nextClarStep(step);
    if (!next || !lessonId) return;
    setStep(next);
    setLessonStep(lessonId, next);
  }, [step, lessonId, setLessonStep]);

  const goBack = () => {
    const idx = CLAR_STEPS.findIndex((s) => s.id === step) - 1;
    if (idx >= 0) setStep(CLAR_STEPS[idx]!.id);
  };

  const handleQuizPass = useCallback(
    (score: number, total: number) => {
      if (!lessonId) return;
      if (score >= Math.ceil(total / 2)) {
        completeLesson(lessonId, score);
      }
    },
    [lessonId, completeLesson]
  );

  const nextInTrail = useMemo(() => {
    if (!lessonId || trails.length === 0) return null;
    const trail = trails[0]!;
    const idx = trail.lessonIds.indexOf(lessonId);
    if (idx < 0 || idx >= trail.lessonIds.length - 1) return null;
    return trail.lessonIds[idx + 1]!;
  }, [lessonId, trails]);

  if (!lesson || !clar) {
    return (
      <div className="mx-auto max-w-3xl">
        <Link
          to={paths.finance.learn}
          className={cn("inline-flex items-center gap-2 text-sm", financeLinkClass)}
        >
          <ArrowLeft className="size-4" />
          Voltar a Aprender
        </Link>
        <p className={cn(financePanelClass, "mt-6 border p-8 text-center text-muted-foreground")}>
          Lição não encontrada.
        </p>
      </div>
    );
  }

  const pillar = FINANCE_PILLARS[lesson.pillar];
  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to={paths.finance.learn}
        className={cn("inline-flex items-center gap-2 text-sm", financeLinkClass)}
      >
        <ArrowLeft className="size-4" />
        Aprender
      </Link>

      <p className={cn(financeSectionLabelClass, "mt-4")}>// método clar</p>
      <h1 className="mt-1 text-2xl font-semibold text-foreground">{lesson.title}</h1>
      <p className="mt-1 font-mono text-xs uppercase text-amber-500/80">{pillar.label}</p>

      {trails.length > 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Trilho: {trails.map((t) => t.title).join(" · ")}
        </p>
      ) : null}

      <div className="mt-6">
        <FinanceClarStepNav
          current={step}
          completedSteps={completedSteps}
          onSelect={(s) => {
            if (isDone || completedSteps.includes(s)) setStep(s);
          }}
        />
      </div>

      {isDone ? (
        <div className={cn("mt-6 flex items-center gap-2 px-4 py-3", financeSuccessBoxClass)}>
          <CheckCircle2 className={cn("size-5 shrink-0", financeCompletedText)} />
          <p className="text-sm">
            Lição concluída
            {saved?.quizScore != null
              ? ` · ${saved.quizScore}/${clar.repeat.quiz.length} no quiz`
              : ""}
          </p>
        </div>
      ) : null}

      <div className={cn(financePanelClass, "mt-6 border p-5")}>
        {step === "clarify" ? (
          <section>
            <h2 className={financeMetaLabelClass}>C — Clarifica</h2>
            <p className="mt-3 text-lg font-medium text-foreground">{clar.clarify.headline}</p>
            <p className="mt-3 border-l-2 border-amber-500/50 pl-3 text-sm font-medium text-amber-900 dark:text-amber-300">
              {clar.clarify.keyPoint}
            </p>
            <p className={cn("mt-4", financeBodyClass)}>{clar.clarify.definition}</p>
          </section>
        ) : null}

        {step === "link" ? (
          <section>
            <h2 className={financeMetaLabelClass}>L — Liga</h2>
            <p className={cn("mt-3", financeBodyClass)}>{clar.link.scenario}</p>
            <p className={cn("mt-4", financeBodyMutedClass)}>
              <span className="font-medium text-foreground">No teu caso: </span>
              {clar.link.inYourCase}
            </p>
            {clar.link.relatedTermIds.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {clar.link.relatedTermIds.map((id) => {
                  const term = getGlossaryTerm(id);
                  if (!term) return null;
                  return (
                    <li key={id}>
                      <Link
                        to={`${paths.finance.learn}?tab=glossary&q=${encodeURIComponent(term.term)}`}
                        className={cn(
                          "inline-flex items-center gap-1 border border-border px-2 py-1 text-xs",
                          financeLinkClass
                        )}
                      >
                        {term.term}
                        <ArrowUpRight className="size-3" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </section>
        ) : null}

        {step === "apply" ? (
          <section>
            <h2 className={financeMetaLabelClass}>A — Aplica</h2>
            <p className={cn("mt-3", financeBodyClass)}>{clar.apply.instruction}</p>
            {clar.apply.appLink ? (
              <Link
                to={clar.apply.appLink.to}
                className="mt-4 inline-flex items-center gap-2 border border-amber-400/60 bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-100 dark:hover:bg-amber-950/50"
              >
                {clar.apply.appLink.label}
                <ArrowUpRight className="size-4" />
              </Link>
            ) : null}
          </section>
        ) : null}

        {step === "repeat" ? (
          <section>
            <h2 className={financeMetaLabelClass}>R — Repete</h2>
            <p className={cn("mt-2 mb-4", financeBodyMutedClass)}>
              Fixa o conceito com recall activo — precisas de pelo menos metade correctas para
              concluir.
            </p>
            <LessonQuiz
              key={isDone ? "done" : "active"}
              questions={clar.repeat.quiz}
              readOnly={isDone}
              onPass={handleQuizPass}
            />
            <p className="mt-4 border-l-2 border-amber-500/40 pl-3 text-sm text-muted-foreground">
              {clar.repeat.revisitHint}
            </p>
          </section>
        ) : null}
      </div>

      {step !== "repeat" ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <FinanceButton onClick={advance}>Continuar{nextStepLabel(step)}</FinanceButton>
          {step !== "clarify" ? (
            <FinanceButton variant="outline" onClick={goBack}>
              Anterior
            </FinanceButton>
          ) : null}
        </div>
      ) : null}

      {isDone ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={paths.finance.learn}>
            <FinanceButton variant="outline">Biblioteca</FinanceButton>
          </Link>
          {nextInTrail ? (
            <Link to={paths.finance.lesson(nextInTrail)}>
              <FinanceButton>Próxima lição do trilho</FinanceButton>
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function LessonQuiz({
  questions,
  onPass,
  readOnly,
}: {
  questions: MethodQuizQuestion[];
  onPass: (score: number, total: number) => void;
  readOnly?: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(readOnly ?? false);

  const score = questions.filter((q) => answers[q.id] === q.correctId).length;
  const allAnswered = questions.every((q) => answers[q.id]);
  const passed = submitted && score >= Math.ceil(questions.length / 2);

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => {
        const chosen = answers[q.id];
        const isCorrect = chosen === q.correctId;
        return (
          <fieldset key={q.id} className={cn("border p-4", financePanelClass, financeAccentBorder)}>
            <legend className="px-1 text-base font-medium text-foreground">
              {idx + 1}. {q.question}
            </legend>
            <div className="mt-3 space-y-2">
              {q.options.map((opt) => {
                const selected = chosen === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 border border-border px-3 py-3 text-base",
                      submitted &&
                        selected &&
                        (isCorrect
                          ? "border-emerald-600/60 bg-emerald-950/20"
                          : "border-red-600/60 bg-red-950/20"),
                      selected && !submitted && "border-amber-600/60 bg-amber-950/10"
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={selected}
                      disabled={submitted}
                      className="mt-0.5 accent-amber-500"
                      onChange={() => setAnswers((p) => ({ ...p, [q.id]: opt.id }))}
                    />
                    <span>{opt.text}</span>
                  </label>
                );
              })}
            </div>
            {submitted ? (
              <p className="mt-3 border-l-2 border-amber-500/40 pl-3 text-sm text-muted-foreground">
                {q.explanation}
              </p>
            ) : null}
          </fieldset>
        );
      })}

      {!submitted ? (
        <FinanceButton
          disabled={!allAnswered}
          onClick={() => {
            setSubmitted(true);
            onPass(score, questions.length);
          }}
        >
          Ver resultados
        </FinanceButton>
      ) : (
        <div className="space-y-2">
          <p className={cn("inline-block px-3 py-2 text-sm", financeSuccessBoxClass)}>
            {score} / {questions.length} correctas
          </p>
          {!passed ? (
            <FinanceButton
              variant="outline"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              Tentar outra vez
            </FinanceButton>
          ) : null}
        </div>
      )}
    </div>
  );
}
