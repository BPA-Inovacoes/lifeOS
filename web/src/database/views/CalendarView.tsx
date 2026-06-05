import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { DataPanel } from "@/components/DataPanel";
import { EmptyState } from "@/components/EmptyState";
import { ViewPanelFooter } from "@/database/components/ViewPanelFooter";
import { ViewRequirementNotice } from "@/database/components/ViewRequirementNotice";
import { ViewToolbar } from "@/database/components/ViewToolbar";
import {
  addRowButtonLabel,
  formatRowCount,
  VIEW_LABELS,
  viewHint,
} from "@/database/utils/viewMeta";
import {
  buildMonthGrid,
  isSameDay,
  monthLabel,
  parseDateKey,
  parseRowDate,
  toDateKey,
  weekdayHeaders,
} from "@/database/utils/calendar";
import { statusBadgeClass } from "@/database/utils/statusStyles";
import {
  createDatabaseRow,
  updateDatabaseRow,
} from "@/services/databaseApi";
import { applyRowGamificationFeedback } from "@/modules/game/utils/gamificationFeedback";
import type { DatabaseDetail } from "@/services/databaseApi";
import type { DatabaseProperty, DatabaseRow } from "@/types/database";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

type CalendarViewProps = {
  workspaceId: string;
  database: DatabaseDetail;
  queryKey: readonly unknown[];
};

function findDateProperty(properties: DatabaseProperty[]) {
  return (
    properties.find((p) => p.name === "Data limite") ??
    properties.find((p) => p.type === "DATE")
  );
}

function rowTitle(properties: DatabaseProperty[], row: DatabaseRow) {
  const text = properties.find((p) => p.type === "TEXT");
  if (text) {
    const t = String(row.properties[text.id] ?? "").trim();
    return t || "Nova tarefa";
  }
  return "Nova tarefa";
}

