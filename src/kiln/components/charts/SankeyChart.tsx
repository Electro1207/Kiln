import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { easeInOut } from "../../motion";

export type SankeyNode = { id: string; label: string; column: number };
export type SankeyLink = { from: string; to: string; value: number };

/**
 * A light Sankey: nodes in columns, bands between them as wide as the amount
 * that flows. Hover a node or a band and everything not connected to it steps
 * back; the last thing hovered stays lit until the pointer leaves the chart.
 */
export function SankeyChart({
  nodes, links, title, height = 320, format = (v) => v.toLocaleString("en-US"), className,
}: { nodes: SankeyNode[]; links: SankeyLink[]; title: string; height?: number; format?: (v: number) => string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);
  const [focus, setFocus] = useState<{ kind: "node" | "link"; key: string } | null>(null);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const NODE_W = 12, PAD = 14, LABEL = 120, TOP = 22;
  const layout = useMemo(() => {
    if (!w) return null;
    const cols = Math.max(...nodes.map((n) => n.column)) + 1;
    const inner = Math.max(0, w - LABEL * 2);
    const xOf = (c: number) => LABEL + (cols === 1 ? 0 : (c / (cols - 1)) * (inner - NODE_W));
    const value = (id: string) => Math.max(links.filter((l) => l.from === id).reduce((s, l) => s + l.value, 0), links.filter((l) => l.to === id).reduce((s, l) => s + l.value, 0));
    const byCol = Array.from({ length: cols }, (_, c) => nodes.filter((n) => n.column === c));
    const colTotals = byCol.map((ns) => ns.reduce((s, n) => s + value(n.id), 0));
    const scale = Math.min(...byCol.map((ns, c) => (height - TOP - PAD * (ns.length - 1)) / (colTotals[c] || 1)));
    const pos = new Map<string, { x: number; y: number; h: number; v: number }>();
    byCol.forEach((ns, c) => {
      const used = colTotals[c] * scale + PAD * (ns.length - 1);
      let y = TOP + (height - TOP - used) / 2;
      ns.forEach((n) => {
        const h = value(n.id) * scale;
        pos.set(n.id, { x: xOf(c), y, h, v: value(n.id) });
        y += h + PAD;
      });
    });
    const outOff = new Map<string, number>(), inOff = new Map<string, number>();
    const bands = links.map((l) => {
      const a = pos.get(l.from)!, b = pos.get(l.to)!;
      const t = l.value * scale;
      const y0 = a.y + (outOff.get(l.from) ?? 0) + t / 2;
      const y1 = b.y + (inOff.get(l.to) ?? 0) + t / 2;
      outOff.set(l.from, (outOff.get(l.from) ?? 0) + t);
      inOff.set(l.to, (inOff.get(l.to) ?? 0) + t);
      const x0 = a.x + NODE_W, x1 = b.x, mx = (x0 + x1) / 2;
      return { ...l, key: `${l.from}>${l.to}`, t, d: `M${x0} ${y0} C${mx} ${y0} ${mx} ${y1} ${x1} ${y1}` };
    });
    return { pos, bands };
  }, [w, nodes, links, height]);

  const lit = (b: { from: string; to: string; key: string }) =>
    !focus || (focus.kind === "link" ? focus.key === b.key : b.from === focus.key || b.to === focus.key);
  const nodeLit = (id: string) =>
    !focus || (focus.kind === "node" ? focus.key === id || links.some((l) => (l.from === focus.key && l.to === id) || (l.to === focus.key && l.from === id)) : focus.key.split(">").includes(id));

  const readout = focus
    ? focus.kind === "node"
      ? `${nodes.find((n) => n.id === focus.key)?.label}: ${format(layout?.pos.get(focus.key)?.v ?? 0)}`
      : (() => {
          const l = links.find((x) => `${x.from}>${x.to}` === focus.key)!;
          return `${nodes.find((n) => n.id === l.from)?.label} → ${nodes.find((n) => n.id === l.to)?.label}: ${format(l.value)}`;
        })()
    : title;

  return (
    <figure className={cn("flex w-full flex-col gap-3", className)}>
      <p className="truncate text-sm text-muted" aria-live="polite">{readout}</p>
      <div ref={box} className="relative w-full" style={{ height }} onPointerLeave={() => setFocus(null)}>
        {layout && (
          <svg width={w} height={height} className="absolute inset-0 overflow-visible" role="img" aria-label={`${title}. ${links.map((l) => `${l.from} to ${l.to} ${format(l.value)}`).join("; ")}`}>
            {layout.bands.map((b, i) => (
              <motion.path
                key={b.key}
                d={b.d}
                fill="none"
                className="stroke-accent transition-[stroke-opacity] duration-200"
                strokeWidth={Math.max(1, b.t)}
                style={{ strokeOpacity: lit(b) ? 0.32 : 0.07 }}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: easeInOut, delay: 0.1 + i * 0.03 }}
                onPointerEnter={() => setFocus({ kind: "link", key: b.key })}
              />
            ))}
            {nodes.map((n) => {
              const p = layout.pos.get(n.id)!;
              const lastCol = Math.max(...nodes.map((x) => x.column));
              const side = n.column === 0 ? "left" : n.column === lastCol ? "right" : "top";
              return (
                <g key={n.id} onPointerEnter={() => setFocus({ kind: "node", key: n.id })} className="transition-opacity duration-200" style={{ opacity: nodeLit(n.id) ? 1 : 0.35 }}>
                  <rect x={p.x} y={p.y} width={NODE_W} height={Math.max(2, p.h)} rx={3} className="fill-ink" />
                  <text
                    x={side === "right" ? p.x + NODE_W + 8 : side === "left" ? p.x - 8 : p.x + NODE_W / 2}
                    y={side === "top" ? p.y - 10 : p.y + p.h / 2}
                    textAnchor={side === "right" ? "start" : side === "left" ? "end" : "middle"}
                    dominantBaseline={side === "top" ? "auto" : "middle"}
                    className="fill-ink text-[12px]"
                  >
                    {n.label}
                    <tspan className="fill-muted tabular" dx={6}>{format(p.v)}</tspan>
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}
