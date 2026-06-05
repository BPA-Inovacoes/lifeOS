import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GripVertical, LayoutGrid, Plus, Trash2, Zap } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { ViewPanelFooter } from "@/database/components/ViewPanelFooter";
import { ViewRequirementNotice } from "@/database/components/ViewRequirementNotice";
import { ViewToolbar } from "@/database/components/ViewToolbar";
import {
  addRowButtonLabel,
  formatRowCount,
  VIEW_LABELS,
  viewHint,
} from "@/database/utils/viewMeta";
import { groupRowsByProperty } from "@/database/engine";
import { boardColumnAccent, cnStatus } from "@/database/utils/statusStyles";
import {
  createDatabaseRow,
  deleteDatabaseRow,
  updateDatabaseRow,
} from "@/services/databaseApi";
import { applyRowGamificationFeedback } from "@/modules/game/utils/gamificationFeedback";
import { ClientFinanceLinkBadge } from "@/database/components/ClientFinanceLinkBadge";
import type { DatabaseDetail } from "@/services/databaseApi";
import type { DatabaseProperty, DatabaseRow } from "@/types/database";
import { rowPointsFromProps } from "@/utils/points";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

const DND_ROW_MIME = "application/x-lifeos-row-id";

type BoardViewProps = {
  workspaceId: string;
  database: DatabaseDetail;
  queryKey: readonly unknown[];
};

function findStatusProperty(properties: DatabaseProperty[]) {
  return properties.find((p) => p.type === "STATUS");
}

function rowTitle(properties: DatabaseProperty[], row: DatabaseRow) {
  const text = properties.find((p) => p.type === "TEXT");
  if (text) {
    const t = String(row.properties[text.id] ?? "").trim();
    return t || "Nova tarefa";
  }
  return "Nova tarefa";
}

