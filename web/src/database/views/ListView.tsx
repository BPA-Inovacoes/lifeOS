import { useMutation, useQueryClient } from "@tanstack/react-query";

import { HabitHeatmap } from "@/database/components/HabitHeatmap";
import { HabitStreakBadge } from "@/database/components/HabitStreakBadge";
import { useOptimisticPatchRow } from "@/database/hooks/useOptimisticPatchRow";
import { Flame, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { DataPanel } from "@/components/DataPanel";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { ViewPanelFooter } from "@/database/components/ViewPanelFooter";
import { ViewToolbar } from "@/database/components/ViewToolbar";
import {
  addRowButtonLabel,
  formatRowCount,
  VIEW_LABELS,
  viewHint,
} from "@/database/utils/viewMeta";
import { PropertyCell } from "@/database/components/PropertyCell";
import { createDatabaseRow, deleteDatabaseRow } from "@/services/databaseApi";
import type { DatabaseDetail } from "@/services/databaseApi";
import type { DatabaseProperty, DatabaseRow } from "@/types/database";
import { formatPoints, pointsBadgeClass, rowPointsFromProps } from "@/utils/points";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

type ListViewProps = {
  workspaceId: string;
  database: DatabaseDetail;
  queryKey: readonly unknown[];
};

function rowTitle(properties: DatabaseProperty[], row: DatabaseRow) {
  const text = properties.find((p) => p.type === "TEXT");
  if (text) {
    const t = String(row.properties[text.id] ?? "").trim();
    return t || "Nova tarefa";
  }
  return "Nova tarefa";
}

function findDoneProp(properties: DatabaseProperty[]) {
  return properties.find(
    (p) => p.type === "CHECKBOX" && p.name.toLowerCase().includes("feito")
  );
}

function findFreqProp(properties: DatabaseProperty[]) {
  return properties.find(
    (p) => p.name === "Frequência" || p.name === "Frequencia"
  );
}

export function ListView({ workspaceId, database, queryKey }: ListViewProps) {
  const qc = useQueryClient();
  const isHabits = database.template === "HABITS";
  const doneProp = findDoneProp(database.properties);
  const freqProp = findFreqProp(database.properties);
  const [pendingDelete, setPendingDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const syncRows = (rows: DatabaseRow[]) => {
    qc.setQueryData<{ database: DatabaseDetail }>(queryKey, (old) =>
      old ? { database: { ...old.database, rows } } : old
    );
  };

  const addRow = useMutation({
    mutationFn: () => createDatabaseRow(workspaceId, database.id),
    onSuccess: (data) => {
      syncRows([...database.rows, data.row]);
      toast.success(isHabits ? "Hábito criado" : "Linha criada");
    },
  });

  const patchRow = useOptimisticPatchRow({
    queryKey,
    doneProp: isHabits ? doneProp : undefined,
  });

  const removeRow = useMutation({
    mutationFn: (rowId: string) => deleteDatabaseRow(rowId),
    onSuccess: (_, rowId) => {
      syncRows(database.rows.filter((r) => r.id !== rowId));
      setPendingDelete(null);
      toast.success("Registo apagado");
    },
  });

  const sortedRows = useMemo(() => {
    const activity = database.rowActivity ?? {};
    return [...database.rows].sort((a, b) => {
      const actA = activity[a.id];
      const actB = activity[b.id];
      const doneA = actA?.doneToday ?? Boolean(doneProp && a.properties[doneProp.id]);
      const doneB = actB?.doneToday ?? Boolean(doneProp && b.properties[doneProp.id]);
      if (doneA !== doneB) return doneA ? 1 : -1;
      const streakA = actA?.streak ?? 0;
      const streakB = actB?.streak ?? 0;
      return streakB - streakA;
    });
  }, [database.rows, database.rowActivity, doneProp]);

  const doneCount = sortedRows.filter((row) => {
    const act = database.rowActivity?.[row.id];
    return act?.doneToday ?? Boolean(doneProp && row.properties[doneProp!.id]);
  }).length;

  const avgConsistency = useMemo(() => {
    const acts = Object.values(database.rowActivity ?? {});
    if (acts.length === 0) return null;
    const withRate = acts.filter((a) => typeof a.consistency === "number");
    if (withRate.length === 0) return null;
    return Math.round(
      withRate.reduce((n, a) => n + (a.consistency ?? 0), 0) / withRate.length
    );
  }, [database.rowActivity]);

  const habitHint =
    isHabits && avgConsistency !== null
      ? `${doneCount}/${database.rows.length} feitos hoje · ${avgConsistency}% consistência (30d)`
      : isHabits
        ? `${doneCount}/${database.rows.length} feitos hoje · ${viewHint("LIST", "HABITS")}`
        : viewHint("LIST");

  return (
    <>
      <ViewToolbar label={VIEW_LABELS.LIST} hint={habitHint} />

      <DataPanel
        footer={
          <ViewPanelFooter
            countLabel={formatRowCount(database.rows.length, database.template)}
            addLabel={addRowButtonLabel(database.template)}
            addDisabled={addRow.isPending}
            onAdd={() => addRow.mutate()}
          />
        }
      >
        {sortedRows.length === 0 ? (
          <div className="p-4">
            <EmptyState
              compact
              icon={Flame}
              title={isHabits ? "Sem hábitos" : "Lista vazia"}
              description={
                isHabits
                  ? "Cria o primeiro hábito para acompanhar streaks e pontos."
                  : "Adiciona registos para ver nesta vista."
              }
              action={
                <Button
                  type="button"
                  size="sm"
                  className="gap-2"
                  disabled={addRow.isPending}
                  onClick={() => addRow.mutate()}
                >
                  <Plus className="size-4" />
                  {isHabits ? "Criar hábito" : "Criar primeiro"}
                </Button>
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {sortedRows.map((row) => {
              const title = rowTitle(database.properties, row);
              const vals = row.properties as Record<string, unknown>;
              const pts = rowPointsFromProps(database.properties, vals);
              const act = database.rowActivity?.[row.id];
              const done =
                act?.doneToday ??
                Boolean(doneProp && row.properties[doneProp.id]);
              const streak = act?.streak ?? 0;
              const freq = freqProp
                ? String(row.properties[freqProp.id] ?? "")
                : "";

              if (isHabits && doneProp) {
                const frequency = act?.frequency ?? "daily";
                const consistency = act?.consistency ?? 0;
                const heatmap = act?.heatmap ?? [];

                return (
                  <li
                    key={row.id}
                    className={cn(
                      "group/row px-4 py-4 transition-colors",
                      done ? "bg-secondary/40" : "hover:bg-card/60"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center border transition-colors",
                          done
                            ? "border-emerald-800 bg-emerald-950/50 text-emerald-800 dark:text-emerald-500"
                            : "border-border text-muted-foreground hover:border-emerald-800 hover:text-emerald-500"
                        )}
                        aria-label={done ? "Desmarcar" : "Marcar feito hoje"}
                        onClick={() =>
                          patchRow.mutate({
                            rowId: row.id,
                            propId: doneProp.id,
                            value: !done,
                          })
                        }
                      >
                        <span className="font-mono text-lg leading-none">
                          {done ? "✓" : ""}
                        </span>
                      </button>

                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            "font-medium text-foreground",
                            done && "text-muted-foreground line-through"
                          )}
                        >
                          {title}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {freq ? (
                            <span className="font-mono text-xs uppercase text-muted-foreground">
                              {freq}
                            </span>
                          ) : null}
                          {typeof act?.consistency === "number" ? (
                            <span className="font-mono text-xs uppercase text-muted-foreground">
                              {consistency}% consistência
                            </span>
                          ) : null}
                          {pts > 0 ? (
                            <span
                              className={cn(
                                "border px-1.5 py-0.5 font-mono text-xs uppercase",
                                pointsBadgeClass(done)
                              )}
                            >
                              {done ? formatPoints(pts) : `${pts} pt`}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <HabitStreakBadge
                        streak={streak}
                        bestStreak={act?.bestStreak}
                        frequency={frequency}
                      />

                      <button
                        type="button"
                        className="shrink-0 p-1.5 text-zinc-700 opacity-0 transition-opacity hover:text-red-400 group-hover/row:opacity-100"
                        aria-label="Apagar"
                        onClick={() =>
                          setPendingDelete({ id: row.id, title })
                        }
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {heatmap.length > 0 ? (
                      <div className="mt-3 pl-14">
                        <HabitHeatmap cells={heatmap} compact />
                      </div>
                    ) : null}
                  </li>
                );
              }

              return (
                <li
                  key={row.id}
                  className="group/row flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-secondary/50"
                >
                  <span className="min-w-[140px] flex-1 text-sm font-medium text-foreground">
                    {title}
                  </span>
                  {database.properties
                    .filter((p) => p.type !== "TEXT")
                    .slice(0, 4)
                    .map((prop) => (
                      <div key={prop.id} className="min-w-[120px]">
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
                    ))}
                  <button
                    type="button"
                    className="p-1.5 text-zinc-700 opacity-0 hover:text-red-400 group-hover/row:opacity-100"
                    aria-label="Apagar"
                    onClick={() => setPendingDelete({ id: row.id, title })}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </DataPanel>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Apagar registo?"
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
