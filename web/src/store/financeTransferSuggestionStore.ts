import { create } from "zustand";

import type { FinanceTransferSuggestion } from "@/services/financeApi";

type State = {
  suggestion: FinanceTransferSuggestion | null;
  open: (suggestion: FinanceTransferSuggestion) => void;
  clear: () => void;
};

export const useFinanceTransferSuggestionStore = create<State>((set) => ({
  suggestion: null,
  open: (suggestion) => set({ suggestion }),
  clear: () => set({ suggestion: null }),
}));
