import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function AuthTechShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(39 39 42 / 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(39 39 42 / 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgb(9,9,11)_72%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-emerald-600/60 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent"
        aria-hidden
      />

      <div className={cn("relative z-10 flex w-full max-w-[400px] flex-col gap-8")}>
        {children}
      </div>
    </div>
  );
}
