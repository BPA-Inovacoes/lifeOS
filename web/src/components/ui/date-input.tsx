import * as React from "react";
import { useRef, useState } from "react";
import { Calendar } from "lucide-react";

import { DatePickerPopover, type DatePickerAccent } from "@/components/ui/date-picker-popover";
import { formatDisplayDate } from "@/lib/datePickerUtils";
import { dateInputClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";

export type DateInputProps = Omit<React.ComponentPropsWithoutRef<"input">, "type" | "readOnly"> & {
  accent?: DatePickerAccent;
};

const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, value, onChange, accent = "emerald", disabled, id, ...props }, ref) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const iso = typeof value === "string" ? value : "";

    const emitChange = (next: string) => {
      onChange?.({
        target: { value: next },
        currentTarget: { value: next },
      } as React.ChangeEvent<HTMLInputElement>);
    };

    return (
      <div ref={wrapperRef} className="relative">
        <input
          ref={ref}
          id={id}
          type="text"
          readOnly
          disabled={disabled}
          value={iso ? formatDisplayDate(iso) : ""}
          placeholder="dd/mm/aaaa"
          className={cn(dateInputClass, "cursor-pointer pr-11", className)}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setOpen(true);
            }
          }}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          aria-label="Abrir calendário"
          className={cn(
            "absolute right-0 top-0 flex h-full w-10 items-center justify-center border-l border-border transition-colors",
            accent === "amber"
              ? "text-amber-500/90 hover:text-amber-900 dark:hover:text-amber-400"
              : "text-emerald-800/90 dark:text-emerald-500/90 hover:text-emerald-700 dark:hover:text-emerald-400",
            disabled && "opacity-50"
          )}
          onClick={() => {
            if (!disabled) setOpen(true);
          }}
        >
          <Calendar className="size-4" />
        </button>
        {open ? (
          <DatePickerPopover
            value={iso}
            accent={accent}
            anchorRef={wrapperRef}
            onChange={emitChange}
            onClose={() => setOpen(false)}
          />
        ) : null}
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput };
