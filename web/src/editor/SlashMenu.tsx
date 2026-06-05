import type { SlashCommand } from "@/editor/slashCommands";
import { cn } from "@/lib/utils";
import {
  navItemActiveClass,
  navItemClass,
  navItemIdleClass,
  techCardAccentClass,
  techCardClass,
} from "@/styles/designTokens";

type SlashMenuProps = {
  commands: SlashCommand[];
  activeIndex: number;
  onSelect: (cmd: SlashCommand) => void;
};

export function SlashMenu({ commands, activeIndex, onSelect }: SlashMenuProps) {
  if (commands.length === 0) {
    return (
      <div
        className={cn(
          techCardClass,
          "relative px-3 py-2 text-sm text-muted-foreground shadow-lg"
        )}
      >
        <div className={techCardAccentClass} aria-hidden />
        Sem comandos
      </div>
    );
  }

  return (
    <ul
      className={cn(
        techCardClass,
        "lifeos-scrollbar-thin relative max-h-56 w-64 overflow-auto py-1 shadow-xl"
      )}
      role="listbox"
    >
      <div className={techCardAccentClass} aria-hidden />
      {commands.map((cmd, i) => (
        <li key={cmd.id} role="option" aria-selected={i === activeIndex}>
          <button
            type="button"
            className={cn(
              navItemClass,
              "w-full flex-col items-start border-l-0 px-3 py-2",
              i === activeIndex ? navItemActiveClass : navItemIdleClass
            )}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(cmd);
            }}
          >
            <span className="font-medium text-foreground">{cmd.label}</span>
            <span className="text-sm text-muted-foreground">{cmd.description}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
