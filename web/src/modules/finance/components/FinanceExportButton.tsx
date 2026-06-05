import { Download } from "lucide-react";

import { FinanceButton } from "@/modules/finance/components/finance-ui";
import { useFinanceMutations } from "@/modules/finance/hooks/useFinance";
import { toast } from "@/store/toastStore";

export function FinanceExportButton() {
  const { exportCsv } = useFinanceMutations();

  return (
    <FinanceButton
      size="sm"
      variant="outline"
      disabled={exportCsv.isPending}
      onClick={() =>
        exportCsv.mutate(undefined, {
          onSuccess: () => toast.success("Excel descarregado"),
          onError: () => toast.error("Erro na exportação."),
        })
      }
    >
      <Download className="size-4" />
      Exportar Excel
    </FinanceButton>
  );
}
