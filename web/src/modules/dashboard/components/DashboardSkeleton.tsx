import { techCardClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-muted/80", className)}
      aria-hidden
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-10" aria-busy aria-label="A carregar painel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={cn(techCardClass, "h-44 p-5")}>
            <Bone className="h-9 w-9" />
            <Bone className="mt-6 h-8 w-16" />
            <Bone className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className={cn(techCardClass, "p-5")}>
            <Bone className="h-3 w-28" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((__, j) => (
                <Bone key={j} className="h-10 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
