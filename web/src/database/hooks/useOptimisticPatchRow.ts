import { useMutation, useQueryClient } from "@tanstack/react-query";

import { patchHabitActivityOptimistic } from "@/database/utils/habitActivityOptimistic";
import { applyRowGamificationFeedback } from "@/modules/game/utils/gamificationFeedback";
import { updateDatabaseRow } from "@/services/databaseApi";
import type { DatabaseDetail } from "@/services/databaseApi";
import { useFinanceSuggestionStore } from "@/store/financeSuggestionStore";
import type { DatabaseProperty } from "@/types/database";

type PatchVars = {
  rowId: string;
  propId: string;
  value: unknown;
};

type Options = {
  queryKey: readonly unknown[];
  doneProp?: DatabaseProperty;
  /** Marca dashboard como stale sem refetch imediato */
  touchDashboard?: boolean;
};

export function useOptimisticPatchRow({
  queryKey,
  doneProp,
  touchDashboard = true,
}: Options) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ rowId, propId, value }: PatchVars) =>
      updateDatabaseRow(rowId, { [propId]: value }),

    onMutate: async ({ rowId, propId, value }) => {
      await qc.cancelQueries({ queryKey });

      const previous = qc.getQueryData<{ database: DatabaseDetail }>(queryKey);

      qc.setQueryData<{ database: DatabaseDetail }>(queryKey, (old) => {
        if (!old) return old;

        const rows = old.database.rows.map((r) => {
          if (r.id !== rowId) return r;
          return {
            ...r,
            properties: { ...r.properties, [propId]: value },
          };
        });

        let rowActivity = old.database.rowActivity;
        if (rowActivity && doneProp && propId === doneProp.id) {
          const isDone = Boolean(value);
          const prev = rowActivity[rowId];
          const wasDone =
            prev?.doneToday ??
            Boolean(
              old.database.rows.find((r) => r.id === rowId)?.properties[
                doneProp.id
              ]
            );
          rowActivity = {
            ...rowActivity,
            [rowId]: patchHabitActivityOptimistic(prev, isDone, wasDone),
          };
        }

        return { database: { ...old.database, rows, rowActivity } };
      });

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKey, context.previous);
      }
    },

    onSuccess: (data) => {
      qc.setQueryData<{ database: DatabaseDetail }>(queryKey, (old) => {
        if (!old) return old;
        const rows = old.database.rows.map((r) =>
          r.id === data.row.id ? data.row : r
        );
        return { database: { ...old.database, rows } };
      });
      applyRowGamificationFeedback(qc, data.gamification);
      if (data.financeSuggestion) {
        useFinanceSuggestionStore.getState().open(data.financeSuggestion);
      }
      void qc.invalidateQueries({ queryKey, refetchType: "active" });
    },

    onSettled: () => {
      if (touchDashboard) {
        void qc.invalidateQueries({
          queryKey: ["dashboard"],
          refetchType: "active",
        });
      }
    },
  });
}
