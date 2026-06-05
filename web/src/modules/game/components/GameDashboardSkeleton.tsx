import { LifeOSLoading } from "@/components/LifeOSLoading";

export function GameDashboardSkeleton() {
  return (
    <div className="space-y-8">
      <LifeOSLoading
        fullScreen
        variant="game"
        message="A preparar command center"
        submessage="A carregar stats, missões e conquistas…"
        size="lg"
      />
      <div className="animate-pulse space-y-4 opacity-40">
        <div className="h-32 border border-border bg-secondary/30" />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="h-28 border border-border bg-secondary/30 lg:col-span-2" />
          <div className="h-28 border border-border bg-secondary/30" />
        </div>
      </div>
    </div>
  );
}
