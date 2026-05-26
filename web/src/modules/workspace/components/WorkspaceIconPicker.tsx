import {
  DEFAULT_WORKSPACE_ICON,
  normalizeWorkspaceIconKey,
  WORKSPACE_ICON_PRESETS,
} from "@/modules/workspace/workspaceIcons";
import { cn } from "@/lib/utils";

type WorkspaceIconPickerProps = {
  id: string;
  value: string;
  onChange: (icon: string) => void;
  disabled?: boolean;
};

export function WorkspaceIconPicker({
  id,
  value,
  onChange,
  disabled,
}: WorkspaceIconPickerProps) {
  const selected = normalizeWorkspaceIconKey(value);

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Ícone do espaço"
      className="grid grid-cols-7 gap-2"
    >
      {WORKSPACE_ICON_PRESETS.map(({ id: presetId, Icon, label }) => {
        const isSelected = selected === presetId;
        return (
          <button
            key={presetId}
            type="button"
            disabled={disabled}
            title={label}
            role="radio"
            aria-checked={isSelected}
            aria-label={label}
            className={cn(
              "flex size-11 items-center justify-center border transition-colors",
              "bg-zinc-900 hover:border-zinc-600 hover:bg-zinc-800",
              isSelected
                ? "border-emerald-600 ring-1 ring-emerald-600/50"
                : "border-zinc-800"
            )}
            onClick={() => onChange(presetId)}
          >
            <Icon
              className={cn(
                "size-5 stroke-[1.5]",
                isSelected ? "text-emerald-500/90" : "text-zinc-400"
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

export { DEFAULT_WORKSPACE_ICON };
