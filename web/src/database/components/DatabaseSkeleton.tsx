import { Bone } from "@/components/Bone";
import { ViewAreaSkeleton } from "@/database/components/ViewSkeletons";
import { tabBarClass } from "@/styles/designTokens";
import type { ViewType } from "@/types/database";
import { cn } from "@/lib/utils";

type DatabaseSkeletonProps = {
  view?: ViewType;
};

export function DatabaseSkeleton({ view = "TABLE" }: DatabaseSkeletonProps) {
  return (
    <div className="space-y-8" aria-busy aria-label="A carregar base de dados">
      <div className="space-y-3 border-b border-border pb-6">
        <Bone className="h-3 w-48" />
        <Bone className="h-9 w-64" />
        <Bone className="h-4 w-32" />
        <div className={cn(tabBarClass, "mt-4 inline-flex gap-0")}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-9 w-24" />
          ))}
        </div>
      </div>
      <ViewAreaSkeleton variant={view} />
    </div>
  );
}
