import { Menu, X } from "lucide-react";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

import { AppTechBackground } from "@/components/AppTechBackground";
import { AccountNavButton } from "@/components/AccountNavButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/Toaster";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { Button } from "@/components/ui/button";
import { GameSidebar } from "@/layouts/GameSidebar";
import { CaseAssistant } from "@/modules/case/components/CaseAssistant";
import { GameHud } from "@/modules/game";
import { useGameDashboard } from "@/modules/game/hooks/useGameDashboard";
import { useAppModeStore } from "@/store/appModeStore";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";

/** Shell exclusivo do Game Mode — separado do Focus Mode. */
export function GameShell() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const clearActiveMode = useAppModeStore((s) => s.clearActiveMode);
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const { data: dashboard } = useGameDashboard();

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  const logout = () => {
    clearActiveMode();
    clearSession();
  };

  const sidebarProps = {
    onLogout: logout,
  };

  return (
    <div className="relative min-h-screen bg-background">
      <AppTechBackground fixed className="z-0" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden md:block">
        <GameSidebar {...sidebarProps} />
      </aside>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Fechar menu"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl">
            <GameSidebar {...sidebarProps} className="h-full" />
            <button
              type="button"
              className="absolute right-2 top-3 p-2 text-muted-foreground hover:text-foreground"
              aria-label="Fechar"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-screen min-w-0 flex-col md:pl-60">
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-violet-300/40 bg-background/90 px-4 backdrop-blur-sm dark:border-violet-900/30">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="md:hidden hover:text-violet-800 dark:hover:text-violet-300"
            aria-label="Abrir menu"
            onClick={() => setMobileSidebarOpen(true)}
          >
            <Menu className="size-5 text-violet-800 dark:text-violet-400/90" />
          </Button>
          <p className="font-mono text-xs uppercase tracking-wider text-violet-800 dark:text-violet-400/80">
            // game mode
          </p>
          <div className="flex items-center gap-1">
            {dashboard?.profile ? <GameHud profile={dashboard.profile} /> : null}
            <AccountNavButton />
            <ThemeToggle />
          </div>
        </header>

        <main className="relative z-10 flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <Toaster mode="game" />
      <LevelUpOverlay />
      <CaseAssistant mode="game" />
    </div>
  );
}
