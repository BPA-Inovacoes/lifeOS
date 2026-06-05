import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { listPages } from "@/services/workspaceApi";
import { paths } from "@/routes/paths";
import {
  buildPageBreadcrumbItems,
  type BreadcrumbItem,
} from "@/utils/buildPageBreadcrumbs";

export function usePageBreadcrumbs(
  workspaceId: string | undefined,
  pageId: string | undefined,
  workspaceName: string
): BreadcrumbItem[] {
  const { data } = useQuery({
    queryKey: ["pages", workspaceId],
    queryFn: () => listPages(workspaceId!),
    enabled: Boolean(workspaceId && pageId),
    staleTime: 60_000,
  });

  const pages = data?.pages;

  return useMemo(() => {
    if (!workspaceId || !pageId || !pages?.length) {
      const items: BreadcrumbItem[] = [
        { label: "Painel", to: paths.focus.dashboard },
      ];
      if (workspaceId) {
        items.push({ label: workspaceName, to: paths.focus.workspace(workspaceId) });
      } else {
        items.push({ label: workspaceName });
      }
      return items;
    }
    return buildPageBreadcrumbItems(
      pages,
      pageId,
      workspaceId,
      workspaceName
    );
  }, [pages, pageId, workspaceId, workspaceName]);
}
