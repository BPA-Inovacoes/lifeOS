import { Bone } from "@/components/Bone";
import { DataPanel } from "@/components/DataPanel";
import type { ViewType } from "@/types/database";

function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden pb-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex w-72 shrink-0 flex-col border border-border bg-background"
        >
          <Bone className="h-1 w-full" />
          <Bone className="mx-3 mt-3 h-4 w-24" />
          <div className="space-y-2 p-2 pt-4">
            <Bone className="h-14 w-full" />
            <Bone className="h-14 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <DataPanel>
      <div className="grid grid-cols-7 border-b border-border">
        {Array.from({ length: 7 }).map((_, i) => (
          <Bone key={i} className="h-8" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, wi) => (
        <div key={wi} className="grid grid-cols-7 border-b border-border/60">
          {Array.from({ length: 7 }).map((_, di) => (
            <Bone key={di} className="min-h-[88px]" />
          ))}
        </div>
      ))}
    </DataPanel>
  );
}

function ListSkeleton() {
  return (
    <DataPanel>
      <div className="divide-y divide-zinc-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <Bone className="size-10 shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-40" />
              <Bone className="h-3 w-24" />
            </div>
            <Bone className="h-6 w-12" />
          </div>
        ))}
      </div>
    </DataPanel>
  );
}

function TableSkeleton() {
  return (
    <DataPanel>
      <div className="space-y-3 p-4">
        <Bone className="h-10 w-full max-w-md" />
        <Bone className="h-8 w-full" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Bone key={i} className="h-10 w-full" />
        ))}
      </div>
    </DataPanel>
  );
}

export function ViewAreaSkeleton({ variant = "TABLE" }: { variant?: ViewType }) {
  switch (variant) {
    case "BOARD":
      return <BoardSkeleton />;
    case "CALENDAR":
      return <CalendarSkeleton />;
    case "LIST":
      return <ListSkeleton />;
    default:
      return <TableSkeleton />;
  }
}
