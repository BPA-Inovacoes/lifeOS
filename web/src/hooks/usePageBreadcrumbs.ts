import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { listPages } from "@/services/workspaceApi";
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
      return [
        { label: "Painel", to: "/dashboard" },
        { label: workspaceName, to: `/w/${workspaceId}` },
      ];
    }
    return buildPageBreadcrumbItems(
      pages,
      pageId,
      workspaceId,
      workspaceName
    );
  }, [pages, pageId, workspaceId, workspaceName]);
}
