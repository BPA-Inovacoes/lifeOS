import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { BookOpen, Menu, Search, X } from "lucide-react";
import { Link, Outlet, useParams } from "react-router-dom";

import { AppTechBackground } from "@/components/AppTechBackground";
import { CommandPalette } from "@/components/CommandPalette";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { KeyboardShortcutsModal } from "@/components/KeyboardShortcutsModal";
import { Toaster } from "@/components/Toaster";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/layouts/AppSidebar";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { GameHud, GameModeToggle, useGameMode } from "@/modules/game";
import { cn } from "@/lib/utils";
import { getWorkspace, listPages, listWorkspaces } from "@/services/workspaceApi";
import { useAuthStore } from "@/store/authStore";
import { useUiStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { buildPageTree } from "@/utils/buildPageTree";
import { kbdClass } from "@/styles/designTokens";

export function AppShell() {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const setWorkspaces = useWorkspaceStore((s) => s.setWorkspaces);
  const setActiveWorkspace = useWorkspaceStore((s) => s.setActiveWorkspace);
  const setCommandPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const setShortcutsHelpOpen = useUiStore((s) => s.setShortcutsHelpOpen);
  const mobileSidebarOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const { gameModeEnabled, profile: gameProfile, toggleMode, isToggling } =
    useGameMode();
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

  const sidebarProps = {
    workspaces: listData?.workspaces ?? [],
    databases: wsData?.workspace.databases ?? [],
    pageTree,
    userLabel: user?.name ?? user?.email ?? "",
    onLogout: () => clearSession(),
    onNavigate: closeMobile,
  };

  return (
    <div className="min-h-screen bg-zinc-950">
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
              className="absolute right-2 top-3 p-2 text-zinc-500 hover:text-white"
              aria-label="Fechar"
              onClick={closeMobile}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="relative flex min-h-screen min-w-0 flex-col md:pl-60">
        <AppTechBackground />
        <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-zinc-800 bg-zinc-950/95 px-4 backdrop-blur-sm">
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
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-500">
                Atalhos
              </span>
              <kbd className={kbdClass}>?</kbd>
            </Button>
            <GameModeToggle
              compact
              enabled={gameModeEnabled}
              loading={isToggling}
              onChange={toggleMode}
            />
          </div>
          <div className="flex items-center gap-3">
            {gameModeEnabled && gameProfile ? (
              <GameHud profile={gameProfile} />
            ) : null}
            <Link
              to="/ajuda"
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 transition-colors hover:text-emerald-500 md:hidden"
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
      <Toaster />
    </div>
  );
}
