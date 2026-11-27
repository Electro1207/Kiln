import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";
import { ChartShell, chartA11yLabels, patternStyle, rovingNext, summariseParts, useChartA11y, type ChartA11yLabels, type ChartA11yProps } from "./ChartA11y";

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

const STRENGTH_BASE = [1, 0.72, 0.5, 0.34, 0.22, 0.14];
const STRENGTH_HC = [1, 0.85, 0.7, 0.55, 0.45, 0.35];

/**
 * Parts of a whole as tiles sized by value, biggest in the strongest accent.
 * The hovered tile comes from the pointer over the whole map, so the 2px gaps
 * between tiles never flip it back and forth.
 */
export function TreemapChart({
  items, title, height = 320, format = (v) => v.toLocaleString("en-US"), className, labels, accessibilityFeatures, tableToggle,
}: {
  items: TreemapItem[];
  title: string;
  height?: number;
  format?: (v: number) => string;
  className?: string;
  /** Override the accessibility text (table button, summary). Merged over `chartA11yLabels`. */
  labels?: Partial<ChartA11yLabels>;
} & ChartA11yProps) {
  const l = { ...chartA11yLabels, ...labels };
  const ca = useChartA11y({ accessibilityFeatures, tableToggle });
  const STRENGTH = ca.a11y.highContrast ? STRENGTH_HC : STRENGTH_BASE;
  const still = ca.a11y.calm || ca.a11y.reduceMotion || ca.a11y.noFlashing;
  const [rove, setRove] = useState(0);
  const tileEls = useRef<(HTMLDivElement | null)[]>([]);
  const box = useRef<HTMLDivElement>(null);
  // `w` is measured from the box and only feeds the absolutely positioned tiles. They add nothing to the
  // box's own width, so this can't grow without end inside a content-sized parent (the Carousel runaway).
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
    <ChartShell
      ca={ca}
      title={title}
      summary={summariseParts(l, items, format)}
      table={{ caption: title, columns: [l.label, l.value, l.share], rows: [...items].sort((a, b) => b.value - a.value).map((t) => [t.label, format(t.value), `${((t.value / total) * 100).toFixed(1)}%`]) }}
      labels={labels}
      className={className}
      figureClassName="w-full"
      bodyClassName="flex w-full flex-col gap-3"
    >
      <div className="flex items-baseline justify-between gap-3 text-sm" aria-live="polite">
        <span className="truncate text-muted">{cur ? cur.label : title}</span>
        <span className="tabular shrink-0 font-medium text-ink">
          {format(cur ? cur.value : total)}
          {cur && <span className="font-normal text-muted"> · {((cur.value / total) * 100).toFixed(1)}%</span>}
        </span>
      </div>
      <div
        ref={box}
        className="relative w-full min-w-0 max-w-full overflow-hidden rounded-card [contain:layout_paint]"
        style={{ height }}
        role="list"
        aria-label={`${title}. ${l.keysHint}`}
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
              ref={(el) => { tileEls.current[i] = el; }}
              tabIndex={rove === i ? 0 : -1}
              aria-label={`${t.label}: ${format(t.value)}`}
              onFocus={() => { setRove(i); setHover(i); }}
              onBlur={() => setHover(null)}
              onKeyDown={(e) => {
                const n = rovingNext(e.key, i, tiles.length);
                if (n == null) return;
                e.preventDefault();
                tileEls.current[n]?.focus();
              }}
              className="absolute p-[1px] outline-offset-[-2px]"
              style={{ left: t.x, top: t.y, width: t.w, height: t.h, originX: 0, originY: 0 }}
              initial={still ? false : { opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ ...springSoft, delay: i * 0.03 }}
            >
              <div
                className={cn("relative flex size-full flex-col justify-end overflow-hidden rounded-[6px] p-2 transition-opacity duration-200", hover != null && hover !== i && "opacity-60")}
              >
                <span aria-hidden className={cn("absolute inset-0", !ca.colourSafe && "bg-btn-primary")} style={ca.colourSafe ? patternStyle(i) : { opacity: STRENGTH[Math.min(i, STRENGTH.length - 1)] }} />
                {big && (
                  <span className={cn("relative truncate text-xs font-medium", ca.colourSafe ? "self-start rounded-[4px] bg-surface px-1.5 py-0.5 text-ink" : STRENGTH[Math.min(i, STRENGTH.length - 1)] >= 0.5 ? "text-btn-primary-ink" : "text-ink")}>
                    {t.label}
                    <span className="tabular block font-normal opacity-80">{format(t.value)}</span>
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </ChartShell>
  );
}
