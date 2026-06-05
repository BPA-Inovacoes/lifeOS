import type { ReactNode } from "react";

import { AppTechBackground } from "@/components/AppTechBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export function AuthTechShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-hidden overflow-y-auto bg-background">
      <AppTechBackground fixed className="z-0" />
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6">
        <ThemeToggle showSystem />
      </div>
      <div
        className="pointer-events-none absolute left-0 top-0 z-[1] h-px w-full bg-gradient-to-r from-transparent via-emerald-600/60 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-[1] h-px w-full bg-gradient-to-r from-transparent via-border to-transparent"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-5 sm:py-8">
        <div
          className={cn(
            "flex w-full max-w-[400px] flex-col gap-5 sm:gap-6",
            "max-h-none py-2 sm:py-4"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
