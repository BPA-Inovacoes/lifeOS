import {
  DEFAULT_PAGE_ICON,
  normalizePageIconKey,
  PAGE_ICON_PRESETS,
} from "@/modules/workspace/pageIcons";
import { cn } from "@/lib/utils";

type PageIconPickerProps = {
  id: string;
  value: string;
  onChange: (icon: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
};

export function PageIconPicker({
  id,
  value,
  onChange,
  disabled,
  ariaLabel = "Ícone da página",
}: PageIconPickerProps) {
  const selected = normalizePageIconKey(value);

  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={ariaLabel}
      className="grid grid-cols-7 gap-2"
    >
      {PAGE_ICON_PRESETS.map(({ id: presetId, Icon, label }) => {
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
              "bg-card hover:border-border hover:bg-muted",
              isSelected
                ? "border-emerald-600 ring-1 ring-emerald-600/50"
                : "border-border"
            )}
            onClick={() => onChange(presetId)}
          >
            <Icon
              className={cn(
                "size-5 stroke-[1.5]",
                isSelected ? "text-emerald-800/90 dark:text-emerald-500/90" : "text-muted-foreground"
              )}
              aria-hidden
            />
          </button>
        );
      })}
    </div>
  );
}

export { DEFAULT_PAGE_ICON };
