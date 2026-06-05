import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Plus, Rows3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { dataPanelFooterClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";

type ViewPanelFooterProps = {
  countLabel: string;
  addLabel?: string;
  onAdd?: () => void;
  addDisabled?: boolean;
  countIcon?: LucideIcon;
  className?: string;
  trailing?: ReactNode;
};

export function ViewPanelFooter({
  countLabel,
  addLabel,
  onAdd,
  addDisabled,
  countIcon: CountIcon = Rows3,
  className,
  trailing,
}: ViewPanelFooterProps) {
  return (
    <div className={cn(dataPanelFooterClass, className)}>
      <span className="flex items-center gap-2 font-mono text-xs uppercase text-muted-foreground">
        <CountIcon className="size-3.5" />
        {countLabel}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {trailing}
        {addLabel && onAdd ? (
          <Button
            type="button"
            size="sm"
            className="gap-2"
            disabled={addDisabled}
            onClick={onAdd}
          >
            <Plus className="size-4" />
            {addLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
