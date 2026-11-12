import { useEffect, useRef, type ReactNode } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";

export type StatProps = {
  label: string;
  value: number;
  format?: Intl.NumberFormatOptions;
  /** Change against the previous period, as a fraction (0.12 = +12%). */
  delta?: number;
  /** Set when a rise is bad news (latency, churn) so the colour reads right. */
  invert?: boolean;
  note?: string;
  locale?: string;
  className?: string;
  /** Replace any built-in icon. Merged over `statIcons`. */
  icons?: Partial<StatIcons>;
};

export interface StatIcons {
  /** Beside a rise. */
  up: ReactNode;
  /** Beside a fall. */
  down: ReactNode;
}
export const statIcons: StatIcons = { up: <ArrowUpRight />, down: <ArrowDownRight /> };

/** A figure that counts up once when it scrolls into view. */
export function Stat({ label, value, format, delta, invert, note, locale = "en-GB", className, icons }: StatProps) {
  const ic = { ...statIcons, ...icons };
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const nf = new Intl.NumberFormat(locale, format);
  const text = useTransform(mv, (v) => nf.format(format?.maximumFractionDigits ? v : Math.round(v)));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { ...springFirm, visualDuration: 1.1 });
    return () => c.stop();
  }, [inView, value, reduce, mv]);

  const good = delta == null ? null : invert ? delta < 0 : delta > 0;
  return (
    <div ref={ref} className={cn("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-[13px] font-medium text-muted">{label}</span>
      <motion.span className="tabular text-[28px] leading-tight text-ink" aria-label={nf.format(value)}>
        {text}
      </motion.span>
      {(delta != null || note) && (
        <span className="flex items-center gap-1.5 text-xs">
          {delta != null && (
            <span className={cn("tabular inline-flex items-center gap-0.5 font-medium [&>svg]:size-3.5", good ? "text-positive" : "text-negative")}>
              {delta >= 0 ? ic.up : ic.down}
              {Math.abs(delta * 100).toFixed(1)}%
            </span>
          )}
          {note && <span className="text-muted">{note}</span>}
        </span>
      )}
    </div>
  );
}
