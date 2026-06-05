import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { pageShellClass, techCardClass, techCardAccentClass } from "@/styles/designTokens";
import { paths } from "@/routes/paths";
import { cn } from "@/lib/utils";

type RouteErrorFallbackProps = {
  error?: Error | null;
  onRetry?: () => void;
};

export function RouteErrorFallback({ error, onRetry }: RouteErrorFallbackProps) {
  return (
    <div className={pageShellClass}>
      <div className={cn(techCardClass, "relative px-6 py-10 text-center")}>
        <div className={techCardAccentClass} aria-hidden />
        <AlertTriangle className="mx-auto size-8 text-amber-500/80" />
        <h1 className="mt-4 text-lg font-medium text-foreground">
          Ocorreu um erro inesperado
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          A interface encontrou um problema. Podes tentar recarregar esta vista ou voltar ao
          dashboard.
        </p>
        {error?.message ? (
          <p className="mx-auto mt-3 max-w-lg border border-border bg-secondary/80 px-3 py-2 font-mono text-sm text-muted-foreground">
            {error.message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {onRetry ? (
            <Button type="button" size="sm" className="gap-2" onClick={onRetry}>
              <RotateCcw className="size-4" />
              Tentar novamente
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => window.location.assign(paths.focus.dashboard)}
          >
            Ir para o dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