export function BoardView({ workspaceId, database, queryKey }: BoardViewProps) {
  const qc = useQueryClient();
  const statusProp = findStatusProperty(database.properties);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const syncRows = useCallback(
    (rows: DatabaseRow[]) => {
      qc.setQueryData<{ database: DatabaseDetail }>(queryKey, (old) =>
        old ? { database: { ...old.database, rows } } : old
      );
    },
    [qc, queryKey]
  );

  const addRow = useMutation({
    mutationFn: (status: string) =>
      createDatabaseRow(workspaceId, database.id, {
        [statusProp!.id]: status,
      }),
    onSuccess: (data) => {
      syncRows([...database.rows, data.row]);
      toast.success("Cartão criado");
    },
  });

  const moveRow = useMutation({
    mutationFn: ({ rowId, status }: { rowId: string; status: string }) =>
      updateDatabaseRow(rowId, { [statusProp!.id]: status }),
    onMutate: async ({ rowId, status }) => {
      await qc.cancelQueries({ queryKey });
      const previous = qc.getQueryData<{ database: DatabaseDetail }>(queryKey);
      if (!previous || !statusProp) return { previous };

      const rows = previous.database.rows.map((r) =>
        r.id === rowId
          ? {
              ...r,
              properties: { ...r.properties, [statusProp.id]: status },
            }
          : r
      );

      qc.setQueryData<{ database: DatabaseDetail }>(queryKey, {
        database: { ...previous.database, rows },
      });

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        qc.setQueryData(queryKey, ctx.previous);
      }
    },
    onSuccess: (data) => {
      qc.setQueryData<{ database: DatabaseDetail }>(queryKey, (old) => {
        if (!old) return old;
        return {
          database: {
            ...old.database,
            rows: old.database.rows.map((r) =>
              r.id === data.row.id ? data.row : r
            ),
          },
        };
      });
      applyRowGamificationFeedback(qc, data.gamification);
      void qc.invalidateQueries({
        queryKey: ["dashboard"],
        refetchType: "none",
      });
    },
  });

  const removeRow = useMutation({
    mutationFn: (rowId: string) => deleteDatabaseRow(rowId),
    onSuccess: (_, rowId) => {
      syncRows(database.rows.filter((r) => r.id !== rowId));
      setPendingDelete(null);
      toast.success("Cartão apagado");
    },
  });

  const options = useMemo(
    () =>
      (statusProp?.config.options as string[] | undefined) ?? [
        "Por fazer",
        "Em progresso",
        "Concluído",
      ],
    [statusProp]
  );

  const grouped = useMemo(
    () =>
      statusProp
        ? groupRowsByProperty(database.rows, statusProp.id)
        : new Map<string, DatabaseRow[]>(),
    [database.rows, statusProp]
  );

  const handleDrop = (column: string, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverColumn(null);
    const rowId =
      e.dataTransfer.getData(DND_ROW_MIME) ||
      e.dataTransfer.getData("text/plain");
    if (!rowId || !statusProp) return;

    const row = database.rows.find((r) => r.id === rowId);
    if (!row) return;
    const current = String(row.properties[statusProp.id] ?? "");
    if (current === column) return;

    moveRow.mutate({ rowId, status: column });
  };

  if (!statusProp) {
    return (
      <>
        <ViewToolbar label={VIEW_LABELS.BOARD} hint={viewHint("BOARD")} />
        <ViewRequirementNotice>
          Adiciona uma propriedade do tipo{" "}
          <strong className="text-muted-foreground">Estado</strong> para usar o quadro
          Kanban.
        </ViewRequirementNotice>
      </>
    );
  }

  if (database.rows.length === 0) {
    return (
      <>
        <ViewToolbar label={VIEW_LABELS.BOARD} hint={viewHint("BOARD")} />
        <EmptyState
          icon={LayoutGrid}
          title="Quadro vazio"
          description="Adiciona a primeira tarefa numa coluna ou cria uma linha na vista Tabela."
          action={
            <Button
              type="button"
              size="sm"
              className="gap-2"
              disabled={addRow.isPending}
              onClick={() => addRow.mutate(options[0] ?? "Por fazer")}
            >
              <Plus className="size-4" />
              Nova tarefa
            </Button>
          }
        />
      </>
    );
  }

  return (
    <>
      <ViewToolbar label={VIEW_LABELS.BOARD} hint={viewHint("BOARD")} />

      <div className="lifeos-scrollbar-thin flex gap-4 overflow-x-auto pb-2">
        {options.map((column) => {
          const rows = grouped.get(column) ?? [];
          const isDropTarget = dragOverColumn === column;

          return (
            <div
              key={column}
              className={cn(
                "flex w-72 shrink-0 flex-col border bg-background transition-colors",
                isDropTarget
                  ? "border-emerald-600/60 bg-emerald-950/20"
                  : "border-border"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setDragOverColumn(column);
              }}
              onDragLeave={(e) => {
                if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                setDragOverColumn((c) => (c === column ? null : c));
              }}
              onDrop={(e) => handleDrop(column, e)}
            >
              <div
                className={cn("h-1 w-full shrink-0", boardColumnAccent(column))}
                aria-hidden
              />
              <div className="flex items-center justify-between border-b border-border px-3 py-3">
                <span className={cnStatus(column)}>{column}</span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {rows.length}
                </span>
              </div>

              <div className="flex min-h-[120px] flex-1 flex-col gap-2 p-2">
                {rows.length === 0 ? (
                  <p
                    className={cn(
                      "px-2 py-6 text-center font-mono text-xs uppercase",
                      isDropTarget ? "text-emerald-600/70" : "text-zinc-700"
                    )}
                  >
                    {isDropTarget ? "Largar aqui" : "vazio"}
                  </p>
                ) : (
                  rows.map((row) => {
                    const title = rowTitle(database.properties, row);
                    const vals = row.properties as Record<string, unknown>;
                    const pts = rowPointsFromProps(database.properties, vals);
                    const isDragging = draggingRowId === row.id;

                    return (
                      <div
                        key={row.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggingRowId(row.id);
                          e.dataTransfer.setData(DND_ROW_MIME, row.id);
                          e.dataTransfer.setData("text/plain", row.id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDraggingRowId(null);
                          setDragOverColumn(null);
                        }}
                        className={cn(
                          "group/card relative flex border border-border bg-card transition-colors",
                          isDragging && "opacity-40",
                          !isDragging && "hover:border-emerald-800/50"
                        )}
                      >
                        <span
                          className="flex w-7 shrink-0 cursor-grab items-center justify-center border-r border-border text-muted-foreground active:cursor-grabbing"
                          aria-hidden
                        >
                          <GripVertical className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1 px-2 py-2.5 pr-7">
                          <span className="line-clamp-2 text-sm text-foreground">
                            {title}
                          </span>
                          {pts > 0 ? (
                            <span className="mt-1.5 inline-flex items-center gap-1 border border-border bg-background px-1.5 py-0.5 font-mono text-sm text-emerald-800/90 dark:text-emerald-500/90">
                              <Zap className="size-3" />
                              {pts} pt
                            </span>
                          ) : null}
                          {database.template === "CLIENTS" &&
                          database.clientFinanceLinks?.[row.id] ? (
                            <ClientFinanceLinkBadge
                              link={database.clientFinanceLinks[row.id]}
                            />
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="absolute right-1 top-1.5 p-1 text-zinc-700 opacity-0 transition-opacity hover:text-red-400 group-hover/card:opacity-100"
                          aria-label="Apagar"
                          onClick={() =>
                            setPendingDelete({
                              id: row.id,
                              title: String(title),
                            })
                          }
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="justify-start gap-2 font-mono text-xs uppercase"
                  disabled={addRow.isPending}
                  onClick={() => addRow.mutate(column)}
                >
                  <Plus className="size-3.5" />
                  Adicionar
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <ViewPanelFooter
        className="mt-0 border border-t-0 border-border bg-secondary/40"
        countLabel={formatRowCount(database.rows.length, database.template)}
        addLabel={addRowButtonLabel(database.template)}
        addDisabled={addRow.isPending}
        onAdd={() => addRow.mutate(options[0] ?? "Por fazer")}
        countIcon={LayoutGrid}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Apagar cartão?"
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
