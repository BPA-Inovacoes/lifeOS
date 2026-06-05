import { useState, type ReactNode } from "react";
import { BookOpen, LayoutDashboard, LogOut, Pencil, Repeat2 } from "lucide-react";
import { NavLink, useParams } from "react-router-dom";

import { AppBrand } from "@/components/AppBrand";
import { UI_DASHBOARD, UI_DATABASE, UI_WORKSPACES } from "@/constants/uiLabels";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DatabaseNavIcon } from "@/database/components/DatabaseNavIcon";
import {
  NewDatabaseButton,
  NewPageButton,
  PageTree,
  WorkspaceEditDialog,
} from "@/modules/workspace";
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
import { useAppModeStore } from "@/store/appModeStore";
import { paths } from "@/routes/paths";

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
  onLogout: () => void;
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebar({
  workspaces,
  databases,
  pageTree,
  onLogout,
  onNavigate,
  className,
}: AppSidebarProps) {
  const { workspaceId } = useParams();
  const activeId = workspaceId;
  const clearActiveMode = useAppModeStore((s) => s.clearActiveMode);
  const [editingWs, setEditingWs] = useState<WorkspaceSummary | null>(null);

  const activeWorkspace = workspaces.find((w) => w.id === activeId);

  return (
    <>
      <aside
        className={cn(
          "flex h-full w-60 flex-col border-r border-border bg-background/90 backdrop-blur-sm",
          className
        )}
      >
        <div className="shrink-0 border-b border-border px-4 py-4">
          <AppBrand size="sidebar" showTagline />
        </div>

        <nav
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2",
            lifeosScrollbarThinClass
          )}
          aria-label="Navegação principal"
        >
          <ShellNavLink to={paths.focus.dashboard} end onNavigate={onNavigate}>
            <LayoutDashboard className="size-4 shrink-0 text-emerald-600/80" />
            {UI_DASHBOARD}
          </ShellNavLink>
          <ShellNavLink to={paths.focus.help} onNavigate={onNavigate}>
            <BookOpen className="size-4 shrink-0 text-emerald-600/80" />
            Manual
          </ShellNavLink>

          <p className={cn(sectionLabelMutedClass, "mb-1 mt-5 px-3")}>
            {UI_WORKSPACES}
          </p>
          {workspaces.map((ws) => (
            <div key={ws.id} className="group/ws relative">
              <ShellNavLink to={paths.focus.workspace(ws.id)} onNavigate={onNavigate}>
                <WorkspaceIcon icon={ws.icon} active={activeId === ws.id} />
                <span className="truncate pr-6">{ws.name}</span>
              </ShellNavLink>
              {activeId === ws.id ? (
                <button
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground opacity-0 transition-opacity hover:text-emerald-700 dark:hover:text-emerald-400 group-hover/ws:opacity-100"
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

          {activeId ? (
            <>
              <p className={cn(sectionLabelMutedClass, "mb-1 mt-5 px-3")}>
                {UI_DATABASE}
              </p>
              <NewDatabaseButton workspaceId={activeId} />
            </>
          ) : null}

          {databases.length > 0 && activeId ? (
            <div className="mt-1">
              {databases.map((db) => (
                <NavLink
                  key={db.id}
                  to={paths.focus.database(activeId, db.id)}
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
                        icon={db.icon}
                        active={isActive}
                      />
                      <span className="truncate">{db.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ) : null}
        </nav>

        <div className="shrink-0 border-t border-border bg-background p-3">
          {activeWorkspace ? (
            <button
              type="button"
              className="mb-2 flex w-full items-center gap-2 border border-border bg-secondary/80 px-2 py-2 text-left text-sm text-muted-foreground transition-colors hover:border-border hover:text-foreground"
              onClick={() => setEditingWs(activeWorkspace)}
            >
              <Pencil className="size-3.5 shrink-0 text-emerald-600/80" />
              <span className="truncate">Editar {activeWorkspace.name}</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              clearActiveMode();
              window.location.assign(paths.modeSelect);
            }}
            className={cn(navItemClass, navItemIdleClass, "mb-2 w-full")}
          >
            <Repeat2 className="size-4 shrink-0 text-muted-foreground" />
            Trocar modo
          </button>
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
