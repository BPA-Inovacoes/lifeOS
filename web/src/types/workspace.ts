export type WorkspaceSummary = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  updatedAt: string;
};

export type PageSummary = {
  id: string;
  parentId: string | null;
  title: string;
  icon: string | null;
  sortOrder: number;
  updatedAt?: string;
};

export type DatabaseSummary = {
  id: string;
  name: string;
  icon: string | null;
  template: string;
};

export type WorkspaceDetail = WorkspaceSummary & {
  pages: PageSummary[];
  databases: DatabaseSummary[];
};

export type PageDetail = {
  id: string;
  workspaceId: string;
  parentId: string | null;
  title: string;
  icon: string | null;
  blocks: import("@/types/block").BlockDto[];
  workspace: { id: string; name: string; slug: string };
};
