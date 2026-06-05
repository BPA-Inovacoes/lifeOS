import { Minus, Plus, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { parsePoints } from "@/utils/points";

const STEP = 5;
const MAX = 999;

type PointsCellProps = {
  value: unknown;
  onChange: (value: number) => void;
  step?: number;
};

export function PointsCell({
  value,
  onChange,
  step = STEP,
}: PointsCellProps) {
  const fromProp = parsePoints(value);
  const [local, setLocal] = useState(fromProp);

  useEffect(() => {
    setLocal(parsePoints(value));
  }, [value]);

  const commit = (next: number) => {
    const clamped = Math.max(0, Math.min(MAX, Math.round(next)));
    setLocal(clamped);
    onChange(clamped);
  };

  const btnClass =
    "flex size-7 shrink-0 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:border-emerald-800 hover:text-emerald-500 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground";

  return (
    <div
      className="flex items-center gap-1"
      onClick={(e) => e.stopPropagation()}
    >
      <span className="flex size-7 shrink-0 items-center justify-center border border-border bg-card">
        <Zap className="size-3.5 text-emerald-600/80" aria-hidden />
      </span>

      <input
        type="number"
        min={0}
        max={MAX}
        step={step}
        value={local === 0 ? "" : local}
        placeholder="0"
        className={cn(
          "h-9 w-14 rounded-none border border-border bg-card px-2 text-center text-sm tabular-nums text-emerald-800 dark:text-emerald-400",
          "outline-none focus:border-emerald-600",
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        )}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") {
            setLocal(0);
            return;
          }
          const n = Number(raw);
          if (Number.isFinite(n)) {
            setLocal(Math.max(0, Math.min(MAX, Math.round(n))));
          }
        }}
        onBlur={() => commit(local)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />

      <button
        type="button"
        className={btnClass}
        aria-label={`Menos ${step} pontos`}
        disabled={local <= 0}
        onClick={() => commit(local - step)}
      >
        <Minus className="size-3" />
      </button>

      <button
        type="button"
        className={btnClass}
        aria-label={`Mais ${step} pontos`}
        disabled={local >= MAX}
        onClick={() => commit(local + step)}
      >
        <Plus className="size-3" />
      </button>
    </div>
  );
}
