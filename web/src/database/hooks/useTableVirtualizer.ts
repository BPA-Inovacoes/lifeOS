import { useCallback, useEffect, useState, type RefObject } from "react";

export const TABLE_ROW_HEIGHT = 44;
export const TABLE_VIRTUAL_THRESHOLD = 120;
const OVERSCAN = 8;

type VirtualRange = {
  virtualized: boolean;
  start: number;
  end: number;
  topSpacer: number;
  bottomSpacer: number;
};

export function useTableVirtualizer(
  rowCount: number,
  scrollRef: RefObject<HTMLElement | null>
): VirtualRange {
  const [range, setRange] = useState({ start: 0, end: rowCount });

  const update = useCallback(() => {
    if (rowCount < TABLE_VIRTUAL_THRESHOLD) {
      setRange({ start: 0, end: rowCount });
      return;
    }

    const el = scrollRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const viewHeight = el.clientHeight;
    const start = Math.max(0, Math.floor(scrollTop / TABLE_ROW_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(viewHeight / TABLE_ROW_HEIGHT) + OVERSCAN * 2;
    const end = Math.min(rowCount, start + visibleCount);

    setRange((prev) =>
      prev.start === start && prev.end === end ? prev : { start, end }
    );
  }, [rowCount, scrollRef]);

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update, scrollRef]);

  useEffect(() => {
    update();
  }, [rowCount, update]);

  const virtualized = rowCount >= TABLE_VIRTUAL_THRESHOLD;

  return {
    virtualized,
    start: range.start,
    end: range.end,
    topSpacer: virtualized ? range.start * TABLE_ROW_HEIGHT : 0,
    bottomSpacer: virtualized
      ? Math.max(0, (rowCount - range.end) * TABLE_ROW_HEIGHT)
      : 0,
  };
}
