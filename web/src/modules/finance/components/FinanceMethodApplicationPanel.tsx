import { Lightbulb, Target } from "lucide-react";

import type { MethodApplicationGuide } from "@/modules/finance/lib/methodApplicationGuide";
import {
  financeAccentBorder,
  financeBodyMutedClass,
  financeCompletedText,
  financeMetaLabelClass,
  financeSectionLabelClass,
} from "@/modules/finance/styles/financeTokens";
import { cn } from "@/lib/utils";

const READINESS_LABELS = {
  ready: "Pronto a aplicar",
  partial: "Quase lá",
  blocked: "Prepara primeiro",
  completed: "Concluído",
} as const;

const READINESS_STYLE = {
  ready: "text-emerald-800/90 dark:text-emerald-400/90",
  partial: "text-amber-900/90 dark:text-amber-400/90",
  blocked: "text-muted-foreground",
  completed: financeCompletedText,
} as const;

type Props = {
  guide: MethodApplicationGuide;
  compact?: boolean;
  className?: string;
};

export function FinanceMethodApplicationPanel({ guide, compact, className }: Props) {
  if (compact) {
    return (
      <p className={cn("mt-2 text-sm leading-relaxed text-muted-foreground", className)}>
        <Lightbulb className="mr-1 inline size-4 text-amber-500/70" />
        {guide.summary}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "mt-4 border border-dashed border-border bg-background/40 px-4 py-3",
        guide.readiness === "ready" && financeAccentBorder,
        guide.readiness === "completed" && "border-emerald-900/40",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className={financeSectionLabelClass}>// como aplicar contigo</p>
        <span className={cn("font-mono text-xs uppercase", READINESS_STYLE[guide.readiness])}>
          {READINESS_LABELS[guide.readiness]}
        </span>
      </div>

      <p className="mt-2 text-base leading-relaxed text-foreground">{guide.summary}</p>

      {guide.metric ? (
        <p className={cn("mt-2", financeMetaLabelClass)}>
          <Target className="mr-1 inline size-3.5" />
          {guide.metric}
        </p>
      ) : null}

      <ul className="mt-3 space-y-2">
        {guide.steps.map((step, idx) => (
          <li key={idx} className={cn("flex gap-2", financeBodyMutedClass)}>
            <span className="shrink-0 font-mono text-sm text-muted-foreground">{idx + 1}.</span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
