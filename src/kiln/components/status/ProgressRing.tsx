import { useEffect, type ReactNode } from "react";
import { motion, useSpring, useTransform } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";

export type ProgressRingProps = {
  /** 0..100 */
  value: number;
  size?: number;
  stroke?: number;
  /** Shows the number in the middle. Pass children to show something else. */
  showValue?: boolean;
  children?: ReactNode;
  label?: string;
  tone?: "accent" | "positive" | "negative" | "warning";
  className?: string;
};

const strokeColour = { accent: "text-accent", positive: "text-positive", negative: "text-negative", warning: "text-warning" };

/** A circular progress indicator. The arc and the number move together on one spring. */
export function ProgressRing({ value, size = 88, stroke = 7, showValue = true, children, label, tone = "accent", className }: ProgressRingProps) {
  const v = Math.min(Math.max(value, 0), 100);
  const sp = useSpring(0, springFirm);
  useEffect(() => sp.set(v), [sp, v]);
  const length = useTransform(sp, (n) => n / 100);
  const text = useTransform(sp, (n) => `${Math.round(n)}`);
  const arcOpacity = useTransform(sp, (n) => (n <= 0.2 ? 0 : 1));
  const r = (size - stroke) / 2;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-active" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke="currentColor"
          className={strokeColour[tone]}
          style={{ pathLength: length, opacity: arcOpacity }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-ink">
        {children ?? (showValue && (
          <span className="tabular font-semibold" style={{ fontSize: Math.round(size * 0.22) }}>
            <motion.span>{text}</motion.span>
            <span className="text-muted" style={{ fontSize: "0.6em" }}>%</span>
          </span>
        ))}
      </span>
    </div>
  );
}
