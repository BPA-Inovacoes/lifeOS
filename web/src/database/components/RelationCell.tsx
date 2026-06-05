import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Link2 } from "lucide-react";
import { Link } from "react-router-dom";

import { rowLabelFromProperties } from "@/database/utils/rowLabel";
import { fetchDatabase } from "@/services/databaseApi";
import { paths } from "@/routes/paths";
import { fieldClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";
import type { DatabaseProperty } from "@/types/database";

type RelationCellProps = {
  workspaceId: string;
  property: DatabaseProperty;
  value: unknown;
  onChange: (value: unknown) => void;
};

export function RelationCell({
  workspaceId,
  property,
  value,
  onChange,
}: RelationCellProps) {
  const relatedId = property.config.relatedDatabaseId as string | undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["database", workspaceId, relatedId, "relation-pick"],
    queryFn: () => fetchDatabase(workspaceId, relatedId!),
    enabled: Boolean(workspaceId && relatedId),
    staleTime: 60_000,
  });

  const strValue = value ? String(value) : "";
  const rows = data?.database.rows ?? [];
  const props = data?.database.properties ?? [];

  return (
    <div className="flex items-center gap-1.5">
      <Link2 className="size-3.5 shrink-0 text-emerald-600/70" aria-hidden />
      <select
        value={strValue}
        disabled={!relatedId || isLoading}
        className={cn(fieldClass, "h-9 min-w-0 flex-1 cursor-pointer text-xs")}
        onChange={(e) => onChange(e.target.value || null)}
      >
        <option value="" className="bg-card">
          {isLoading ? "A carregar…" : "—"}
        </option>
        {rows.map((row) => (
          <option key={row.id} value={row.id} className="bg-card">
            {rowLabelFromProperties(props, row.properties)}
          </option>
        ))}
      </select>
      {strValue && relatedId ? (
        <Link
          to={paths.focus.database(workspaceId, relatedId)}
          title="Abrir base relacionada"
          className="shrink-0 rounded-none border border-border p-1.5 text-emerald-600/80 transition-colors hover:border-emerald-800 hover:text-emerald-500"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          <span className="sr-only">Abrir base relacionada</span>
        </Link>
      ) : null}
    </div>
  );
}
