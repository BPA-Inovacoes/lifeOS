import { Columns3, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  showAllColumns,
  toggleColumnHidden,
  type TableColumnPrefs,
} from "@/database/utils/columnPrefs";
import { sectionLabelMutedClass } from "@/styles/designTokens";
import { cn } from "@/lib/utils";
import type { DatabaseProperty } from "@/types/database";

type TableColumnMenuProps = {
  properties: DatabaseProperty[];
  columns: TableColumnPrefs;
  onChange: (next: TableColumnPrefs) => void;
};

export function TableColumnMenu({
  properties,
  columns,
  onChange,
}: TableColumnMenuProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const hidden = new Set(columns.hiddenIds);
  const hiddenCount = columns.hiddenIds.length;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5 font-mono text-xs uppercase"
        onClick={() => setOpen((v) => !v)}
      >
        <Columns3 className="size-3.5" />
        Colunas
        {hiddenCount > 0 ? (
          <span className="text-emerald-800 dark:text-emerald-500">· {hiddenCount} ocultas</span>
        ) : null}
      </Button>

      {open ? (
        <div
          className={cn(
            "absolute right-0 top-full z-30 mt-2 w-56 border border-border bg-background p-2 shadow-lg",
            "lifeos-scrollbar-thin max-h-72 overflow-y-auto"
          )}
        >
          <p className={cn(sectionLabelMutedClass, "mb-2 px-1")}>
            Visibilidade
          </p>
          <ul className="space-y-0.5">
            {properties.map((prop) => {
              const isHidden = hidden.has(prop.id);
              return (
                <li key={prop.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs transition-colors",
                      "hover:bg-card",
                      isHidden ? "text-muted-foreground" : "text-foreground"
                    )}
                    onClick={() =>
                      onChange(
                        toggleColumnHidden(columns, prop.id, properties)
                      )
                    }
                  >
                    {isHidden ? (
                      <EyeOff className="size-3.5 shrink-0 text-muted-foreground" />
                    ) : (
                      <Eye className="size-3.5 shrink-0 text-emerald-600/80" />
                    )}
                    <span className="truncate">{prop.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          {hiddenCount > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full text-xs"
              onClick={() => onChange(showAllColumns(columns))}
            >
              Mostrar todas
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
