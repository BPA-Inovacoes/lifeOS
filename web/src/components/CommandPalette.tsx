import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Database,
  FilePlus,
  FileText,
  Flame,
  Repeat2,
  GraduationCap,
  Keyboard,
  LayoutDashboard,
  ListTodo,
  Plus,
  Search,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppModal } from "@/components/AppModal";
import { scorePaletteItem } from "@/components/commandPalette/paletteRank";
import { UI_DASHBOARD, UI_DATABASE, UI_WORKSPACE } from "@/constants/uiLabels";
import {
  SECTION_LABELS,
  type PaletteItem,
  type PaletteSection,
} from "@/components/commandPalette/types";
import { useCommandPalette } from "@/hooks/useCommandPalette";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { cn } from "@/lib/utils";
import { createDatabaseRow } from "@/services/databaseApi";
import { globalSearch } from "@/services/searchApi";
import { createPage } from "@/services/workspaceApi";
import { resolvePageIcon } from "@/modules/workspace/pageIcons";
import { toast } from "@/store/toastStore";
import { useUiStore } from "@/store/uiStore";
import type { DatabaseSummary, WorkspaceSummary } from "@/types/workspace";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { paths } from "@/routes/paths";
import { useAppModeStore } from "@/store/appModeStore";
import {
  fieldClass,
  kbdClass,
  navItemActiveClass,
  navItemClass,
  navItemIdleClass,
  techCardAccentClass,
  techCardClass,
} from "@/styles/designTokens";

function findDb(databases: DatabaseSummary[], template: string, nameHint?: string) {
  return (
    databases.find((d) => d.template === template) ??
    (nameHint
      ? databases.find((d) => d.name.toLowerCase().includes(nameHint))
      : undefined)
  );
}

