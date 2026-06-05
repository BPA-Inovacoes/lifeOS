import { Keyboard } from "lucide-react";

import { AppModal } from "@/components/AppModal";
import { useUiStore } from "@/store/uiStore";
import {
  kbdClass,
  sectionLabelMutedClass,
  techCardAccentClass,
  techCardClass,
  transitionColorsClass,
} from "@/styles/designTokens";
import { cn } from "@/lib/utils";

type ShortcutRow = {
  keys: string[];
  label: string;
  context?: string;
};

const SHORTCUT_GROUPS: { title: string; rows: ShortcutRow[] }[] = [
  {
    title: "Global",
    rows: [
      { keys: ["⌘", "K"], label: "Paleta de comandos", context: "Ctrl+K no Windows" },
      { keys: ["?"], label: "Esta lista de atalhos" },
      { keys: ["Esc"], label: "Fechar modais e menus" },
    ],
  },
  {
    title: "Paleta de comandos",
    rows: [
      { keys: ["↑", "↓"], label: "Navegar resultados" },
      { keys: ["Enter"], label: "Executar acção seleccionada" },
    ],
  },
  {
    title: "Editor de página",
    rows: [{ keys: ["/"], label: "Menu slash (blocos e formatação)" }],
  },
];

function ShortcutKeys({ keys }: { keys: string[] }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {keys.map((k, i) => (
        <kbd key={`${k}-${i}`} className={kbdClass}>
          {k}
        </kbd>
      ))}
    </span>
  );
}

export function KeyboardShortcutsModal() {
  const open = useUiStore((s) => s.shortcutsHelpOpen);
  const setOpen = useUiStore((s) => s.setShortcutsHelpOpen);

  if (!open) return null;

  return (
    <AppModal
      open={open}
      onClose={() => setOpen(false)}
      align="center"
      zIndex={110}
      ariaLabelledBy="shortcuts-title"
      panelClassName="max-w-md lifeos-modal-enter"
    >
      <div className={cn(techCardClass, "relative overflow-hidden shadow-2xl")}>
        <div className={techCardAccentClass} aria-hidden />
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Keyboard className="size-4 text-emerald-600/80" />
            <h2 id="shortcuts-title" className="text-base font-medium text-foreground">
              Atalhos de teclado
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Rapidez sem sair do fluxo. Manual completo em{" "}
            <span className="text-muted-foreground">/ajuda</span>.
          </p>
        </div>

        <div className="max-h-[min(60vh,420px)] overflow-auto p-4 lifeos-scrollbar-thin">
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.title} className="mb-5 last:mb-0">
              <p className={cn(sectionLabelMutedClass, "mb-2 px-1")}>
                // {group.title.toLowerCase()}
              </p>
              <ul className="space-y-1">
                {group.rows.map((row) => (
                  <li
                    key={row.label}
                    className={cn(
                      "flex items-center justify-between gap-3 border border-transparent px-2 py-2",
                      transitionColorsClass,
                      "hover:border-border hover:bg-secondary/50"
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">{row.label}</p>
                      {row.context ? (
                        <p className="font-mono text-xs uppercase text-muted-foreground">
                          {row.context}
                        </p>
                      ) : null}
                    </div>
                    <ShortcutKeys keys={row.keys} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border px-5 py-3 font-mono text-xs uppercase text-muted-foreground">
          <span>Paleta: criar · ir · pesquisar</span>
          <kbd className={kbdClass}>Esc</kbd>
        </div>
      </div>
    </AppModal>
  );
}
