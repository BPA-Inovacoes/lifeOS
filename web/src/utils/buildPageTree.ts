import type { PageSummary } from "@/types/workspace";

export type PageTreeNode = PageSummary & { children: PageTreeNode[] };

export function buildPageTree(pages: PageSummary[]): PageTreeNode[] {
  const nodes = new Map<string, PageTreeNode>();
  const roots: PageTreeNode[] = [];

  for (const page of pages) {
    nodes.set(page.id, { ...page, children: [] });
  }

  for (const page of pages) {
    const node = nodes.get(page.id)!;
    if (page.parentId && nodes.has(page.parentId)) {
      nodes.get(page.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (list: PageTreeNode[]) => {
    list.sort((a, b) => a.sortOrder - b.sortOrder);
    list.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}
