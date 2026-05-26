import { useCallback, useRef } from "react";

import { cn } from "@/lib/utils";

type ColumnResizeHandleProps = {
  onResizeStart: () => void;
  onResize: (deltaX: number) => void;
  onResizeEnd?: () => void;
};

export function ColumnResizeHandle({
  onResizeStart,
  onResize,
  onResizeEnd,
}: ColumnResizeHandleProps) {
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragging.current = true;
      onResizeStart();
      const startX = e.clientX;

      const onMove = (ev: MouseEvent) => {
        if (!dragging.current) return;
        onResize(ev.clientX - startX);
      };

      const onUp = () => {
        dragging.current = false;
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        onResizeEnd?.();
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [onResizeStart, onResize, onResizeEnd]
  );

  return (
    <button
      type="button"
      aria-label="Redimensionar coluna"
      className={cn(
        "absolute right-0 top-0 z-20 h-full w-3 -translate-x-1/2 cursor-col-resize",
        "border-r border-transparent hover:border-emerald-600/60 hover:bg-emerald-600/10",
        "focus-visible:border-emerald-600 focus-visible:outline-none"
      )}
      onMouseDown={onMouseDown}
    />
  );
}
