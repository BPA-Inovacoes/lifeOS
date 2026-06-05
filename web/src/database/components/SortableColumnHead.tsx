import { ArrowDown, ArrowUp, ArrowUpDown, GripVertical } from "lucide-react";

import type { SortDirection, TableSortState } from "@/database/utils/sortRows";
import { sortEntryForProp } from "@/database/utils/sortRows";
import { cn } from "@/lib/utils";

type SortableColumnHeadProps = {
  label: string;
  propId: string;
  sort: TableSortState;
  sortable?: boolean;
  draggable?: boolean;
  isDragOver?: boolean;
  onSort: (propId: string, additive: boolean) => void;
  onDragStart?: (propId: string) => void;
  onDragEnd?: () => void;
};

export function SortableColumnHead({
  label,
  propId,
  sort,
  sortable = true,
  draggable = true,
  isDragOver,
  onSort,
  onDragStart,
  onDragEnd,
}: SortableColumnHeadProps) {
  const entry = sortEntryForProp(sort, propId);
  const direction: SortDirection | null = entry?.direction ?? null;
  const sortPriority =
    entry && sort.length > 1
      ? sort.findIndex((e) => e.propId === propId) + 1
      : null;

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1 pr-2",
        isDragOver && "rounded-none bg-emerald-950/40 ring-1 ring-emerald-700/50"
      )}
    >
      {draggable ? (
        <button
          type="button"
          draggable
          aria-label={`Reordenar coluna ${label}`}
          className="cursor-grab touch-none p-0.5 text-muted-foreground hover:text-muted-foreground active:cursor-grabbing"
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", propId);
            onDragStart?.(propId);
          }}
          onDragEnd={() => onDragEnd?.()}
        >
          <GripVertical className="size-3 shrink-0" aria-hidden />
        </button>
      ) : null}

      {!sortable ? (
        <span className="truncate font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      ) : (
        <button
          type="button"
          className={cn(
            "group/sort inline-flex min-w-0 items-center gap-1 font-mono text-xs font-medium uppercase tracking-wider transition-colors",
            direction ? "text-emerald-800 dark:text-emerald-500" : "text-muted-foreground hover:text-foreground"
          )}
          title="Shift+clique para ordenar por várias colunas"
          onClick={(e) => onSort(propId, e.shiftKey)}
        >
          <span className="truncate">{label}</span>
          {sortPriority != null ? (
            <span className="font-mono text-xs tabular-nums text-emerald-600/80">
              {sortPriority}
            </span>
          ) : null}
          {direction === "asc" ? (
            <ArrowUp className="size-3 shrink-0" aria-hidden />
          ) : direction === "desc" ? (
            <ArrowDown className="size-3 shrink-0" aria-hidden />
          ) : (
            <ArrowUpDown
              className="size-3 shrink-0 opacity-0 transition-opacity group-hover/sort:opacity-60"
              aria-hidden
            />
          )}
        </button>
      )}
    </div>
  );
}
