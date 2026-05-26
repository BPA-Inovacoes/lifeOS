import { cn } from "@/lib/utils";

export function AppTechBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(39 39 42 / 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(39 39 42 / 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(9_9_11)_72%)]" />
    </div>
  );
}
