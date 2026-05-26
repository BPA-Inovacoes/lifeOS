import { apiJson } from "@/services/http";

export type SearchResults = {
  pages: {
    id: string;
    title: string;
    icon: string | null;
    workspaceId: string;
    workspaceName: string;
  }[];
  databases: {
    id: string;
    name: string;
    icon: string | null;
    template: string;
    workspaceId: string;
  }[];
  rows: {
    id: string;
    title: string;
    databaseId: string;
    databaseName: string;
    workspaceId: string;
  }[];
};

export async function globalSearch(q: string) {
  const params = new URLSearchParams({ q });
  return apiJson<SearchResults>(`/search?${params.toString()}`);
}
