import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { errorBoxClass, transitionColorsClass } from "@/styles/designTokens";

type QueryErrorPanelProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  action?: ReactNode;
};

export function QueryErrorPanel({
  title = "Algo correu mal",
  message = "Não foi possível carregar os dados.",
  onRetry,
  retryLabel = "Tentar novamente",
  className,
  action,
}: QueryErrorPanelProps) {
  return (
    <div className={cn(errorBoxClass, "px-4 py-8 text-center", className)}>
      <p className="text-sm font-medium text-red-200">{title}</p>
      <p className="mt-1 text-sm text-red-300/90">{message}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn("font-mono text-xs uppercase", transitionColorsClass)}
            onClick={onRetry}
          >
            {retryLabel} →
          </Button>
        ) : null}
        {action}
      </div>
    </div>
  );
}
