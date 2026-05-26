import { Input } from "@/components/ui/input";
import { fieldClass, sectionLabelMutedClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";
import type { DatabaseProperty } from "@/types/database";

type NumberTableFilterProps = {
  property: DatabaseProperty;
  value: string;
  onChange: (value: string) => void;
};

const selectClass = cn(fieldClass, "h-9 min-w-[8rem] cursor-pointer text-xs");

type NumberMode =
  | ""
  | "set"
  | "empty"
  | "eq"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between";

function parseNumberFilter(value: string): {
  mode: NumberMode;
  n1: string;
  n2: string;
} {
  if (!value) return { mode: "", n1: "", n2: "" };
  if (value === "num:set") return { mode: "set", n1: "", n2: "" };
  if (value === "num:empty") return { mode: "empty", n1: "", n2: "" };
  if (value.startsWith("num:eq:")) return { mode: "eq", n1: value.slice(7), n2: "" };
  if (value.startsWith("num:gt:")) return { mode: "gt", n1: value.slice(7), n2: "" };
  if (value.startsWith("num:gte:")) return { mode: "gte", n1: value.slice(8), n2: "" };
  if (value.startsWith("num:lt:")) return { mode: "lt", n1: value.slice(7), n2: "" };
  if (value.startsWith("num:lte:")) return { mode: "lte", n1: value.slice(8), n2: "" };
  if (value.startsWith("num:between:")) {
    const [a, b] = value.slice(12).split(",");
    return { mode: "between", n1: a ?? "", n2: b ?? "" };
  }
  return { mode: "", n1: "", n2: "" };
}

function encodeNumberFilter(mode: NumberMode, n1: string, n2: string): string {
  if (!mode) return "";
  if (mode === "set") return "num:set";
  if (mode === "empty") return "num:empty";
  if (mode === "eq" && n1 !== "") return `num:eq:${n1}`;
  if (mode === "gt" && n1 !== "") return `num:gt:${n1}`;
  if (mode === "gte" && n1 !== "") return `num:gte:${n1}`;
  if (mode === "lt" && n1 !== "") return `num:lt:${n1}`;
  if (mode === "lte" && n1 !== "") return `num:lte:${n1}`;
  if (mode === "between" && n1 !== "" && n2 !== "") return `num:between:${n1},${n2}`;
  return "";
}

export function NumberTableFilter({
  property,
  value,
  onChange,
}: NumberTableFilterProps) {
  const { mode, n1, n2 } = parseNumberFilter(value);

  const setMode = (next: NumberMode) => {
    onChange(encodeNumberFilter(next, n1, n2));
  };

  return (
    <div className="min-w-[10rem]">
      <label
        htmlFor={`filter-${property.id}-num-mode`}
        className={cn(sectionLabelMutedClass, "mb-1 block")}
      >
        {property.name}
      </label>
      <select
        id={`filter-${property.id}-num-mode`}
        value={mode}
        className={cn(selectClass, "w-full")}
        onChange={(e) => setMode(e.target.value as NumberMode)}
      >
        <option value="">Todos</option>
        <option value="set">Com valor</option>
        <option value="empty">Sem valor</option>
        <option value="eq">Igual a</option>
        <option value="gt">Maior que</option>
        <option value="gte">Maior ou igual</option>
        <option value="lt">Menor que</option>
        <option value="lte">Menor ou igual</option>
        <option value="between">Entre</option>
      </select>
      {mode === "eq" ||
      mode === "gt" ||
      mode === "gte" ||
      mode === "lt" ||
      mode === "lte" ? (
        <Input
          type="number"
          value={n1}
          className={cn(fieldClass, "mt-1.5 h-9 text-xs")}
          onChange={(e) => onChange(encodeNumberFilter(mode, e.target.value, n2))}
        />
      ) : null}
      {mode === "between" ? (
        <div className="mt-1.5 flex gap-1.5">
          <Input
            type="number"
            value={n1}
            aria-label="Valor mínimo"
            placeholder="Min"
            className={cn(fieldClass, "h-9 min-w-0 flex-1 text-xs")}
            onChange={(e) =>
              onChange(encodeNumberFilter(mode, e.target.value, n2))
            }
          />
          <Input
            type="number"
            value={n2}
            aria-label="Valor máximo"
            placeholder="Max"
            className={cn(fieldClass, "h-9 min-w-0 flex-1 text-xs")}
            onChange={(e) =>
              onChange(encodeNumberFilter(mode, n1, e.target.value))
            }
          />
        </div>
      ) : null}
    </div>
  );
}
