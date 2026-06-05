import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  buildMonthGrid,
  isoTodayLocal,
  monthLabel,
  viewFromValue,
  WEEKDAYS_PT,
} from "@/lib/datePickerUtils";
import { cn } from "@/lib/utils";

export type DatePickerAccent = "emerald" | "amber";

type DatePickerPopoverProps = {
  value: string;
  onChange: (iso: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  accent?: DatePickerAccent;
};

const accentStyles: Record<
  DatePickerAccent,
  { selected: string; today: string; action: string; header: string }
> = {
  emerald: {
    selected:
      "border-emerald-600 bg-emerald-100 text-emerald-950 dark:border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-100",
    today: "ring-1 ring-emerald-600/80 ring-inset",
    action: "text-emerald-800 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300",
    header: "text-emerald-800 dark:text-emerald-400/90",
  },
  amber: {
    selected:
      "border-amber-600 bg-amber-100 text-amber-950 dark:border-amber-500 dark:bg-amber-950/60 dark:text-amber-100",
    today: "ring-1 ring-amber-600/80 ring-inset",
    action: "text-amber-900 hover:text-amber-950 dark:text-amber-400 dark:hover:text-amber-300",
    header: "text-amber-900 dark:text-amber-400/90",
  },
};

export function DatePickerPopover({
  value,
  onChange,
  onClose,
  anchorRef,
  accent = "emerald",
}: DatePickerPopoverProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(
    null
  );
  const initial = viewFromValue(value);
  const [viewYear, setViewYear] = useState(initial.year);
  const [viewMonth, setViewMonth] = useState(initial.month);

  const styles = accentStyles[accent];
  const days = buildMonthGrid(viewYear, viewMonth, value);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;

    const update = () => {
      const rect = anchor.getBoundingClientRect();
      const width = Math.max(rect.width, 280);
      let left = rect.left;
      if (left + width > window.innerWidth - 8) {
        left = window.innerWidth - width - 8;
      }
      left = Math.max(8, left);

      let top = rect.bottom + 6;
      const estimatedHeight = 340;
      if (top + estimatedHeight > window.innerHeight - 8) {
        top = Math.max(8, rect.top - estimatedHeight - 6);
      }

      setPosition({ top, left, width });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchorRef]);

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        onClose();
      }
    };

    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey, true);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey, true);
    };
  }, [anchorRef, onClose]);

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  if (!position) return null;

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Calendário"
      className="lifeos-date-picker border border-border bg-background p-3 shadow-xl shadow-black/50"
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 400,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Mês anterior"
          className="flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeft className="size-4" />
        </button>
        <p className={cn("font-mono text-xs uppercase tracking-wide", styles.header)}>
          {monthLabel(viewMonth)} {viewYear}
        </p>
        <button
          type="button"
          aria-label="Mês seguinte"
          className="flex size-8 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-border hover:text-foreground"
          onClick={() => shiftMonth(1)}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-0.5">
        {WEEKDAYS_PT.map((label) => (
          <span
            key={label}
            className="py-1 text-center font-mono text-xs uppercase tracking-wide text-muted-foreground/80"
          >
            {label}
          </span>
        ))}
        {days.map((cell) => (
          <button
            key={cell.iso}
            type="button"
            aria-label={cell.iso}
            aria-pressed={cell.isSelected}
            className={cn(
              "flex h-9 items-center justify-center border border-transparent font-mono text-sm transition-colors",
              cell.inMonth ? "text-foreground/90 hover:bg-card" : "text-zinc-700 hover:bg-secondary/50",
              cell.isToday && styles.today,
              cell.isSelected && styles.selected
            )}
            onClick={() => {
              onChange(cell.iso);
              onClose();
            }}
          >
            {cell.day}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
        <button
          type="button"
          className={cn("font-mono text-sm uppercase tracking-wide", styles.action)}
          onClick={() => {
            onChange("");
            onClose();
          }}
        >
          Limpar
        </button>
        <button
          type="button"
          className={cn("font-mono text-sm uppercase tracking-wide", styles.action)}
          onClick={() => {
            onChange(isoTodayLocal());
            onClose();
          }}
        >
          Hoje
        </button>
      </div>
    </div>,
    document.body
  );
}
