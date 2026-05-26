import type { PageDetail, PageSummary, WorkspaceDetail, WorkspaceSummary } from "@/types/workspace";
import type { BlockDto, BlockType } from "@/types/block";
import { apiJson } from "@/services/http";

export async function listWorkspaces() {
  return apiJson<{ workspaces: WorkspaceSummary[] }>("/workspaces");
}

export async function getWorkspace(workspaceId: string) {
  return apiJson<{ workspace: WorkspaceDetail }>(`/workspaces/${workspaceId}`);
}

export async function createWorkspace(payload: {
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  databases: string[];
}) {
  return apiJson<{ workspace: WorkspaceSummary }>("/workspaces", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateWorkspace(
  workspaceId: string,
  payload: {
    name?: string;
    icon?: string | null;
    description?: string | null;
    addDatabases?: string[];
    removeDatabases?: string[];
  }
) {
  return apiJson<{ workspace: WorkspaceSummary }>(
    `/workspaces/${workspaceId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteWorkspace(workspaceId: string) {
  return apiJson<void>(`/workspaces/${workspaceId}`, { method: "DELETE" });
}

export async function listPages(workspaceId: string) {
  return apiJson<{ pages: PageSummary[] }>(
    `/workspaces/${workspaceId}/pages`
  );
}

export async function fetchPageById(workspaceId: string, pageId: string) {
  return apiJson<{ page: PageDetail }>(
    `/workspaces/${workspaceId}/pages/${pageId}`
  );
}

export async function createPage(
  workspaceId: string,
  payload: { title?: string; icon?: string; parentId?: string }
) {
  return apiJson<{ page: PageSummary }>(
    `/workspaces/${workspaceId}/pages`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function updatePage(
  workspaceId: string,
  pageId: string,
  payload: { title?: string; icon?: string | null }
) {
  return apiJson<{ page: PageSummary }>(
    `/workspaces/${workspaceId}/pages/${pageId}`,
    { method: "PATCH", body: JSON.stringify(payload) }
  );
}

export async function deletePage(workspaceId: string, pageId: string) {
  return apiJson<{ workspaceId: string }>(
    `/workspaces/${workspaceId}/pages/${pageId}`,
    { method: "DELETE" }
  );
}

export async function updateBlock(
  blockId: string,
  payload: { content?: Record<string, unknown>; type?: BlockType }
) {
  return apiJson<{ block: BlockDto }>(`/blocks/${blockId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function createBlock(
  workspaceId: string,
  pageId: string,
  payload: { type: BlockType; content?: Record<string, unknown> }
) {
  return apiJson<{ block: BlockDto }>(
    `/workspaces/${workspaceId}/pages/${pageId}/blocks`,
    { method: "POST", body: JSON.stringify(payload) }
  );
}

export async function deleteBlock(blockId: string) {
  return apiJson<void>(`/blocks/${blockId}`, { method: "DELETE" });
}

export async function reorderBlocks(
  workspaceId: string,
  pageId: string,
  blockIds: string[]
) {
  return apiJson<{ blocks: BlockDto[] }>(
    `/workspaces/${workspaceId}/pages/${pageId}/blocks/reorder`,
    { method: "POST", body: JSON.stringify({ blockIds }) }
  );
}
