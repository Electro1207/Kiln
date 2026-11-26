import { useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { announce } from "../accessibility/announce";
import { fade, springSoft } from "../../motion";
import { ChartShell, MarkerGlyph, MarkerSwatch, chartA11yLabels, cvd, markerShape, rovingNext, useChartA11y, type ChartA11yLabels, type ChartA11yProps } from "./ChartA11y";

export type RadarSeries = { name: string; values: number[] };

/**
 * Several scores on spokes, one polygon per series (two at most: the first in
 * the accent, the second in grey). Polygons open from the centre. The spoke
 * nearest the pointer is read out, worked out from the pointer's angle.
 */
export function RadarChart({
  axes, series, max = 10, title, size = 280, className, labels, accessibilityFeatures, tableToggle,
}: {
  axes: string[]; series: RadarSeries[]; max?: number; title: string; size?: number; className?: string;
  /** Override the accessibility text (table button, summary). Merged over `chartA11yLabels`. */
  labels?: Partial<ChartA11yLabels>;
} & ChartA11yProps) {
  const l = { ...chartA11yLabels, ...labels };
  const ca = useChartA11y({ accessibilityFeatures, tableToggle });
  const [hover, setHover] = useState<number | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const n = axes.length;
  const c = 50, R = 36;
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return [c + r * Math.cos(a), c + r * Math.sin(a)] as const;
  };
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, (v / max) * R).map((x) => x.toFixed(2)).join(",")).join(" ");
  const pick = (x: number, y: number) => {
    const b = svg.current?.getBoundingClientRect();
    if (!b) return;
    const dx = x - (b.left + b.width / 2), dy = y - (b.top + b.height / 2);
    if (Math.hypot(dx, dy) > b.width * 0.48) return setHover(null);
    const ang = (Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);
    setHover(Math.round(ang / ((Math.PI * 2) / n)) % n);
  };
  const styles = [
    { stroke: "stroke-accent", fill: "fill-accent", fillOpacity: 0.18, dot: "fill-accent" },
    { stroke: "stroke-muted", fill: "fill-muted", fillOpacity: 0.08, dot: "fill-muted" },
  ];
  const sw = (k: number) => (ca.colourSafe ? <MarkerSwatch shape={markerShape(k)} i={k} /> : <span aria-hidden className={cn("size-2 rounded-full", k === 0 ? "bg-accent" : "bg-muted")} />);
  return (
    <ChartShell
      ca={ca}
      title={title}
      summary={`${axes.length} axes, scored out of ${max}. ${series.map((s) => `${s.name}: ${axes.map((a, i) => `${a} ${s.values[i]}`).join(", ")}`).join(". ")}.`}
      table={{ caption: title, columns: [l.label, ...series.map((s) => s.name)], rows: axes.map((a, i) => [a, ...series.map((s) => s.values[i])]) }}
      labels={labels}
      className={className}
      bodyClassName="flex flex-col items-center gap-3"
    >
      <div className="flex min-h-10 flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm">
        {hover == null ? (
          series.map((s, k) => (
            <span key={s.name} className="flex items-center gap-1.5 text-muted">
              {sw(k)}
              {s.name}
            </span>
          ))
        ) : (
          <>
            <span className="font-medium text-ink">{axes[hover]}</span>
            {series.map((s, k) => (
              <span key={s.name} className="tabular flex items-center gap-1.5 text-muted">
                {sw(k)}
                {s.name} <span className="font-medium text-ink">{s.values[hover]}</span>
              </span>
            ))}
          </>
        )}
      </div>
      <svg
        ref={svg}
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="max-w-full touch-none overflow-visible"
        tabIndex={0}
        role="group"
        aria-roledescription="chart"
        aria-label={`${title}. ${l.keysHint}`}
        onFocus={(e) => {
          if (e.target === e.currentTarget && e.currentTarget.matches(":focus-visible")) setHover((h) => h ?? 0);
        }}
        onBlur={() => setHover(null)}
        onKeyDown={(e) => {
          const next = rovingNext(e.key, hover ?? 0, n, { prev: ["ArrowLeft", "ArrowUp"], next: ["ArrowRight", "ArrowDown"] });
          if (next == null) return;
          e.preventDefault();
          setHover(next);
          announce(`${axes[next]}: ${series.map((s) => `${s.name} ${s.values[next]}`).join(", ")}`);
        }}
        onPointerMove={(e) => pick(e.clientX, e.clientY)}
        onPointerLeave={() => setHover(null)}
      >
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <polygon key={t} points={axes.map((_, i) => pt(i, R * t).join(",")).join(" ")} fill="none" className="stroke-line" strokeWidth={0.4} />
        ))}
        {axes.map((a, i) => {
          const [x, y] = pt(i, R);
          const [lx, ly] = pt(i, R + 7);
          return (
            <g key={a}>
              <line x1={c} y1={c} x2={x} y2={y} className={cn("transition-[stroke] duration-200", hover === i ? "stroke-line-strong" : "stroke-line")} strokeWidth={hover === i ? 0.7 : 0.4} />
              <text
                x={lx}
                y={ly}
                textAnchor={Math.abs(lx - c) < 2 ? "middle" : lx > c ? "start" : "end"}
                dominantBaseline="middle"
                className={cn("text-[0.225rem] transition-[fill] duration-200", hover === i ? "fill-ink font-medium" : "fill-muted")}
              >
                {a}
              </text>
            </g>
          );
        })}
        {[...series].reverse().map((s) => {
          const k = series.indexOf(s);
          const st = styles[Math.min(k, 1)];
          return (
            <motion.g
              key={s.name}
              style={{ originX: "50px", originY: "50px" }}
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ ...springSoft, delay: k * 0.12 }}
            >
              <polygon
                points={poly(s.values)}
                className={ca.colourSafe ? undefined : cn(st.fill, st.stroke)}
                style={ca.colourSafe ? { fill: cvd(k), stroke: cvd(k) } : undefined}
                fillOpacity={st.fillOpacity}
                strokeWidth={0.8}
                strokeLinejoin="round"
                strokeDasharray={ca.colourSafe && k > 0 ? "2 1.4" : undefined}
              />
              {s.values.map((v, i) => {
                const [x, y] = pt(i, (v / max) * R);
                if (ca.colourSafe) {
                  return (
                    <motion.g key={i} initial={false} animate={{ opacity: hover == null || hover === i ? 1 : 0.35 }} transition={fade}>
                      <MarkerGlyph shape={markerShape(k)} x={x} y={y} size={hover === i ? 3.8 : 3} style={{ fill: cvd(k) }} />
                    </motion.g>
                  );
                }
                return (
                  <motion.circle key={i} cx={x} cy={y} r={hover === i ? 1.6 : 1} className={st.dot} initial={false} animate={{ opacity: hover == null || hover === i ? 1 : 0.35 }} transition={fade} />
                );
              })}
            </motion.g>
          );
        })}
      </svg>
    </ChartShell>
  );
}
