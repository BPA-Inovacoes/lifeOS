import { create } from "zustand";

import type { WorkspaceSummary } from "@/types/workspace";

type WorkspaceState = {
  activeWorkspaceId: string | null;
  workspaces: WorkspaceSummary[];
  setWorkspaces: (items: WorkspaceSummary[]) => void;
  setActiveWorkspace: (id: string | null) => void;
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  activeWorkspaceId: null,
  workspaces: [],
  setWorkspaces: (workspaces) => set({ workspaces }),
  setActiveWorkspace: (activeWorkspaceId) => set({ activeWorkspaceId }),
}));
