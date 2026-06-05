import { FileText } from "lucide-react";

import { FinanceButton } from "@/modules/finance/components/finance-ui";
import { useFinanceMutations } from "@/modules/finance/hooks/useFinance";
import { toast } from "@/store/toastStore";

export function FinanceMonthlyReportButton() {
  const { monthlyReport } = useFinanceMutations();
  const month = new Date().toISOString().slice(0, 7);

  return (
    <FinanceButton
      size="sm"
      variant="outline"
      disabled={monthlyReport.isPending}
      onClick={() =>
        monthlyReport.mutate(month, {
          onSuccess: () => toast.success("PDF mensal descarregado"),
          onError: () => toast.error("Erro no relatório PDF."),
        })
      }
    >
      <FileText className="size-4" />
      Relatório PDF
    </FinanceButton>
  );
}
