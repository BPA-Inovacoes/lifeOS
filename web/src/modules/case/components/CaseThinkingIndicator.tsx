import { CaseIcon } from "@/modules/case/components/CaseIcon";
import type { CaseStatus } from "@/services/caseApi";
import { cn } from "@/lib/utils";

type Props = {
  status?: CaseStatus;
  className?: string;
};

export function CaseThinkingIndicator({ status, className }: Props) {
  const usesLlm = status?.llmEnabled && status.engine === "llm";
  const label = usesLlm ? "A pensar…" : "A processar…";

  return (
    <div
      className={cn(
        "max-w-[90%] rounded px-3 py-2 text-sm bg-amber-500/10 text-foreground dark:bg-amber-950/40",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="flex items-center gap-2.5">
        <CaseIcon size="chat" motion="thinking" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
