import { cn } from "@/lib/utils";

export function statusBadgeClass(status: string) {
  const s = status.toLowerCase();
  if (s.includes("conclu") || s === "done" || s === "feito") {
    return "border-emerald-900/60 bg-emerald-950/40 text-emerald-400";
  }
  if (s.includes("progress") || s.includes("andamento")) {
    return "border-amber-900/60 bg-amber-950/40 text-amber-400";
  }
  return "border-zinc-700 bg-zinc-900/80 text-zinc-400";
}

export function boardColumnAccent(status: string) {
  const s = status.toLowerCase();
  if (s.includes("conclu")) return "bg-emerald-600";
  if (s.includes("progress") || s.includes("andamento")) return "bg-amber-500";
  return "bg-zinc-600";
}

export function cnStatus(value: string, extra?: string) {
  return cn(
    "inline-flex border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
    statusBadgeClass(value),
    extra
  );
}
