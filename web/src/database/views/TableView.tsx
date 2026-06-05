import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRelationLabelMap } from "@/database/hooks/useRelationLabelMap";
import { useTableVirtualizer, TABLE_ROW_HEIGHT } from "@/database/hooks/useTableVirtualizer";

import { useOptimisticPatchRow } from "@/database/hooks/useOptimisticPatchRow";
import { ListTodo, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataPanel } from "@/components/DataPanel";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { ColumnResizeHandle } from "@/database/components/ColumnResizeHandle";
import { PropertyCell } from "@/database/components/PropertyCell";
import { SortableColumnHead } from "@/database/components/SortableColumnHead";
import { TableColumnMenu } from "@/database/components/TableColumnMenu";
import { TableFilters } from "@/database/components/TableFilters";
import { ViewPanelFooter } from "@/database/components/ViewPanelFooter";
import { ViewToolbar } from "@/database/components/ViewToolbar";
import {
  addRowButtonLabel,
  formatRowCount,
  VIEW_LABELS,
  viewHint,
} from "@/database/utils/viewMeta";
import {
  emptyColumnPrefs,
  getColumnWidth,
  normalizeColumnPrefs,
  orderedVisibleProperties,
  reorderColumn,
  setColumnWidth,
  tableColumnPercents,
  type TableColumnPrefs,
} from "@/database/utils/columnPrefs";
import {
  emptyTableFilters,
  filterTableRows,
  hasActiveFilters,
  normalizeTableFilters,
  type TableFiltersState,
} from "@/database/utils/filterRows";
import {
  emptyTableSort,
  isSortableProperty,
  nextTableSort,
  normalizeTableSort,
  sortTableRows,
  type TableSortState,
} from "@/database/utils/sortRows";
import {
  loadTableViewPrefs,
  saveTableViewPrefs,
} from "@/database/utils/tableViewPrefs";
import { toast } from "@/store/toastStore";
import { createDatabaseRow, deleteDatabaseRow } from "@/services/databaseApi";
import type { DatabaseDetail } from "@/services/databaseApi";
import type { DatabaseProperty, DatabaseRow } from "@/types/database";
import { cn } from "@/lib/utils";

type TableViewProps = {
  workspaceId: string;
  database: DatabaseDetail;
  queryKey: readonly unknown[];
};

function rowTitle(properties: DatabaseProperty[], row: DatabaseRow) {
  const text = properties.find((p) => p.type === "TEXT");
  if (text) return String(row.properties[text.id] ?? "Linha sem título");
  return "Linha";
}

