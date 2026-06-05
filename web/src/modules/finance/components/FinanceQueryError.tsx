import { QueryErrorPanel } from "@/components/QueryErrorPanel";
import { FinanceButton } from "@/modules/finance/components/finance-ui";
import { cn } from "@/lib/utils";
import { errorBoxClass } from "@/styles/designTokens";
import type { ComponentProps } from "react";

type FinanceQueryErrorProps = ComponentProps<typeof QueryErrorPanel>;

export function FinanceQueryError({
  onRetry,
  retryLabel = "Tentar novamente",
  className,
  ...props
}: FinanceQueryErrorProps) {
  if (!onRetry) {
    return <QueryErrorPanel {...props} className={className} onRetry={onRetry} />;
  }

  return (
    <QueryErrorPanel
      {...props}
      className={cn(errorBoxClass, "border-amber-950/50 px-4 py-8 text-center", className)}
      onRetry={undefined}
      action={
        <FinanceButton variant="outline" size="sm" className="font-mono text-xs uppercase" onClick={onRetry}>
          {retryLabel} →
        </FinanceButton>
      }
    />
  );
}
