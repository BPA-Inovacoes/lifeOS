import { cn } from "@/lib/utils";

const SAVINGS_GOAL = 20;

type Props = {
  rate: number;
  className?: string;
};

export function FinanceSavingsRateGauge({ rate, className }: Props) {
  const clamped = Math.min(100, Math.max(0, rate));
  const fill = Math.min(100, (clamped / SAVINGS_GOAL) * 100);
  const onTrack = rate >= SAVINGS_GOAL;

  return (
    <div className={className}>
      <div className="mt-2 h-2 bg-card">
        <div
          className={cn(
            "h-full transition-all duration-500",
            onTrack ? "bg-amber-500" : "bg-amber-600/60"
          )}
          style={{ width: `${fill}%` }}
        />
      </div>
      <p className="mt-1.5 font-mono text-sm text-muted-foreground">
        Meta {SAVINGS_GOAL}%
        {onTrack ? " · no alvo" : rate > 0 ? ` · faltam ${SAVINGS_GOAL - rate} p.p.` : " · regista movimentos"}
      </p>
    </div>
  );
}

type MethodProgressProps = {
  stepIndex: number;
  totalSteps: number;
};

export function FinanceMethodProgressBar({ stepIndex, totalSteps }: MethodProgressProps) {
  const pct = totalSteps ? Math.round((stepIndex / totalSteps) * 100) : 0;

  return (
    <div className="mt-3">
      <div className="flex justify-between font-mono text-xs uppercase text-muted-foreground">
        <span>Progresso</span>
        <span>{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 bg-card">
        <div
          className="h-full bg-amber-500/80 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
