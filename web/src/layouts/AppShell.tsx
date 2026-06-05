import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { BookOpen, Menu, Repeat2, Search, X } from "lucide-react";
import { Link, Outlet, useParams } from "react-router-dom";

import { AppTechBackground } from "@/components/AppTechBackground";
import { AccountNavButton } from "@/components/AccountNavButton";
import { CommandPalette } from "@/components/CommandPalette";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster } from "@/components/Toaster";
import { LevelUpOverlay } from "@/components/LevelUpOverlay";
import { FinanceIncomeSuggestionDialog } from "@/modules/finance/components/FinanceIncomeSuggestionDialog";
import { CaseAssistant } from "@/modules/case/components/CaseAssistant";
import { FinanceTransferSuggestionDialog } from "@/modules/finance/components/FinanceTransferSuggestionDialog";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/layouts/AppSidebar";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { cn } from "@/lib/utils";
import { paths } from "@/routes/paths";
import { getWorkspace, listPages, listWorkspaces } from "@/services/workspaceApi";
import { useAppModeStore } from "@/store/appModeStore";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { buildPageTree } from "@/utils/buildPageTree";
import { kbdClass } from "@/styles/designTokens";

/** Shell exclusivo do Focus Mode — produtividade, workspaces e databases. */
export function AppShell() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const clearActiveMode = useAppModeStore((s) => s.clearActiveMode);
  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const setShortcutsHelpOpen = useUiStore((s) => s.setShortcutsHelpOpen);
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  useGlobalShortcuts();

  const { workspaceId } = useParams();
  const activeId =
    workspaceId ?? useWorkspaceStore.getState().activeWorkspaceId;

  const { data: listData } = useQuery({
    queryKey: ["workspaces"],
    queryFn: listWorkspaces,
    staleTime: 5 * 60_000,
  });

  const { data: wsData } = useQuery({
    queryKey: ["workspace", activeId],
    queryFn: () => getWorkspace(activeId!),
    enabled: Boolean(activeId),
    staleTime: 5 * 60_000,
  });

  const { data: pagesData } = useQuery({
    queryKey: ["pages", activeId],
    queryFn: () => listPages(activeId!),
    enabled: Boolean(activeId),
    staleTime: 5 * 60_000,
  });

  const pageTree = useMemo(
    () => buildPageTree(pagesData?.pages ?? []),
    [pagesData?.pages]
  );

  useEffect(() => {
    if (listData?.workspaces) setWorkspaces(listData.workspaces);
  }, [listData, setWorkspaces]);

  useEffect(() => {
    if (activeId) setActiveWorkspace(activeId);
  }, [activeId, setActiveWorkspace]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  const closeMobile = () => setMobileSidebarOpen(false);

  const logout = () => {
    clearActiveMode();
    clearSession();
  };

  const sidebarProps = {
    workspaces: listData?.workspaces ?? [],
    databases: wsData?.workspace.databases ?? [],
    pageTree,
    onLogout: logout,
    onNavigate: closeMobile,
  };

  return (
    <div className="relative min-h-screen bg-background">
      <AppTechBackground fixed className="z-0" />
      <aside className="fixed inset-y-0 left-0 z-30 hidden md:block">
        <AppSidebar {...sidebarProps} />
      </aside>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal>
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Fechar menu"
            onClick={closeMobile}
          />
          <div className="absolute inset-y-0 left-0 shadow-2xl">
            <AppSidebar {...sidebarProps} className="h-full" />
            <button
              type="button"
              className="absolute right-2 top-3 p-2 text-muted-foreground hover:text-foreground"
              aria-label="Fechar"
              onClick={closeMobile}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative z-10 flex min-h-screen min-w-0 flex-col md:pl-60">
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/90 px-4 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="md:hidden"
              aria-label="Abrir menu"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="size-5 text-emerald-600/80" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => setCommandPaletteOpen(true)}
            >
              <Search className="size-4 text-emerald-600/80" />
              <span className="hidden font-mono text-xs uppercase tracking-wider sm:inline">
                Comandos
              </span>
              <kbd className={cn(kbdClass, "hidden sm:inline")}>⌘K</kbd>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hidden gap-2 sm:flex"
              onClick={() => setShortcutsHelpOpen(true)}
            >
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Atalhos
              </span>
              <kbd className={kbdClass}>?</kbd>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hidden gap-2 sm:flex"
              onClick={() => {
                clearActiveMode();
                window.location.assign(paths.modeSelect);
              }}
            >
              <Repeat2 className="size-4 text-muted-foreground" />
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Trocar modo
              </span>
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <AccountNavButton />
            <ThemeToggle />
            <Link
              to={paths.focus.help}
              className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:text-emerald-500 md:hidden"
            >
              <BookOpen className="size-4 text-emerald-600/80" />
              Manual
            </Link>
          </div>
        </header>

        <main className="relative z-10 flex-1">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <CommandPalette
        workspaces={listData?.workspaces ?? []}
        databases={wsData?.workspace.databases ?? []}
      />
      <KeyboardShortcutsModal />
      <Toaster mode="focus" />
      <LevelUpOverlay />
      <FinanceIncomeSuggestionDialog />
      <FinanceTransferSuggestionDialog />
      <CaseAssistant mode="focus" />
    </div>
  );
}
