import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../cn";

export type VirtualGroup<T> = { id: string; label: string; items: T[] };

export type VirtualListProps<T> = {
  groups: VirtualGroup<T>[];
  /** Height of a row in px. Variable heights are fine; they must be known up front, so nothing jumps. */
  rowHeight: (item: T) => number;
  renderRow: (item: T, state: { active: boolean }) => ReactNode;
  getKey: (item: T) => string;
  getLabel: (item: T) => string;
  onSelect?: (item: T) => void;
  headerHeight?: number;
  /** Visible height of the list in px. */
  height: number;
  label: string;
  className?: string;
};

type Entry<T> = { kind: "header"; group: number; top: number; h: number } | { kind: "row"; group: number; item: T; index: number; top: number; h: number };

const OVERSCAN = 400;

/**
 * Thousands of rows in a fixed-height box. Only what is near the viewport is in
 * the DOM; rows are placed with transforms; the current group's header sticks
 * to the top and is pushed up by the next one. Arrow keys, Page Up/Down, Home
 * and End move the active row and keep it in view.
 */
export function VirtualList<T>({
  groups, rowHeight, renderRow, getKey, getLabel, onSelect, headerHeight = 32, height, label, className,
}: VirtualListProps<T>) {
  const id = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [active, setActive] = useState(0);

  const { entries, rows, total, headerTops } = useMemo(() => {
    const entries: Entry<T>[] = [];
    const rows: Extract<Entry<T>, { kind: "row" }>[] = [];
    const headerTops: number[] = [];
    let top = 0;
    let index = 0;
    groups.forEach((g, gi) => {
      headerTops.push(top);
      entries.push({ kind: "header", group: gi, top, h: headerHeight });
      top += headerHeight;
      for (const item of g.items) {
        const h = rowHeight(item);
        const e = { kind: "row" as const, group: gi, item, index: index++, top, h };
        entries.push(e);
        rows.push(e);
        top += h;
      }
    });
    return { entries, rows, total: top, headerTops };
  }, [groups, rowHeight, headerHeight]);

  const firstAt = useCallback(
    (y: number) => {
      let lo = 0;
      let hi = entries.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (entries[mid].top + entries[mid].h <= y) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    [entries],
  );

  const start = firstAt(Math.max(0, scrollTop - OVERSCAN));
  const end = Math.min(entries.length - 1, firstAt(scrollTop + height + OVERSCAN));
  const visible = entries.slice(start, end + 1);

  let g = 0;
  while (g + 1 < headerTops.length && headerTops[g + 1] <= scrollTop) g++;
  const nextTop = headerTops[g + 1];
  const push = nextTop != null ? Math.min(0, nextTop - scrollTop - headerHeight) : 0;

  // Scroll events already arrive once per frame, before it is drawn; updating here
  // (not in a later rAF) keeps the rows in step with the scroll, with no frame of lag.
  const onScroll = () => setScrollTop(boxRef.current?.scrollTop ?? 0);
  const [gutter, setGutter] = useState(0);
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (box) setGutter(box.offsetWidth - box.clientWidth);
  }, [height]);

  const reveal = (i: number) => {
    const box = boxRef.current;
    const r = rows[i];
    if (!box || !r) return;
    const topLimit = box.scrollTop + headerHeight;
    if (r.top < topLimit) box.scrollTop = r.top - headerHeight;
    else if (r.top + r.h > box.scrollTop + height) box.scrollTop = r.top + r.h - height;
  };

  const move = (i: number) => {
    const n = Math.max(0, Math.min(rows.length - 1, i));
    setActive(n);
    reveal(n);
  };

  const onKey = (e: KeyboardEvent) => {
    const page = Math.max(1, Math.floor(height / 48));
    const map: Record<string, number> = { ArrowDown: active + 1, ArrowUp: active - 1, PageDown: active + page, PageUp: active - page, Home: 0, End: rows.length - 1 };
    if (e.key in map) {
      e.preventDefault();
      move(map[e.key]);
    } else if (e.key === "Enter" && rows[active]) {
      e.preventDefault();
      onSelect?.(rows[active].item);
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-card bg-surface", className)} style={{ height }}>
      <div
        ref={boxRef}
        role="listbox"
        tabIndex={0}
        aria-label={label}
        aria-activedescendant={rows[active] ? `${id}-${active}` : undefined}
        onScroll={onScroll}
        onKeyDown={onKey}
        className="h-full overflow-y-auto overscroll-contain outline-offset-[-2px] [contain:strict]"
      >
        <div className="relative [contain:layout_paint]" style={{ height: total }}>
          {visible.map((e) =>
            e.kind === "header" ? (
              <div
                key={`h-${e.group}`}
                aria-hidden
                className="absolute inset-x-0 top-0 flex items-end bg-raised px-4 pb-1.5 text-xs font-medium text-muted"
                style={{ height: e.h, transform: `translateY(${e.top}px)` }}
              >
                {groups[e.group].label}
              </div>
            ) : (
              <div
                key={getKey(e.item)}
                id={`${id}-${e.index}`}
                role="option"
                aria-selected={e.index === active}
                aria-setsize={rows.length}
                aria-posinset={e.index + 1}
                aria-label={getLabel(e.item)}
                onPointerDown={() => setActive(e.index)}
                onDoubleClick={() => onSelect?.(e.item)}
                className={cn("absolute inset-x-0 top-0 px-2 transition-colors duration-150", e.index === active ? "bg-accent-soft" : "hover:bg-raised/70")}
                style={{ height: e.h, transform: `translateY(${e.top}px)` }}
              >
                {renderRow(e.item, { active: e.index === active })}
              </div>
            ),
          )}
        </div>
      </div>
      {/* The sticky header sits over the list, outside the scroller, so it never repaints the rows. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 flex items-end bg-raised px-4 pb-1.5 text-xs font-medium text-muted"
        style={{ height: headerHeight, right: gutter, transform: `translateY(${push}px)` }}
      >
        {groups[g]?.label}
      </div>
    </div>
  );
}