function rankItems(items: PaletteItem[], query: string) {
  return [...items]
    .map((item) => ({
      item,
      score: scorePaletteItem(query, item.label, item.hint, {
        kind: item.kind,
        inActiveWorkspace: item.boost,
      }),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

function groupBySection(items: PaletteItem[]) {
  const order: PaletteSection[] = ["create", "go", "search"];
  const map = new Map<PaletteSection, PaletteItem[]>();
  for (const item of items) {
    const list = map.get(item.section) ?? [];
    list.push(item);
    map.set(item.section, list);
  }
  return order
    .filter((s) => map.has(s))
    .map((section) => ({ section, items: map.get(section)! }));
}

export function CommandPalette({
  workspaces,
  databases = [],
}: {
  workspaces: WorkspaceSummary[];
  databases?: DatabaseSummary[];
}) {
  const { open, setOpen } = useCommandPalette();
  const setShortcutsHelpOpen = useUiStore((s) => s.setShortcutsHelpOpen);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const activeId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const clearActiveMode = useAppModeStore((s) => s.clearActiveMode);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const debouncedQ = useDebouncedValue(query.trim(), 280);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setIndex(0);
  }, [setOpen]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setIndex(0);
    }
  }, [open]);

  const createPageMutation = useMutation({
    mutationFn: (wsId: string) =>
      createPage(wsId, { title: "Nova página", icon: "file-text" }),
    onSuccess: (res, wsId) => {
      qc.invalidateQueries({ queryKey: ["pages", wsId] });
      qc.invalidateQueries({ queryKey: ["workspace", wsId] });
      navigate(paths.focus.page(wsId, res.page.id));
      toast.success("Página criada");
      close();
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Não foi possível criar.";
      toast.error(msg);
    },
  });

  const createRowMutation = useMutation({
    mutationFn: ({
      wsId,
      dbId,
    }: {
      wsId: string;
      dbId: string;
      label: string;
    }) => createDatabaseRow(wsId, dbId),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["database", vars.wsId, vars.dbId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      navigate(paths.focus.database(vars.wsId, vars.dbId));
      toast.success(`${vars.label} criada`);
      close();
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : "Não foi possível criar.";
      toast.error(msg);
    },
  });

  const creating = createPageMutation.isPending || createRowMutation.isPending;

  const { data: searchData, isFetching: searching } = useQuery({
    queryKey: ["search", debouncedQ],
    queryFn: () => globalSearch(debouncedQ),
    enabled: open && debouncedQ.length >= 2,
  });

  const tasksDb = findDb(databases, "TASKS", "tarefa");
  const habitsDb = findDb(databases, "HABITS", "hábit");
  const goalsDb = findDb(databases, "GOALS", "objetiv");
  const studiesDb = findDb(databases, "STUDIES", "estud");

  const allItems: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [
      {
        id: "dashboard",
        label: UI_DASHBOARD,
        hint: "Início",
        icon: LayoutDashboard,
        kind: "nav",
        section: "go",
        run: () => {
          navigate(paths.focus.dashboard);
          close();
        },
      },
      {
        id: "help",
        label: "Manual de utilizador",
        hint: "Ajuda",
        icon: BookOpen,
        kind: "nav",
        section: "go",
        run: () => {
          navigate(paths.focus.help);
          close();
        },
      },
      {
        id: "switch-mode",
        label: "Trocar modo",
        hint: "Focus · Game · Finanças",
        icon: Repeat2,
        kind: "nav",
        section: "go",
        run: () => {
          clearActiveMode();
          navigate(paths.modeSelect);
          close();
        },
      },
      {
        id: "shortcuts",
        label: "Atalhos de teclado",
        hint: "Pressiona ?",
        icon: Keyboard,
        kind: "nav",
        section: "go",
        run: () => {
          setShortcutsHelpOpen(true);
          close();
        },
      },
    ];

    if (activeId) {
      list.push({
        id: "new-page",
        label: "Nova página",
        hint: "Criar · Página",
        icon: FilePlus,
        kind: "create",
        section: "create",
        boost: true,
        run: () => createPageMutation.mutate(activeId),
        disabled: creating,
      });

      if (tasksDb) {
        list.push({
          id: `new-row-${tasksDb.id}`,
          label: "Nova tarefa",
          hint: `${tasksDb.name} · Criar`,
          icon: ListTodo,
          kind: "create",
          section: "create",
          boost: true,
          run: () =>
            createRowMutation.mutate({
              wsId: activeId,
              dbId: tasksDb.id,
              label: "Tarefa",
            }),
          disabled: creating,
        });
        list.push({
          id: `db-${tasksDb.id}`,
          label: tasksDb.name,
          hint: `${UI_DATABASE} · Tarefas`,
          icon: Database,
          kind: "database",
          section: "go",
          boost: true,
          run: () => {
            navigate(paths.focus.database(activeId, tasksDb.id));
            close();
          },
        });
      }

      if (habitsDb && habitsDb.id !== tasksDb?.id) {
        list.push({
          id: `new-habit-${habitsDb.id}`,
          label: "Novo hábito",
          hint: `${habitsDb.name} · Criar`,
          icon: Flame,
          kind: "create",
          section: "create",
          boost: true,
          run: () =>
            createRowMutation.mutate({
              wsId: activeId,
              dbId: habitsDb.id,
              label: "Hábito",
            }),
          disabled: creating,
        });
        list.push({
          id: `db-${habitsDb.id}`,
          label: habitsDb.name,
          hint: `${UI_DATABASE} · Hábitos`,
          icon: Flame,
          kind: "database",
          section: "go",
          boost: true,
          run: () => {
            navigate(paths.focus.database(activeId, habitsDb.id));
            close();
          },
        });
      }

      if (goalsDb) {
        list.push({
          id: `new-goal-${goalsDb.id}`,
          label: "Novo objetivo",
          hint: `${goalsDb.name} · Criar`,
          icon: Target,
          kind: "create",
          section: "create",
          boost: true,
          run: () =>
            createRowMutation.mutate({
              wsId: activeId,
              dbId: goalsDb.id,
              label: "Objetivo",
            }),
          disabled: creating,
        });
      }

      if (studiesDb) {
        list.push({
          id: `new-study-${studiesDb.id}`,
          label: "Novo tópico de estudo",
          hint: `${studiesDb.name} · Criar`,
          icon: GraduationCap,
          kind: "create",
          section: "create",
          boost: true,
          run: () =>
            createRowMutation.mutate({
              wsId: activeId,
              dbId: studiesDb.id,
              label: "Tópico",
            }),
          disabled: creating,
        });
      }

      if (goalsDb) {
        list.push({
          id: `db-${goalsDb.id}`,
          label: goalsDb.name,
          hint: `${UI_DATABASE} · Objetivos`,
          icon: Target,
          kind: "database",
          section: "go",
          boost: true,
          run: () => {
            navigate(paths.focus.database(activeId, goalsDb.id));
            close();
          },
        });
      }

      if (studiesDb) {
        list.push({
          id: `db-${studiesDb.id}`,
          label: studiesDb.name,
          hint: `${UI_DATABASE} · Estudos`,
          icon: GraduationCap,
          kind: "database",
          section: "go",
          boost: true,
          run: () => {
            navigate(paths.focus.database(activeId, studiesDb.id));
            close();
          },
        });
      }

      const pinnedDbIds = new Set(
        [tasksDb?.id, habitsDb?.id, goalsDb?.id, studiesDb?.id].filter(Boolean)
      );

      for (const db of databases) {
        if (pinnedDbIds.has(db.id)) continue;
        list.push({
          id: `db-${db.id}`,
          label: db.name,
          hint: UI_DATABASE,
          icon: Database,
          kind: "database",
          section: "go",
          boost: true,
          run: () => {
            navigate(paths.focus.database(activeId, db.id));
            close();
          },
        });
      }
    }

    for (const ws of workspaces) {
      if (ws.id === activeId) continue;
      list.push({
        id: `ws-${ws.id}`,
        label: ws.name,
        hint: UI_WORKSPACE,
        icon: FileText,
        kind: "workspace",
        section: "go",
        run: () => {
          navigate(paths.focus.workspace(ws.id));
          close();
        },
      });
    }

    if (searchData && debouncedQ.length >= 2) {
      for (const p of searchData.pages) {
        list.push({
          id: `page-${p.id}`,
          label: p.title,
          hint: `${p.workspaceName} · Página`,
          icon: resolvePageIcon(p.icon),
          kind: "page",
          section: "search",
          run: () => {
            navigate(paths.focus.page(p.workspaceId, p.id));
            close();
          },
        });
      }
      for (const d of searchData.databases) {
        list.push({
          id: `search-db-${d.id}`,
          label: d.name,
          hint: UI_DATABASE,
          icon: Database,
          kind: "database",
          section: "search",
          run: () => {
            navigate(paths.focus.database(d.workspaceId, d.id));
            close();
          },
        });
      }
      for (const r of searchData.rows) {
        list.push({
          id: `row-${r.id}`,
          label: r.title,
          hint: `${r.databaseName} · Tarefa`,
          icon: ListTodo,
          kind: "row",
          section: "search",
          run: () => {
            navigate(paths.focus.database(r.workspaceId, r.databaseId));
            close();
          },
        });
      }
    }

    return list;
  }, [
    activeId,
    workspaces,
    databases,
    tasksDb,
    habitsDb,
    goalsDb,
    studiesDb,
    navigate,
    close,
    createPageMutation,
    createRowMutation,
    searchData,
    debouncedQ,
    setShortcutsHelpOpen,
    clearActiveMode,
  ]);

  const ranked = useMemo(() => rankItems(allItems, query), [allItems, query]);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    ranked.forEach((item, i) => map.set(item.id, i));
    return map;
  }, [ranked]);

  const flatItems = ranked;
  const groups = useMemo(() => groupBySection(ranked), [ranked]);

  useEffect(() => {
    setIndex(0);
  }, [query, debouncedQ]);

  if (!open) return null;

  const safeIndex = Math.min(index, Math.max(0, flatItems.length - 1));

  return (
    <AppModal
      open={open}
      onClose={close}
      align="top"
      zIndex={100}
      ariaLabel="Paleta de comandos"
      panelClassName="max-w-lg lifeos-modal-enter"
    >
      <div
        className={cn(
          techCardClass,
          "relative w-full overflow-hidden shadow-2xl"
        )}
      >
        <div className={techCardAccentClass} aria-hidden />
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="size-4 shrink-0 text-emerald-600/80" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, flatItems.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const action = flatItems[safeIndex];
                if (action && !action.disabled) action.run();
              }
            }}
            placeholder="Pesquisar ou criar… (tarefa, página, espaço)"
            className={cn(fieldClass, "h-10 min-w-0 flex-1 border-0 bg-transparent px-0")}
          />
          {searching ? (
            <span className="shrink-0 font-mono text-sm text-muted-foreground">
              …
            </span>
          ) : null}
          <kbd className={cn(kbdClass, "shrink-0")}>ESC</kbd>
        </div>

        <ul
          className="lifeos-scrollbar-thin max-h-80 overflow-auto p-2"
          role="listbox"
        >
          {flatItems.length === 0 && debouncedQ.length >= 2 && !searching ? (
            <li className="px-3 py-6 text-center text-sm text-muted-foreground">
              Sem resultados para «{debouncedQ}»
            </li>
          ) : null}

          {flatItems.length === 0 && query.trim().length === 0 ? (
            <li className="px-3 py-4 text-center font-mono text-sm text-muted-foreground">
              Criar · Ir para · Pesquisa global com 2+ letras
            </li>
          ) : null}

          {groups.map(({ section, items }) => (
            <li key={section} className="list-none">
              <p className="px-3 pb-1 pt-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                {SECTION_LABELS[section]}
              </p>
              <ul>
                {items.map((action) => {
                  const itemIndex = indexById.get(action.id) ?? 0;
                  const Icon = action.icon;
                  const active = itemIndex === safeIndex && !action.disabled;
                  return (
                    <li key={action.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        disabled={action.disabled}
                        className={cn(
                          navItemClass,
                          "w-full text-left",
                          action.disabled
                            ? "cursor-not-allowed text-zinc-700"
                            : active
                              ? navItemActiveClass
                              : navItemIdleClass
                        )}
                        onMouseEnter={() => setIndex(itemIndex)}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (!action.disabled) action.run();
                        }}
                      >
                        <Icon
                          className={cn(
                            "size-4 shrink-0",
                            action.section === "create"
                              ? "text-emerald-800 dark:text-emerald-500"
                              : action.kind === "row"
                                ? "text-amber-600/80"
                                : "text-emerald-600/70"
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {action.label}
                        </span>
                        {action.hint ? (
                          <span className="shrink-0 font-mono text-sm text-muted-foreground">
                            {action.hint}
                          </span>
                        ) : null}
                        {action.section === "create" ? (
                          <Plus className="size-3 shrink-0 text-muted-foreground" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2 font-mono text-xs uppercase text-muted-foreground">
          <span>
            ↑↓ navegar · Enter abrir
            {creating ? " · A criar…" : ""}
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <kbd className={kbdClass}>?</kbd>
            <kbd className={kbdClass}>⌘K</kbd>
          </span>
        </div>
      </div>
    </AppModal>
  );
}
