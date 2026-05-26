import { Bone } from "@/components/Bone";
import { pageShellClass } from "@/styles/designTokens";

export function PageSkeleton() {
  return (
    <div className={pageShellClass} aria-busy aria-label="A carregar">
      <Bone className="mb-4 h-3 w-24" />
      <Bone className="mb-6 h-8 w-64" />
      <Bone className="h-4 w-full max-w-xl" />
      <div className="mt-10 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
