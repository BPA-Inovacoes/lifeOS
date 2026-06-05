import { Outlet } from "react-router-dom";

import { AppTechBackground } from "@/components/AppTechBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/Toaster";

/** Shell minimalista para gestão de conta (transversal aos modos). */
export function AccountShell() {
  return (
    <div className="relative min-h-screen bg-background">
      <AppTechBackground fixed className="z-0" />
      <main className="relative z-10">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Toaster mode="focus" />
    </div>
  );
}
