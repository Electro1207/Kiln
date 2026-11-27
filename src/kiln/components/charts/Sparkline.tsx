import { motion } from "motion/react";
import { cn } from "../../cn";
import { easeInOut } from "../../motion";
import { MarkerGlyph, chartA11yLabels, markerShape, summariseSeries, useChartA11y, type ChartA11yLabels, type ChartA11yProps } from "./ChartA11y";

export type SparklineProps = {
  values: number[];
  /** Read by screen readers, e.g. "Share price, last 30 days, up 12%". */
  label: string;
  width?: number;
  height?: number;
  /** Colour the line by its direction instead of the accent. */
  trend?: boolean;
  className?: string;
  /** Override the accessibility text. Merged over `chartA11yLabels`. */
  labels?: Partial<ChartA11yLabels>;
  /** Accepted for the same API as the other charts. A word-sized chart has no room for a table; its numbers join the accessible description instead. */
  tableToggle?: boolean;
} & Omit<ChartA11yProps, "tableToggle">;

/**
 * A word-sized line for running text and table cells. Not for KPIs: a figure
 * on its own reads better without one. Draws in once, left to right.
 */
export function Sparkline({ values, label, width = 72, height = 20, trend = false, className, labels, accessibilityFeatures, tableToggle }: SparklineProps) {
  const l = { ...chartA11yLabels, ...labels };
  const ca = useChartA11y({ accessibilityFeatures, tableToggle });
  // One-off entrances (draw, grow, fade in) are skipped under calm, reduced motion and no flashing.
  const still = ca.a11y.calm || ca.a11y.reduceMotion || ca.a11y.noFlashing;
  const min = Math.min(...values), max = Math.max(...values);
  const pad = 2;
  const px = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2);
  const py = (v: number) => pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2);
  const d = values.map((v, i) => `${i ? "L" : "M"}${px(i).toFixed(2)},${py(v).toFixed(2)}`).join(" ");
  const up = values[values.length - 1] >= values[0];
  const tone = trend ? (up ? "stroke-positive" : "stroke-negative") : "stroke-accent";
  const dot = trend ? (up ? "fill-positive" : "fill-negative") : "fill-accent";
  const described = ca.toggle || ca.a11y.screenReaderHints;
  return (
    <svg
      {...ca.rootProps}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("inline-block shrink-0 overflow-visible align-[-0.3em]", className)}
      role="img"
      aria-label={described ? `${label}. ${summariseSeries(l, values.map((_, i) => String(i + 1)), values, String)}` : label}
    >
      <motion.path
        d={d}
        fill="none"
        className={tone}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={still ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: easeInOut }}
      />
      {ca.colourSafe && trend ? (
        <MarkerGlyph shape={markerShape(up ? 2 : 5)} x={px(values.length - 1)} y={py(values[values.length - 1])} size={6} className={dot} />
      ) : (
      <motion.circle
        cx={px(values.length - 1)}
        cy={py(values[values.length - 1])}
        r={2.25}
        className={dot}
        initial={still ? false : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.2, delay: 0.85 }}
      />
      )}
    </svg>
  );
}