export function CalendarView({
  workspaceId,
  database,
  queryKey,
}: CalendarViewProps) {
  const qc = useQueryClient();
  const dateProp = findDateProperty(database.properties);
  const statusProp = database.properties.find((p) => p.type === "STATUS");
  const today = useMemo(() => new Date(), []);

  const [cursor, setCursor] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [selectedKey, setSelectedKey] = useState<string>(() => toDateKey(today));

  const syncRows = (rows: DatabaseRow[]) => {
    qc.setQueryData<{ database: DatabaseDetail }>(queryKey, (old) =>
      old ? { database: { ...old.database, rows } } : old
    );
  };

  const addRow = useMutation({
    mutationFn: (dateKey: string) => {
      const props: Record<string, unknown> = {};
      if (dateProp) props[dateProp.id] = dateKey;
      if (statusProp) props[statusProp.id] = "Por fazer";
      return createDatabaseRow(workspaceId, database.id, props);
    },
    onSuccess: (data) => {
      syncRows([...database.rows, data.row]);
      toast.success("Tarefa criada");
    },
  });

  const patchRow = useMutation({
    mutationFn: ({
      rowId,
      propId,
      value,
    }: {
      rowId: string;
      propId: string;
      value: unknown;
    }) => updateDatabaseRow(rowId, { [propId]: value }),
    onSuccess: (data) => {
      syncRows(database.rows.map((r) => (r.id === data.row.id ? data.row : r)));
      applyRowGamificationFeedback(qc, data.gamification);
      void qc.invalidateQueries({
        queryKey: ["dashboard"],
        refetchType: "none",
      });
    },
  });

  const { byDate, unscheduled } = useMemo(() => {
    const map = new Map<string, DatabaseRow[]>();
    const loose: DatabaseRow[] = [];
    if (!dateProp) return { byDate: map, unscheduled: loose };

    for (const row of database.rows) {
      const key = parseRowDate(row.properties[dateProp.id]);
      if (!key) {
        loose.push(row);
        continue;
      }
      const list = map.get(key) ?? [];
      list.push(row);
      map.set(key, list);
    }
    return { byDate: map, unscheduled: loose };
  }, [database.rows, dateProp]);

  const weeks = buildMonthGrid(cursor.year, cursor.month);
  const selectedRows = byDate.get(selectedKey) ?? [];

  if (!dateProp) {
    return (
      <>
        <ViewToolbar label={VIEW_LABELS.CALENDAR} hint={viewHint("CALENDAR")} />
        <ViewRequirementNotice>
          Adiciona uma propriedade <strong className="text-muted-foreground">Data</strong>{" "}
          (ex.: Data limite) para usar o calendário.
        </ViewRequirementNotice>
      </>
    );
  }

  const shiftMonth = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  if (database.rows.length === 0) {
    return (
      <div className="space-y-6">
        <ViewToolbar label={VIEW_LABELS.CALENDAR} hint={viewHint("CALENDAR")} />
        <EmptyState
          icon={Calendar}
          title="Calendário vazio"
          description="Cria tarefas com data limite para as veres nos dias do mês."
          action={
            <Button
              type="button"
              size="sm"
              className="gap-2"
              disabled={addRow.isPending}
              onClick={() => addRow.mutate(selectedKey)}
            >
              <Plus className="size-4" />
              Nova tarefa hoje
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ViewToolbar
        label={VIEW_LABELS.CALENDAR}
        hint={viewHint("CALENDAR")}
        action={
          <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Mês anterior"
            onClick={() => shiftMonth(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-mono text-xs uppercase"
            onClick={() => {
              const now = new Date();
              setCursor({ year: now.getFullYear(), month: now.getMonth() });
              setSelectedKey(toDateKey(now));
            }}
          >
            Hoje
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Mês seguinte"
            onClick={() => shiftMonth(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
          </div>
        }
      />

      <h2 className="-mt-2 mb-2 text-lg font-medium text-foreground">
        {monthLabel(cursor.year, cursor.month)}
      </h2>

      <DataPanel>
        <div className="grid grid-cols-7 border-b border-border bg-secondary/80">
          {weekdayHeaders().map((wd) => (
            <div
              key={wd}
              className="px-1 py-2 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground"
            >
              {wd}
            </div>
          ))}
        </div>

        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 border-b border-border/60">
            {week.map((day, di) => {
              if (!day) {
                return (
                  <div
                    key={`e-${wi}-${di}`}
                    className="min-h-[88px] bg-background/30"
                  />
                );
              }
              const key = toDateKey(day);
              const items = byDate.get(key) ?? [];
              const isToday = isSameDay(day, today);
              const selected = key === selectedKey;
              const inMonth = day.getMonth() === cursor.month;

              return (
                <button
                  key={key}
                  type="button"
                  className={cn(
                    "min-h-[88px] border-r border-border/60 p-1.5 text-left transition-colors last:border-r-0",
                    inMonth ? "bg-background" : "bg-background/40",
                    selected && "ring-1 ring-inset ring-emerald-600/60",
                    isToday && "bg-emerald-950/20"
                  )}
                  onClick={() => setSelectedKey(key)}
                >
                  <span
                    className={cn(
                      "font-mono text-xs tabular-nums",
                      isToday ? "text-emerald-800 dark:text-emerald-500" : "text-muted-foreground"
                    )}
                  >
                    {day.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {items.slice(0, 2).map((row) => (
                      <span
                        key={row.id}
                        className="block truncate border border-border bg-card px-1 py-0.5 text-sm text-foreground"
                      >
                        {rowTitle(database.properties, row)}
                      </span>
                    ))}
                    {items.length > 2 ? (
                      <span className="font-mono text-sm text-muted-foreground">
                        +{items.length - 2}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </DataPanel>

      <DataPanel
        header={
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-emerald-600/80">
              {parseDateKey(selectedKey).toLocaleDateString("pt-PT", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedRows.length}{" "}
              {selectedRows.length === 1 ? "tarefa" : "tarefas"} neste dia
            </p>
          </div>
        }
        footer={
          <ViewPanelFooter
            countLabel={formatRowCount(database.rows.length, database.template)}
            addLabel={addRowButtonLabel(database.template)}
            addDisabled={addRow.isPending}
            onAdd={() => addRow.mutate(selectedKey)}
            countIcon={Calendar}
          />
        }
      >
        <ul className="divide-y divide-zinc-800">
          {selectedRows.length === 0 ? (
            <li className="px-4 py-6">
              <p className="text-center text-sm text-muted-foreground">
                Nenhuma tarefa neste dia.
              </p>
              <div className="mt-3 flex justify-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  disabled={addRow.isPending}
                  onClick={() => addRow.mutate(selectedKey)}
                >
                  <Plus className="size-4" />
                  Agendar aqui
                </Button>
              </div>
            </li>
          ) : (
            selectedRows.map((row) => {
              const title = rowTitle(database.properties, row);
              const status = statusProp
                ? String(row.properties[statusProp.id] ?? "Por fazer")
                : "Por fazer";
              return (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3"
                >
                  <span className="min-w-0 flex-1 text-sm text-foreground">
                    {title}
                  </span>
                  {statusProp ? (
                    <select
                      value={status}
                      className={cn(
                        "h-8 border bg-card px-2 font-mono text-xs uppercase",
                        statusBadgeClass(status)
                      )}
                      onChange={(e) =>
                        patchRow.mutate({
                          rowId: row.id,
                          propId: statusProp.id,
                          value: e.target.value,
                        })
                      }
                    >
                      {(
                        (statusProp.config.options as string[] | undefined) ?? [
                          "Por fazer",
                          "Em progresso",
                          "Concluído",
                        ]
                      ).map((opt) => (
                        <option key={opt} value={opt} className="bg-card">
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <DateInput
                    value={selectedKey}
                    className="h-8 min-w-0 px-2"
                    onChange={(e) =>
                      patchRow.mutate({
                        rowId: row.id,
                        propId: dateProp.id,
                        value: e.target.value || null,
                      })
                    }
                  />
                </li>
              );
            })
          )}
        </ul>
      </DataPanel>

      {unscheduled.length > 0 ? (
        <DataPanel
          header={
            <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Sem data ({unscheduled.length})
            </p>
          }
        >
          <ul className="space-y-2 p-4">
            {unscheduled.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-3 border border-border bg-card/60 px-3 py-2"
              >
                <span className="flex-1 text-sm text-foreground">
                  {rowTitle(database.properties, row)}
                </span>
                <DateInput
                  className="h-8 min-w-0 px-2"
                  onChange={(e) => {
                    if (!e.target.value) return;
                    patchRow.mutate({
                      rowId: row.id,
                      propId: dateProp.id,
                      value: e.target.value,
                    });
                  }}
                />
              </li>
            ))}
          </ul>
        </DataPanel>
      ) : null}
    </div>
  );
}
