import { DateInput } from "@/components/ui/date-input";
import { fieldClass, sectionLabelMutedClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";
import type { DatabaseProperty } from "@/types/database";

type DateTableFilterProps = {
  property: DatabaseProperty;
  value: string;
  onChange: (value: string) => void;
};

const selectClass = cn(fieldClass, "h-9 min-w-[8rem] cursor-pointer text-xs");

type DateMode = "" | "set" | "empty" | "before" | "after" | "between";

function parseDateFilter(value: string): {
  mode: DateMode;
  date1: string;
  date2: string;
} {
  if (!value) return { mode: "", date1: "", date2: "" };
  if (value === "set" || value === "date:set") return { mode: "set", date1: "", date2: "" };
  if (value === "empty" || value === "date:empty") return { mode: "empty", date1: "", date2: "" };
  if (value.startsWith("date:before:")) {
    return { mode: "before", date1: value.slice(12), date2: "" };
  }
  if (value.startsWith("date:after:")) {
    return { mode: "after", date1: value.slice(11), date2: "" };
  }
  if (value.startsWith("date:between:")) {
    const [a, b] = value.slice(13).split(",");
    return { mode: "between", date1: a ?? "", date2: b ?? "" };
  }
  return { mode: "", date1: "", date2: "" };
}

function encodeDateFilter(mode: DateMode, date1: string, date2: string): string {
  if (!mode) return "";
  if (mode === "set") return "date:set";
  if (mode === "empty") return "date:empty";
  if (mode === "before" && date1) return `date:before:${date1}`;
  if (mode === "after" && date1) return `date:after:${date1}`;
  if (mode === "between" && date1 && date2) return `date:between:${date1},${date2}`;
  return "";
}

export function DateTableFilter({ property, value, onChange }: DateTableFilterProps) {
  const { mode, date1, date2 } = parseDateFilter(value);

  const setMode = (next: DateMode) => {
    onChange(encodeDateFilter(next, date1, date2));
  };

  return (
    <div className="min-w-[10rem]">
      <label
        htmlFor={`filter-${property.id}-mode`}
        className={cn(sectionLabelMutedClass, "mb-1 block")}
      >
        {property.name}
      </label>
      <select
        id={`filter-${property.id}-mode`}
        value={mode}
        className={cn(selectClass, "w-full")}
        onChange={(e) => setMode(e.target.value as DateMode)}
      >
        <option value="">Todos</option>
        <option value="set">Com data</option>
        <option value="empty">Sem data</option>
        <option value="before">Antes de</option>
        <option value="after">Depois de</option>
        <option value="between">Entre</option>
      </select>
      {mode === "before" || mode === "after" ? (
        <DateInput
          value={date1}
          className="mt-1.5 h-9 w-full text-xs"
          onChange={(e) =>
            onChange(encodeDateFilter(mode, e.target.value, date2))
          }
        />
      ) : null}
      {mode === "between" ? (
        <div className="mt-1.5 flex gap-1.5">
          <DateInput
            value={date1}
            aria-label="Data inicial"
            className="h-9 min-w-0 flex-1 text-xs"
            onChange={(e) =>
              onChange(encodeDateFilter(mode, e.target.value, date2))
            }
          />
          <DateInput
            value={date2}
            aria-label="Data final"
            className="h-9 min-w-0 flex-1 text-xs"
            onChange={(e) =>
              onChange(encodeDateFilter(mode, date1, e.target.value))
            }
          />
        </div>
      ) : null}
    </div>
  );
}
