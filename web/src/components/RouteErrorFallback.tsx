import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { pageShellClass, techCardClass, techCardAccentClass } from "@/styles/designTokens";
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
        <h1 className="mt-4 text-lg font-medium text-zinc-100">
          Ocorreu um erro inesperado
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
          A interface encontrou um problema. Podes tentar recarregar esta vista ou voltar ao
          dashboard.
        </p>
        {error?.message ? (
          <p className="mx-auto mt-3 max-w-lg border border-zinc-800 bg-zinc-900/80 px-3 py-2 font-mono text-[10px] text-zinc-600">
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
            onClick={() => window.location.assign("/dashboard")}
          >
            Ir para o dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
