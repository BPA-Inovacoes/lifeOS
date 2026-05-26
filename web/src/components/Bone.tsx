import { cn } from "@/lib/utils";

export function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse bg-zinc-800/80", className)}
      aria-hidden
    />
  );
}
