import { useQuery } from "@tanstack/react-query";
import { FileText, LayoutGrid } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { EmptyState } from "@/components/EmptyState";
import { QueryErrorPanel } from "@/components/QueryErrorPanel";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import { DatabaseNavIcon } from "@/database/components/DatabaseNavIcon";
import { NewDatabaseButton, NewPageButton } from "@/modules/workspace";
import { PageIcon } from "@/modules/workspace/components/PageIcon";
import { WorkspaceIcon } from "@/modules/workspace/components/WorkspaceIcon";
import { getWorkspace } from "@/services/workspaceApi";
import { paths } from "@/routes/paths";
import { pageShellClass, sectionLabelClass, listItemClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";
export function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspace(workspaceId!),
    enabled: Boolean(workspaceId),
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !data?.workspace) {
    return (
      <div className={pageShellClass}>
        <QueryErrorPanel
          title="Espaço não encontrado"
          message="Não foi possível carregar este espaço de trabalho."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const { workspace } = data;
  const hasPages = workspace.pages.length > 0;
  const hasDatabases = workspace.databases.length > 0;

  return (
    <div className={pageShellClass}>
      <header className="border-b border-border pb-8">
        <p className={sectionLabelClass}>// espaço</p>
        <h1 className="mt-2 flex items-center gap-3 text-2xl font-semibold text-foreground">
          <span className="flex size-11 items-center justify-center border border-border bg-card">
            <WorkspaceIcon icon={workspace.icon} size="lg" className="size-6 text-foreground" />
          </span>
          {workspace.name}
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          Atalhos rápidos — menos cliques para páginas e bases de dados
        </p>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-mono text-xs uppercase tracking-wider text-emerald-600/90">
              Páginas
            </h2>
            {workspaceId ? <NewPageButton workspaceId={workspaceId} /> : null}
          </div>
          {hasPages ? (
            <ul className="space-y-1">
              {workspace.pages.map((page) => (
                <li key={page.id}>
                  <Link
                    to={paths.focus.page(workspaceId!, page.id)}
                    className={cn(listItemClass, "gap-3")}
                  >
                    <PageIcon icon={page.icon} size="md" />
                    <span className="min-w-0 flex-1 truncate">{page.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              icon={FileText}
              title="Sem páginas"
              description="Cria a primeira página para começar."
              action={
                workspaceId ? <NewPageButton workspaceId={workspaceId} /> : null
              }
            />
          )}
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="font-mono text-xs uppercase tracking-wider text-emerald-600/90">
              Bases de dados
            </h2>
            {workspaceId ? (
              <NewDatabaseButton workspaceId={workspaceId} layout="inline" />
            ) : null}
          </div>
          {hasDatabases ? (
            <ul className="grid gap-2 sm:grid-cols-2">
              {workspace.databases.map((db) => (
                  <li key={db.id}>
                    <Link
                      to={paths.focus.database(workspaceId!, db.id)}
                      className={cn(
                        listItemClass,
                        "h-full flex-col items-start gap-2 py-3"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <DatabaseNavIcon
                          template={db.template}
                          name={db.name}
                          icon={db.icon}
                        />
                        <span className="text-sm font-medium text-foreground">
                          {db.name}
                        </span>
                      </span>
                      <span className="font-mono text-xs uppercase text-muted-foreground">
                        Abrir →
                      </span>
                    </Link>
                  </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              compact
              icon={LayoutGrid}
              title="Sem bases"
              description="As bases default aparecem ao criar o espaço. Adiciona uma base personalizada quando quiseres."
              action={
                workspaceId ? <NewDatabaseButton workspaceId={workspaceId} /> : null
              }
            />
          )}
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to={paths.focus.dashboard}>← Painel</Link>
        </Button>
        {hasPages ? (
          <Button size="sm" className="gap-2" asChild>
            <Link to={paths.focus.page(workspaceId!, workspace.pages[0]!.id)}>
              <LayoutGrid className="size-4" />
              Continuar em {workspace.pages[0]!.title}
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
