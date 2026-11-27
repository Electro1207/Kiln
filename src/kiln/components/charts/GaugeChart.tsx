import { motion } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";
import { NumberTicker } from "../data-display/NumberTicker";
import { MarkerGlyph, chartA11yLabels, markerShape, useChartA11y, type ChartA11yLabels, type ChartA11yProps } from "./ChartA11y";

export type GaugeChartProps = {
  value: number;
  min?: number;
  max: number;
  label: string;
  unit?: string;
  /** A target to mark on the arc (a limit, a goal). */
  target?: number;
  targetLabel?: string;
  /** Colour the arc negative from here up. */
  dangerAt?: number;
  decimals?: number;
  size?: number;
  className?: string;
  /** Override the accessibility text. Merged over `chartA11yLabels`. */
  labels?: Partial<ChartA11yLabels>;
} & ChartA11yProps;

/** A half-ring meter. The fill and the figure move together and stop dead on the value. */
export function GaugeChart({ value, min = 0, max, label, unit, target, targetLabel, dangerAt, decimals = 0, size = 240, className, labels, accessibilityFeatures }: GaugeChartProps) {
  const l = { ...chartA11yLabels, ...labels };
  const ca = useChartA11y({ accessibilityFeatures });
  // One-off entrances (draw, grow, fade in) are skipped under calm, reduced motion and no flashing.
  const still = ca.a11y.calm || ca.a11y.reduceMotion || ca.a11y.noFlashing;
  const clamp = (v: number) => Math.max(0, Math.min(1, (v - min) / (max - min)));
  const t = clamp(value);
  const R = 40, cx = 50, cy = 50, sw = 9;
  const track = `M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`;
  const danger = dangerAt != null && value >= dangerAt;
  const mark = (v: number) => {
    const a = Math.PI * (1 - clamp(v));
    return { x: cx + R * Math.cos(a), y: cy - R * Math.sin(a), a };
  };
  const end = mark(value);
  const valueText = `${value.toFixed(decimals)}${unit ? " " + unit : ""}`;
  const tg = target != null ? mark(target) : null;
  return (
    <div
      {...ca.rootProps}
      className={cn("relative flex flex-col items-center", className)}
      style={{ ...ca.rootProps.style, width: size }}
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={
        ca.a11y.screenReaderHints
          ? l.meter({ label, value: valueText, min: String(min), max: String(max), target: target != null ? `${targetLabel ?? target}` : undefined }) + (danger ? " Over the limit." : "")
          : valueText
      }
    >
      <div className="relative w-full">
      <svg viewBox="0 0 100 56" className="block w-full overflow-visible" aria-hidden>
        <path d={track} fill="none" className="stroke-active" strokeWidth={sw} strokeLinecap="round" />
        <motion.path
          d={track}
          fill="none"
          className={cn("transition-[stroke] duration-300", danger ? "stroke-negative" : "stroke-accent")}
          strokeWidth={sw}
          strokeLinecap="round"
          initial={still ? false : { pathLength: 0 }}
          animate={{ pathLength: Math.max(0.0001, t) }}
          transition={springFirm}
        />
        {ca.colourSafe && danger && <MarkerGlyph shape={markerShape(2)} x={end.x} y={end.y} size={9} className="fill-ink stroke-surface" style={{ strokeWidth: 1 }} />}
        {tg && (
          <line
            x1={cx + (R - sw / 2 - 2) * Math.cos(tg.a)}
            y1={cy - (R - sw / 2 - 2) * Math.sin(tg.a)}
            x2={cx + (R + sw / 2 + 2) * Math.cos(tg.a)}
            y2={cy - (R + sw / 2 + 2) * Math.sin(tg.a)}
            className="stroke-ink"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        )}
      </svg>
      {tg && targetLabel && (
        <span
          aria-hidden
          className="tabular pointer-events-none absolute whitespace-nowrap text-[0.6875rem] font-medium text-ink"
          style={{
            left: `${cx + (R + sw / 2 + 5) * Math.cos(tg.a)}%`,
            top: `${((cy - (R + sw / 2 + 5) * Math.sin(tg.a)) / 56) * 100}%`,
            transform: `translate(${Math.cos(tg.a) >= 0 ? "0" : "-100%"}, -50%)`,
          }}
        >
          {targetLabel}
        </span>
      )}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <span className="flex items-baseline gap-1">
          <NumberTicker value={value} format={{ minimumFractionDigits: decimals, maximumFractionDigits: decimals }} className="text-[2.125rem] font-medium tracking-tight text-ink" />
          {unit && <span className="text-sm text-muted">{unit}</span>}
        </span>
        <span className="text-xs text-muted">{label}</span>
      </div>
      </div>
      <div className="tabular mt-2 flex w-full justify-between px-[6%] text-[0.6875rem] text-muted" aria-hidden>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
