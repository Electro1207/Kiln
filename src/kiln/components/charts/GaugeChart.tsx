import { motion } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";
import { NumberTicker } from "../data-display/NumberTicker";

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
};

/** A half-ring meter. The fill and the figure move together and stop dead on the value. */
export function GaugeChart({ value, min = 0, max, label, unit, target, targetLabel, dangerAt, decimals = 0, size = 240, className }: GaugeChartProps) {
  const clamp = (v: number) => Math.max(0, Math.min(1, (v - min) / (max - min)));
  const t = clamp(value);
  const R = 40, cx = 50, cy = 50, sw = 9;
  const track = `M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`;
  const danger = dangerAt != null && value >= dangerAt;
  const mark = (v: number) => {
    const a = Math.PI * (1 - clamp(v));
    return { x: cx + R * Math.cos(a), y: cy - R * Math.sin(a), a };
  };
  const tg = target != null ? mark(target) : null;
  return (
    <div
      className={cn("relative flex flex-col items-center", className)}
      style={{ width: size }}
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={`${value.toFixed(decimals)}${unit ? " " + unit : ""}`}
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
          initial={{ pathLength: 0 }}
          animate={{ pathLength: Math.max(0.0001, t) }}
          transition={springFirm}
        />
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
          className="tabular pointer-events-none absolute whitespace-nowrap text-[11px] font-medium text-ink"
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
          <NumberTicker value={value} format={{ minimumFractionDigits: decimals, maximumFractionDigits: decimals }} className="text-[34px] font-medium tracking-tight text-ink" />
          {unit && <span className="text-sm text-muted">{unit}</span>}
        </span>
        <span className="text-xs text-muted">{label}</span>
      </div>
      </div>
      <div className="tabular mt-2 flex w-full justify-between px-[6%] text-[11px] text-muted" aria-hidden>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
