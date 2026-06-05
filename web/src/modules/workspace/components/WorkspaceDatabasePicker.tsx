import {
  WORKSPACE_DATABASE_OPTIONS,
  type WorkspaceDatabaseTemplate,
} from "@/modules/workspace/workspaceDatabaseTemplates";
import { cn } from "@/lib/utils";

type WorkspaceDatabasePickerProps = {
  selected: WorkspaceDatabaseTemplate[];
  onChange: (next: WorkspaceDatabaseTemplate[]) => void;
  disabled?: boolean;
  /** Mínimo de bases seleccionadas (ex.: 1). */
  minSelected?: number;
};

export function WorkspaceDatabasePicker({
  selected,
  onChange,
  disabled,
  minSelected = 1,
}: WorkspaceDatabasePickerProps) {
  const set = new Set(selected);

  const toggle = (id: WorkspaceDatabaseTemplate) => {
    if (disabled) return;
    const next = new Set(set);
    if (next.has(id)) {
      if (next.size <= minSelected) return;
      next.delete(id);
    } else {
      next.add(id);
    }
    onChange([...next]);
  };

  return (
    <div
      role="group"
      aria-label="Bases de dados do espaço"
      className="grid gap-2 sm:grid-cols-2"
    >
      {WORKSPACE_DATABASE_OPTIONS.map(({ id, label, description, Icon }) => {
        const isOn = set.has(id);
        return (
          <button
            key={id}
            type="button"
            disabled={disabled}
            aria-pressed={isOn}
            className={cn(
              "flex items-start gap-3 border p-3 text-left transition-colors",
              "bg-card hover:border-border",
              isOn
                ? "border-emerald-600 ring-1 ring-emerald-600/40"
                : "border-border opacity-70 hover:opacity-100"
            )}
            onClick={() => toggle(id)}
          >
            <Icon
              className={cn(
                "mt-0.5 size-4 shrink-0 stroke-[1.5]",
                isOn ? "text-emerald-800/90 dark:text-emerald-500/90" : "text-muted-foreground"
              )}
              aria-hidden
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">
                {label}
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {description}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
