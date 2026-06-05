import { UI_DASHBOARD } from "@/constants/uiLabels";
import { paths } from "@/routes/paths";
import type { PageSummary } from "@/types/workspace";

export type BreadcrumbItem = { label: string; to?: string };

const MAX_VISIBLE = 6;

/** Cadeia Dashboard → workspace → páginas ancestrais → página actual. */
export function buildPageBreadcrumbItems(
  pages: PageSummary[],
  currentPageId: string,
  workspaceId: string,
  workspaceName: string
): BreadcrumbItem[] {
  const byId = new Map(pages.map((p) => [p.id, p]));
  const chain: PageSummary[] = [];
  let id: string | null = currentPageId;
  const visited = new Set<string>();

  while (id && byId.has(id) && !visited.has(id)) {
    visited.add(id);
    const current: PageSummary = byId.get(id)!;
    chain.unshift(current);
    id = current.parentId;
  }

  const items: BreadcrumbItem[] = [
    { label: UI_DASHBOARD, to: paths.focus.dashboard },
    { label: workspaceName, to: paths.focus.workspace(workspaceId) },
  ];

  chain.forEach((page, index) => {
    const isLast = index === chain.length - 1;
    items.push({
      label: page.title,
      to: isLast ? undefined : paths.focus.page(workspaceId, page.id),
    });
  });

  return collapseBreadcrumbs(items, MAX_VISIBLE);
}

function collapseBreadcrumbs(
  items: BreadcrumbItem[],
  max: number
): BreadcrumbItem[] {
  if (items.length <= max) return items;

  const head = items.slice(0, 2);
  const tail = items.slice(-2);
  return [...head, { label: "…" }, ...tail];
}
