import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { buildRelationLabelMap } from "@/database/utils/rowLabel";
import { fetchDatabase } from "@/services/databaseApi";
import type { DatabaseProperty } from "@/types/database";

/** Pré-carrega bases relacionadas para sort/filtro por label. */
export function useRelationLabelMap(
  workspaceId: string,
  properties: DatabaseProperty[]
) {
  const relatedDatabaseIds = useMemo(() => {
    const ids = new Set<string>();
    for (const p of properties) {
      if (p.type !== "RELATION") continue;
      const id = p.config.relatedDatabaseId as string | undefined;
      if (id) ids.add(id);
    }
    return [...ids];
  }, [properties]);

  const queries = useQueries({
    queries: relatedDatabaseIds.map((id) => ({
      queryKey: ["database", workspaceId, id, "relation-labels"],
      queryFn: () => fetchDatabase(workspaceId, id),
      staleTime: 60_000,
      enabled: Boolean(workspaceId && id),
    })),
  });

  return useMemo(() => {
    const dbs = queries
      .map((q) => q.data?.database)
      .filter((d): d is NonNullable<typeof d> => Boolean(d));
    return buildRelationLabelMap(dbs);
  }, [queries]);
}