export function TableView({ workspaceId, database, queryKey }: TableViewProps) {
  const qc = useQueryClient();
  const properties = database.properties;
  const [filters, setFilters] = useState<TableFiltersState>(emptyTableFilters());
  const [sort, setSort] = useState<TableSortState>(emptyTableSort());
  const [columns, setColumns] = useState<TableColumnPrefs>(emptyColumnPrefs());
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [dragColId, setDragColId] = useState<string | null>(null);
  const [dropColId, setDropColId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resizeSession = useRef({ propId: "", startWidth: 0 });
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    setPrefsLoaded(false);
    const saved = loadTableViewPrefs(workspaceId, database.id);
    if (saved) {
      setFilters(normalizeTableFilters(saved.filters));
      setSort(normalizeTableSort(saved.sort));
      setColumns(normalizeColumnPrefs(saved.columns));
    } else {
      setFilters(emptyTableFilters());
      setSort(emptyTableSort());
      setColumns(emptyColumnPrefs());
    }
    setPrefsLoaded(true);
  }, [workspaceId, database.id]);

  useEffect(() => {
    if (!prefsLoaded) return;
    saveTableViewPrefs(workspaceId, database.id, { filters, sort, columns });
  }, [filters, sort, columns, prefsLoaded, workspaceId, database.id]);

  const visibleProps = useMemo(
    () => orderedVisibleProperties(properties, columns),
    [properties, columns]
  );

  const columnPercents = useMemo(
    () => tableColumnPercents(visibleProps, columns),
    [visibleProps, columns]
  );

  const relationLabels = useRelationLabelMap(workspaceId, properties);

  const displayedRows = useMemo(() => {
    const filtered = filterTableRows(database.rows, properties, filters);
    return sortTableRows(filtered, properties, sort, relationLabels);
  }, [database.rows, properties, filters, sort, relationLabels]);

  const virtual = useTableVirtualizer(displayedRows.length, scrollRef);
  const rowsToRender = virtual.virtualized
    ? displayedRows.slice(virtual.start, virtual.end)
    : displayedRows;

  const syncRows = useCallback(
    (rows: DatabaseRow[]) => {
      qc.setQueryData<{ database: DatabaseDetail }>(queryKey, (old) =>
        old ? { database: { ...old.database, rows } } : old
      );
    },
    [qc, queryKey]
  );

  const addRow = useMutation({
    mutationFn: () => createDatabaseRow(workspaceId, database.id),
    onSuccess: (data) => {
      syncRows([...database.rows, data.row]);
      toast.success("Linha criada");
    },
  });

  const doneProp = properties.find(
    (p) => p.type === "CHECKBOX" && p.name.toLowerCase().includes("feito")
  );

  const patchRow = useOptimisticPatchRow({
    queryKey,
    doneProp:
      database.template === "HABITS" ? doneProp : undefined,
    touchDashboard: database.template === "HABITS",
  });

  const removeRow = useMutation({
    mutationFn: (rowId: string) => deleteDatabaseRow(rowId),
    onSuccess: (_, rowId) => {
      syncRows(database.rows.filter((r) => r.id !== rowId));
      setPendingDelete(null);
      toast.success("Linha apagada");
    },
  });

  const filtering = hasActiveFilters(filters);

  const countLabel =
    filtering || sort.length > 0
      ? `${displayedRows.length} visíveis · ${formatRowCount(database.rows.length, database.template)}`
      : formatRowCount(database.rows.length, database.template);

  return (
    <>
      <ViewToolbar
        label={VIEW_LABELS.TABLE}
        hint={viewHint("TABLE")}
        action={
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {visibleProps.length}/{properties.length} colunas
            </span>
            <TableColumnMenu
              properties={properties}
              columns={columns}
              onChange={setColumns}
            />
          </div>
        }
      />

      <DataPanel
        footer={
          <ViewPanelFooter
            countLabel={countLabel}
            addLabel={addRowButtonLabel(database.template)}
            addDisabled={addRow.isPending}
            onAdd={() => addRow.mutate()}
          />
        }
      >
        <TableFilters
          workspaceId={workspaceId}
          properties={properties}
          filters={filters}
          onChange={setFilters}
          totalRows={database.rows.length}
          filteredCount={displayedRows.length}
        />

        <div
          ref={scrollRef}
          className={cn(
            "min-w-0 overflow-auto",
            virtual.virtualized && "max-h-[min(70vh,720px)]"
          )}
        >
          <table className="w-full table-fixed border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-card">
              <tr className="border-b border-border">
                <th className="w-10 px-3 py-3 text-center font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  #
                </th>
                {visibleProps.map((prop) => {
                  const pct = columnPercents.get(prop.id);
                  return (
                    <th
                      key={prop.id}
                      style={pct != null ? { width: `${pct}%` } : undefined}
                      className="relative min-w-0 px-3 py-3 text-left"
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragColId && dragColId !== prop.id) {
                          setDropColId(prop.id);
                        }
                      }}
                      onDragLeave={() => setDropColId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragColId && dragColId !== prop.id) {
                          setColumns((c) =>
                            reorderColumn(c, properties, dragColId, prop.id)
                          );
                        }
                        setDragColId(null);
                        setDropColId(null);
                      }}
                    >
                      <SortableColumnHead
                        label={prop.name}
                        propId={prop.id}
                        sort={sort}
                        sortable={isSortableProperty(prop)}
                        isDragOver={dropColId === prop.id}
                        onSort={(id, additive) =>
                          setSort((s) => nextTableSort(s, id, { additive }))
                        }
                        onDragStart={setDragColId}
                        onDragEnd={() => {
                          setDragColId(null);
                          setDropColId(null);
                        }}
                      />
                      <ColumnResizeHandle
                        onResizeStart={() => {
                          resizeSession.current = {
                            propId: prop.id,
                            startWidth: getColumnWidth(columns, prop.id),
                          };
                        }}
                        onResize={(deltaX) => {
                          const { propId, startWidth } = resizeSession.current;
                          setColumns((c) =>
                            setColumnWidth(c, propId, startWidth + deltaX)
                          );
                        }}
                      />
                    </th>
                  );
                })}
                <th className="w-12 px-2" aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {database.rows.length === 0 ? (
                <tr>
                  <td colSpan={visibleProps.length + 2} className="p-4">
                    <EmptyState
                      compact
                      icon={ListTodo}
                      title="Nenhuma tarefa ainda"
                      description="Cria a primeira linha para começar a organizar este espaço."
                      action={
                        <Button
                          type="button"
                          size="sm"
                          className="gap-2"
                          disabled={addRow.isPending}
                          onClick={() => addRow.mutate()}
                        >
                          <Plus className="size-4" />
                          Criar primeira linha
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleProps.length + 2} className="p-4">
                    <EmptyState
                      compact
                      icon={ListTodo}
                      title="Sem resultados"
                      description="Nenhuma linha corresponde aos filtros activos."
                      action={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setFilters(emptyTableFilters())}
                        >
                          Limpar filtros
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                <>
                  {virtual.topSpacer > 0 ? (
                    <tr aria-hidden>
                      <td
                        colSpan={visibleProps.length + 2}
                        style={{ height: virtual.topSpacer, padding: 0, border: 0 }}
                      />
                    </tr>
                  ) : null}
                  {rowsToRender.map((row, sliceIndex) => {
                    const index = virtual.virtualized
                      ? virtual.start + sliceIndex
                      : sliceIndex;
                    return (
                      <tr
                        key={row.id}
                        style={
                          virtual.virtualized
                            ? { height: TABLE_ROW_HEIGHT }
                            : undefined
                        }
                        className={cn(
                          "group/row border-b border-border/80 transition-colors",
                          "hover:bg-card/60",
                          index % 2 === 1 && "bg-secondary/20"
                        )}
                      >
                        <td className="px-3 py-2.5 text-center font-mono text-xs tabular-nums text-muted-foreground">
                          {index + 1}
                        </td>
                        {visibleProps.map((prop) => {
                          const pct = columnPercents.get(prop.id);
                          return (
                            <td
                              key={prop.id}
                              style={
                                pct != null ? { width: `${pct}%` } : undefined
                              }
                              className="min-w-0 overflow-hidden px-3 py-2 align-middle"
                            >
                              <div className="min-w-0 w-full">
                                <PropertyCell
                                  workspaceId={workspaceId}
                                  property={prop}
                                  value={row.properties[prop.id]}
                                  onChange={(value) =>
                                    patchRow.mutate({
                                      rowId: row.id,
                                      propId: prop.id,
                                      value,
                                    })
                                  }
                                />
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            className="p-1.5 text-zinc-700 opacity-0 transition-all hover:text-red-400 group-hover/row:opacity-100"
                            aria-label="Apagar linha"
                            onClick={() =>
                              setPendingDelete({
                                id: row.id,
                                title: rowTitle(properties, row),
                              })
                            }
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {virtual.bottomSpacer > 0 ? (
                    <tr aria-hidden>
                      <td
                        colSpan={visibleProps.length + 2}
                        style={{
                          height: virtual.bottomSpacer,
                          padding: 0,
                          border: 0,
                        }}
                      />
                    </tr>
                  ) : null}
                </>
              )}
            </tbody>
          </table>
        </div>
      </DataPanel>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Apagar linha?"
        description={
          pendingDelete
            ? `«${pendingDelete.title}» será removido permanentemente.`
            : ""
        }
        loading={removeRow.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) removeRow.mutate(pendingDelete.id);
        }}
      />
    </>
  );
}
