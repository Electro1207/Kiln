import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";

export type TreemapItem = { label: string; value: number };
type Rect = { x: number; y: number; w: number; h: number };

/** Squarified treemap (Bruls et al.): rows of tiles kept as close to square as possible. */
function squarify(items: TreemapItem[], box: Rect): (TreemapItem & Rect)[] {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  const scale = (box.w * box.h) / total;
  const nodes = [...items].sort((a, b) => b.value - a.value).map((i) => ({ ...i, area: i.value * scale }));
  const out: (TreemapItem & Rect)[] = [];
  let rect = { ...box };
  const worst = (row: { area: number }[], side: number) => {
    const s = row.reduce((a, r) => a + r.area, 0);
    const mx = Math.max(...row.map((r) => r.area)), mn = Math.min(...row.map((r) => r.area));
    return Math.max((side * side * mx) / (s * s), (s * s) / (side * side * mn));
  };
  let row: typeof nodes = [];
  const layoutRow = () => {
    const s = row.reduce((a, r) => a + r.area, 0);
    const horizontal = rect.w >= rect.h;
    const side = horizontal ? rect.h : rect.w;
    const thick = s / side;
    let off = 0;
    for (const r of row) {
      const len = r.area / thick;
      out.push(horizontal ? { ...r, x: rect.x, y: rect.y + off, w: thick, h: len } : { ...r, x: rect.x + off, y: rect.y, w: len, h: thick });
      off += len;
    }
    rect = horizontal ? { x: rect.x + thick, y: rect.y, w: rect.w - thick, h: rect.h } : { x: rect.x, y: rect.y + thick, w: rect.w, h: rect.h - thick };
    row = [];
  };
  for (const n of nodes) {
    const side = Math.min(rect.w, rect.h);
    if (row.length === 0 || worst([...row, n], side) <= worst(row, side)) row.push(n);
    else { layoutRow(); row.push(n); }
  }
  if (row.length) layoutRow();
  return out;
}

const STRENGTH = [1, 0.72, 0.5, 0.34, 0.22, 0.14];

/**
 * Parts of a whole as tiles sized by value, biggest in the strongest accent.
 * The hovered tile comes from the pointer over the whole map, so the 2px gaps
 * between tiles never flip it back and forth.
 */
export function TreemapChart({ items, title, height = 320, format = (v) => v.toLocaleString("en-US"), className }: { items: TreemapItem[]; title: string; height?: number; format?: (v: number) => string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const tiles = useMemo(() => (w ? squarify(items, { x: 0, y: 0, w, h: height }) : []), [items, w, height]);
  const total = items.reduce((s, i) => s + i.value, 0);
  const cur = hover != null ? tiles[hover] : null;
  return (
    <figure className={cn("flex w-full flex-col gap-3", className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm" aria-live="polite">
        <span className="truncate text-muted">{cur ? cur.label : title}</span>
        <span className="tabular shrink-0 font-medium text-ink">
          {format(cur ? cur.value : total)}
          {cur && <span className="font-normal text-muted"> · {((cur.value / total) * 100).toFixed(1)}%</span>}
        </span>
      </div>
      <div
        ref={box}
        className="relative w-full overflow-hidden rounded-card"
        style={{ height }}
        role="list"
        aria-label={title}
        onPointerMove={(e) => {
          const r = box.current!.getBoundingClientRect();
          const x = e.clientX - r.left, y = e.clientY - r.top;
          const i = tiles.findIndex((t) => x >= t.x - 1 && x < t.x + t.w + 1 && y >= t.y - 1 && y < t.y + t.h + 1);
          if (i >= 0 && i !== hover) setHover(i);
        }}
        onPointerLeave={() => setHover(null)}
      >
        {tiles.map((t, i) => {
          const big = t.w > 90 && t.h > 44;
          return (
            <motion.div
              key={t.label}
              role="listitem"
              tabIndex={0}
              aria-label={`${t.label}: ${format(t.value)}`}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              className="absolute p-[1px] outline-offset-[-2px]"
              style={{ left: t.x, top: t.y, width: t.w, height: t.h, originX: 0, originY: 0 }}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ ...springSoft, delay: i * 0.03 }}
            >
              <div
                className={cn("relative flex size-full flex-col justify-end overflow-hidden rounded-[6px] p-2 transition-opacity duration-200", hover != null && hover !== i && "opacity-60")}
              >
                <span aria-hidden className="absolute inset-0 bg-btn-primary" style={{ opacity: STRENGTH[Math.min(i, STRENGTH.length - 1)] }} />
                {big && (
                  <span className={cn("relative truncate text-xs font-medium", STRENGTH[Math.min(i, STRENGTH.length - 1)] >= 0.5 ? "text-btn-primary-ink" : "text-ink")}>
                    {t.label}
                    <span className="tabular block font-normal opacity-80">{format(t.value)}</span>
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}
