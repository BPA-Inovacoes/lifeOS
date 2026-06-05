import { create } from "zustand";

import type { FinanceIncomeSuggestion } from "@/services/databaseApi";

type State = {
  suggestion: FinanceIncomeSuggestion | null;
  open: (suggestion: FinanceIncomeSuggestion) => void;
  clear: () => void;
};

export const useFinanceSuggestionStore = create<State>((set) => ({
  suggestion: null,
  open: (suggestion) => set({ suggestion }),
  clear: () => set({ suggestion: null }),
}));
