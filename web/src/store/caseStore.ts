import { create } from "zustand";

import type { CaseAppMode } from "@/services/caseApi";

type State = {
  open: boolean;
  conversationId: string | null;
  pendingPrompt: string | null;
  pendingMode: CaseAppMode | null;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setConversationId: (id: string | null) => void;
  openWithPrompt: (prompt: string, mode?: CaseAppMode) => void;
  clearPendingPrompt: () => void;
};

export const useCaseStore = create<State>((set) => ({
  open: false,
  conversationId: null,
  pendingPrompt: null,
  pendingMode: null,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
  setConversationId: (conversationId) => set({ conversationId }),
  openWithPrompt: (prompt, mode) =>
    set({ open: true, pendingPrompt: prompt, pendingMode: mode ?? null }),
  clearPendingPrompt: () => set({ pendingPrompt: null, pendingMode: null }),
}));
