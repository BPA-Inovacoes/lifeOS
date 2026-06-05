import { Filter, X } from "lucide-react";
import { useMemo } from "react";

import { Input } from "@/components/ui/input";
import { DateTableFilter } from "@/database/components/DateTableFilter";
import { NumberTableFilter } from "@/database/components/NumberTableFilter";
import { RelationTableFilter } from "@/database/components/RelationTableFilter";
import { useRelationLabelMap } from "@/database/hooks/useRelationLabelMap";
import {
  describeFilterValue,
  emptyTableFilters,
  hasActiveFilters,
  isFilterableProperty,
  type FilterLogic,
  type TableFiltersState,
} from "@/database/utils/filterRows";
import { fieldClass, sectionLabelMutedClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";
import type { DatabaseProperty } from "@/types/database";

type TableFiltersProps = {
  workspaceId: string;
  properties: DatabaseProperty[];
  filters: TableFiltersState;
  onChange: (next: TableFiltersState) => void;
  totalRows: number;
  filteredCount: number;
};

const selectClass = cn(fieldClass, "h-9 min-w-[8rem] cursor-pointer text-xs");

function LogicToggle({
  logic,
  onChange,
}: {
  logic: FilterLogic;
  onChange: (logic: FilterLogic) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-none border border-border p-0.5">
      {(["and", "or"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          className={cn(
            "px-2.5 py-1 font-mono text-xs uppercase transition-colors",
            logic === mode
              ? "bg-emerald-900/50 text-emerald-800 dark:text-emerald-400"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-pressed={logic === mode}
          onClick={() => onChange(mode)}
        >
          {mode === "and" ? "E" : "Ou"}
        </button>
      ))}
    </div>
  );
}

export function TableFilters({
  workspaceId,
  properties,
  filters,
  onChange,
  totalRows,
  filteredCount,
}: TableFiltersProps) {
  const filterable = properties.filter(isFilterableProperty);
  const active = hasActiveFilters(filters);
  const relationLabels = useRelationLabelMap(workspaceId, properties);

  const setProperty = (propId: string, value: string) => {
    onChange({
      ...filters,
      byProperty: { ...filters.byProperty, [propId]: value },
    });
  };

  const clearProperty = (propId: string) => {
    const next = { ...filters.byProperty };
    delete next[propId];
    onChange({ ...filters, byProperty: next });
  };

  const chips = useMemo(() => {
    const out: { id: string; label: string; value: string }[] = [];
    if (filters.search.trim()) {
      out.push({
        id: "__search__",
        label: "Pesquisa",
        value: filters.search.trim(),
      });
    }
    for (const prop of filterable) {
      const encoded = filters.byProperty[prop.id] ?? "";
      if (!encoded) continue;
      const relationLabel =
        prop.type === "RELATION"
          ? relationLabels.get(encoded)
          : undefined;
      out.push({
        id: prop.id,
        label: prop.name,
        value: describeFilterValue(prop, encoded, relationLabel),
      });
    }
    return out;
  }, [filters, filterable, relationLabels]);

  const activeColumnFilters = chips.filter((c) => c.id !== "__search__").length;

  return (
    <div className="space-y-3 border-b border-border px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
          <Filter className="size-3.5 text-emerald-600/80" />
          Filtros
          {activeColumnFilters > 1 ? (
            <LogicToggle
              logic={filters.logic}
              onChange={(logic) => onChange({ ...filters, logic })}
            />
          ) : null}
        </span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {active
            ? `${filteredCount} de ${totalRows}`
            : `${totalRows} ${totalRows === 1 ? "linha" : "linhas"}`}
        </span>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1 border border-border bg-secondary/80 px-2 py-0.5 font-mono text-sm text-muted-foreground"
            >
              <span className="text-muted-foreground">{chip.label}:</span>
              <span className="max-w-[12rem] truncate text-foreground">
                {chip.value}
              </span>
              <button
                type="button"
                className="p-0.5 text-muted-foreground hover:text-foreground"
                aria-label={`Remover filtro ${chip.label}`}
                onClick={() => {
                  if (chip.id === "__search__") {
                    onChange({ ...filters, search: "" });
                  } else {
                    clearProperty(chip.id);
                  }
                }}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {active ? (
            <button
              type="button"
              className="px-2 py-0.5 font-mono text-xs uppercase text-muted-foreground hover:text-emerald-500"
              onClick={() => onChange(emptyTableFilters())}
            >
              Limpar tudo
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[12rem] flex-1 sm:max-w-xs">
          <label
            htmlFor="table-filter-search"
            className={cn(sectionLabelMutedClass, "mb-1 block")}
          >
            Pesquisar
          </label>
          <Input
            id="table-filter-search"
            value={filters.search}
            placeholder="Título, texto…"
            className={fieldClass}
            onChange={(e) =>
              onChange({ ...filters, search: e.target.value })
            }
          />
        </div>

        {filterable.map((prop) => {
          const value = filters.byProperty[prop.id] ?? "";

          if (prop.type === "RELATION") {
            return (
              <RelationTableFilter
                key={prop.id}
                workspaceId={workspaceId}
                property={prop}
                value={value}
                onChange={(v) => setProperty(prop.id, v)}
              />
            );
          }

          if (prop.type === "DATE") {
            return (
              <DateTableFilter
                key={prop.id}
                property={prop}
                value={value}
                onChange={(v) => setProperty(prop.id, v)}
              />
            );
          }

          if (prop.type === "NUMBER") {
            return (
              <NumberTableFilter
                key={prop.id}
                property={prop}
                value={value}
                onChange={(v) => setProperty(prop.id, v)}
              />
            );
          }

          if (prop.type === "CHECKBOX") {
            return (
              <div key={prop.id}>
                <label
                  htmlFor={`filter-${prop.id}`}
                  className={cn(sectionLabelMutedClass, "mb-1 block")}
                >
                  {prop.name}
                </label>
                <select
                  id={`filter-${prop.id}`}
                  value={value}
                  className={selectClass}
                  onChange={(e) => setProperty(prop.id, e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="yes">Sim</option>
                  <option value="no">Não</option>
                </select>
              </div>
            );
          }

          const options =
            (prop.config.options as string[] | undefined) ?? [];

          return (
            <div key={prop.id}>
              <label
                htmlFor={`filter-${prop.id}`}
                className={cn(sectionLabelMutedClass, "mb-1 block")}
              >
                {prop.name}
              </label>
              <select
                id={`filter-${prop.id}`}
                value={value}
                className={selectClass}
                onChange={(e) => setProperty(prop.id, e.target.value)}
              >
                <option value="">Todos</option>
                {options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
      </div>
    </div>
  );
}
