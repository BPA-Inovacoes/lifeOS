import { useQuery } from "@tanstack/react-query";

import { fetchDatabase } from "@/services/databaseApi";
import { fieldClass, sectionLabelMutedClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";
import type { DatabaseProperty, DatabaseRow } from "@/types/database";

type RelationTableFilterProps = {
  workspaceId: string;
  property: DatabaseProperty;
  value: string;
  onChange: (value: string) => void;
};

function rowLabel(properties: DatabaseProperty[], row: DatabaseRow): string {
  const text = properties.find((p) => p.type === "TEXT");
  if (text) {
    const t = String(row.properties[text.id] ?? "").trim();
    if (t) return t;
  }
  return "Sem nome";
}

const selectClass = cn(fieldClass, "h-9 min-w-[8rem] cursor-pointer text-xs");

export function RelationTableFilter({
  workspaceId,
  property,
  value,
  onChange,
}: RelationTableFilterProps) {
  const relatedId = property.config.relatedDatabaseId as string | undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["database", workspaceId, relatedId, "relation-filter"],
    queryFn: () => fetchDatabase(workspaceId, relatedId!),
    enabled: Boolean(workspaceId && relatedId),
    staleTime: 60_000,
  });

  const rows = data?.database.rows ?? [];
  const props = data?.database.properties ?? [];

  return (
    <div>
      <label
        htmlFor={`filter-${property.id}`}
        className={cn(sectionLabelMutedClass, "mb-1 block")}
      >
        {property.name}
      </label>
      <select
        id={`filter-${property.id}`}
        value={value}
        disabled={!relatedId || isLoading}
        className={selectClass}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todos</option>
        {rows.map((row) => (
          <option key={row.id} value={row.id}>
            {rowLabel(props, row)}
          </option>
        ))}
      </select>
    </div>
  );
}
