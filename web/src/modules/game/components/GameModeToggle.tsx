import { Gamepad2, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { gameTabItemActiveClass } from "@/modules/game/styles/gameTokens";
import { tabItemActiveClass, tabItemClass, tabItemIdleClass } from "@/styles/designTokens";

type GameModeToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  loading?: boolean;
  compact?: boolean;
};

export function GameModeToggle({
  enabled,
  onChange,
  loading = false,
  compact = false,
}: GameModeToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex rounded-none border border-border p-0",
        compact && "scale-90"
      )}
      role="group"
      aria-label="Modo de interface"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={loading}
        className={cn(
          tabItemClass,
          !enabled ? tabItemActiveClass : tabItemIdleClass,
          "gap-1.5 rounded-none"
        )}
        onClick={() => onChange(false)}
      >
        <Target className="size-3.5" />
        {!compact ? "Focus" : null}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={loading}
        className={cn(
          tabItemClass,
          enabled ? gameTabItemActiveClass : tabItemIdleClass,
          "gap-1.5 rounded-none"
        )}
        onClick={() => onChange(true)}
      >
        <Gamepad2 className="size-3.5" />
        {!compact ? "Game" : null}
      </Button>
    </div>
  );
}
