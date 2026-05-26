import { useEffect } from "react";

import { useUiStore } from "@/store/uiStore";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

/** Atalhos globais: ⌘K (paleta), ? (ajuda), Esc (fecha modais). */
export function useGlobalShortcuts() {
  const togglePalette = useUiStore((s) => s.toggleCommandPalette);
  const setPaletteOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const setShortcutsOpen = useUiStore((s) => s.setShortcutsHelpOpen);
  const setMobileSidebarOpen = useUiStore((s) => s.setMobileSidebarOpen);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        togglePalette();
        return;
      }

      if (e.key === "Escape") {
        setPaletteOpen(false);
        setShortcutsOpen(false);
        setMobileSidebarOpen(false);
        return;
      }

      if (isTypingTarget(e.target)) return;

      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    togglePalette,
    setPaletteOpen,
    setShortcutsOpen,
    setMobileSidebarOpen,
  ]);
}

export function useCommandPalette() {
  const open = useUiStore((s) => s.commandPaletteOpen);
  const setOpen = useUiStore((s) => s.setCommandPaletteOpen);
  const toggle = useUiStore((s) => s.toggleCommandPalette);

  return { open, setOpen, toggle };
}
