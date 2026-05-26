import { useState, type ReactNode } from "react";
import { BookOpen, Gamepad2, LayoutDashboard, LogOut, Pencil } from "lucide-react";
import { NavLink, useParams } from "react-router-dom";

import { AppBrand } from "@/components/AppBrand";
import { UI_DASHBOARD, UI_DATABASE, UI_WORKSPACES } from "@/constants/uiLabels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DatabaseNavIcon } from "@/database/components/DatabaseNavIcon";
import { NewPageButton, PageTree, WorkspaceEditDialog } from "@/modules/workspace";
import { WorkspaceIcon } from "@/modules/workspace/components/WorkspaceIcon";
import type { PageTreeNode } from "@/utils/buildPageTree";
import type { WorkspaceSummary } from "@/types/workspace";
import type { DatabaseSummary } from "@/types/workspace";
import {
  navItemActiveClass,
  navItemClass,
  navItemIdleClass,
  lifeosScrollbarThinClass,
  sectionLabelMutedClass,
} from "@/styles/designTokens";
import { useUiStore } from "@/store/uiStore";

function ShellNavLink({
  to,
  children,
  end,
  onNavigate,
}: {
  to: string;
  children: ReactNode;
  end?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(navItemClass, isActive ? navItemActiveClass : navItemIdleClass)
      }
    >
      {children}
    </NavLink>
  );
}

type AppSidebarProps = {
  workspaces: WorkspaceSummary[];
  databases: DatabaseSummary[];
  pageTree: PageTreeNode[];
  userLabel: string;
  onLogout: () => void;
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebar({
  workspaces,
  databases,
  pageTree,
  userLabel,
  onLogout,
  onNavigate,
  className,
}: AppSidebarProps) {
  const { workspaceId } = useParams();
  const activeId = workspaceId;
  const gameModeEnabled = useUiStore((s) => s.gameModeEnabled);
  const [editingWs, setEditingWs] = useState<WorkspaceSummary | null>(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeId);

  return (
    <>
      <aside
        className={cn(
          "flex h-full w-60 flex-col border-r border-zinc-800 bg-zinc-950",
          className
        )}
      >
        <div className="shrink-0 border-b border-zinc-800 px-4 py-4">
          <AppBrand size="sidebar" showTagline />
        </div>

        <nav
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2",
            lifeosScrollbarThinClass
          )}
          aria-label="Navegação principal"
        >
          <ShellNavLink to="/dashboard" end onNavigate={onNavigate}>
            <LayoutDashboard className="size-4 shrink-0 text-emerald-600/80" />
            {UI_DASHBOARD}
          </ShellNavLink>
          <ShellNavLink to="/game" onNavigate={onNavigate}>
            <Gamepad2 className="size-4 shrink-0 text-emerald-600/80" />
            <span className="flex min-w-0 items-center justify-between gap-2">
              <span>Game Mode</span>
              {!gameModeEnabled ? (
                <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">
                  off
                </span>
              ) : null}
            </span>
          </ShellNavLink>
          <ShellNavLink to="/ajuda" onNavigate={onNavigate}>
            <BookOpen className="size-4 shrink-0 text-emerald-600/80" />
            Manual
          </ShellNavLink>

          <p className={cn(sectionLabelMutedClass, "mb-1 mt-5 px-3")}>
            {UI_WORKSPACES}
          </p>
          {workspaces.map((ws) => (
            <div key={ws.id} className="group/ws relative">
              <ShellNavLink to={`/w/${ws.id}`} onNavigate={onNavigate}>
                <WorkspaceIcon icon={ws.icon} active={activeId === ws.id} />
                <span className="truncate pr-6">{ws.name}</span>
              </ShellNavLink>
              {activeId === ws.id ? (
                <button
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-zinc-600 opacity-0 transition-opacity hover:text-emerald-400 group-hover/ws:opacity-100"
                  aria-label={`Editar ${ws.name}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingWs(ws);
                  }}
                >
                  <Pencil className="size-3.5" />
                </button>
              ) : null}
            </div>
          ))}

          {activeId ? (
            <>
              <div className="mb-1 mt-5 px-3">
                <p className={sectionLabelMutedClass}>Páginas</p>
              </div>
              <NewPageButton workspaceId={activeId} />
              <div className="mt-1">
                <PageTree nodes={pageTree} workspaceId={activeId} />
              </div>
            </>
          ) : null}

          {databases.length > 0 && activeId ? (
            <>
              <p className={cn(sectionLabelMutedClass, "mb-1 mt-5 px-3")}>
                {UI_DATABASE}
              </p>
              {databases.map((db) => (
                <NavLink
                  key={db.id}
                  to={`/w/${activeId}/db/${db.id}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(navItemClass, isActive ? navItemActiveClass : navItemIdleClass)
                  }
                >
                  {({ isActive }) => (
                    <>
                      <DatabaseNavIcon
                        template={db.template}
                        name={db.name}
                        active={isActive}
                      />
                      <span className="truncate">{db.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </>
          ) : null}
        </nav>

        <div className="shrink-0 border-t border-zinc-800 bg-zinc-950 p-3">
          {activeWorkspace ? (
            <button
              type="button"
              className="mb-2 flex w-full items-center gap-2 border border-zinc-800 bg-zinc-900/80 px-2 py-2 text-left text-xs text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              onClick={() => setEditingWs(activeWorkspace)}
            >
              <Pencil className="size-3.5 shrink-0 text-emerald-600/80" />
              <span className="truncate">Editar {activeWorkspace.name}</span>
            </button>
          ) : null}
          <p className="mb-2 truncate px-1 font-mono text-[10px] text-zinc-500">
            {userLabel}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={onLogout}
          >
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </aside>

      <WorkspaceEditDialog
        workspace={editingWs}
        open={editingWs !== null}
        onClose={() => setEditingWs(null)}
      />
    </>
  );
}
