import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { QueryErrorPanel } from "@/components/QueryErrorPanel";
import { DatabaseHeader } from "@/database/components/DatabaseHeader";
import { DatabaseSkeleton } from "@/database/components/DatabaseSkeleton";
import { getDefaultView } from "@/database/engine";
import { BoardView } from "@/database/views/BoardView";
import { CalendarView } from "@/database/views/CalendarView";
import { ListView } from "@/database/views/ListView";
import { TableView } from "@/database/views/TableView";
import { getWorkspace } from "@/services/workspaceApi";
import { fetchDatabase } from "@/services/databaseApi";
import { pageShellClass } from "@/styles/designTokens";
import type { ViewType } from "@/types/database";

export function DatabasePage() {
  const { workspaceId, databaseId } = useParams<{
    workspaceId: string;
    databaseId: string;
  }>();

  const queryKey = ["database", workspaceId, databaseId] as const;
  const [view, setView] = useState<ViewType>("TABLE");
  const [viewInitialized, setViewInitialized] = useState(false);

  const { data: wsData } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspace(workspaceId!),
    enabled: Boolean(workspaceId),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () => fetchDatabase(workspaceId!, databaseId!),
    enabled: Boolean(workspaceId && databaseId),
    staleTime: 60_000,
  });

  const views = useMemo(
    () => data?.database.views ?? [],
    [data?.database.views]
  );

  const database = data?.database;

  useEffect(() => {
    setViewInitialized(false);
  }, [databaseId]);

  useEffect(() => {
    if (!database || viewInitialized) return;
    const def = getDefaultView(database);
    setView(def?.type ?? "TABLE");
    setViewInitialized(true);
  }, [database, viewInitialized]);

  if (isLoading) {
    return (
      <div className={pageShellClass}>
        <DatabaseSkeleton view={view} />
      </div>
    );
  }

  if (isError || !database) {
    return (
      <div className={pageShellClass}>
        <QueryErrorPanel
          title="Base indisponível"
          message="Não foi possível carregar a base de dados."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className={pageShellClass}>
      <DatabaseHeader
        workspaceName={wsData?.workspace.name ?? "Espaço"}
        workspaceId={workspaceId!}
        databaseName={database.name}
        databaseIcon={database.icon}
        template={database.template}
        rowCount={database.rows.length}
        views={views}
        activeView={view}
        onViewChange={setView}
      />

      <div className="mt-8">
        {view === "BOARD" ? (
          <BoardView
            workspaceId={workspaceId!}
            database={database}
            queryKey={queryKey}
          />
        ) : view === "CALENDAR" ? (
          <CalendarView
            workspaceId={workspaceId!}
            database={database}
            queryKey={queryKey}
          />
        ) : view === "LIST" ? (
          <ListView
            workspaceId={workspaceId!}
            database={database}
            queryKey={queryKey}
          />
        ) : (
          <TableView
            workspaceId={workspaceId!}
            database={database}
            queryKey={queryKey}
          />
        )}
      </div>
    </div>
  );
}
