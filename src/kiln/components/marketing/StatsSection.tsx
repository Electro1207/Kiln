import { useEffect, useRef, type ReactNode } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { cn } from "../../cn";
import { SectionHeading } from "../app-shells/PageHeading";

export type StatItem = { label: string; value: number; format?: Intl.NumberFormatOptions; prefix?: string; suffix?: string; note?: string };

export type StatsSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  stats: StatItem[];
  /** BCP 47 locale for number formatting. Default "en-GB". */
  locale?: string;
  className?: string;
};

/** Counts up once when it first comes into view. Writes text directly, so React doesn't re-render per frame. */
function CountUp({ item, locale }: { item: StatItem; locale?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const fmt = new Intl.NumberFormat(locale ?? "en-GB", item.format);
  const text = (v: number) => `${item.prefix ?? ""}${fmt.format(v)}${item.suffix ?? ""}`;

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) {
      el.textContent = text(item.value);
      return;
    }
    const ctl = animate(0, item.value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = text(item.format?.maximumFractionDigits ? v : Math.round(v));
      },
    });
    return () => ctl.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, item.value]);

  return (
    <span className="relative inline-grid tabular [&>*]:[grid-area:1/1]">
      {/* The final figure reserves the width, so counting never shifts the layout. */}
      <span aria-hidden className="invisible">{text(item.value)}</span>
      <span ref={ref} aria-hidden>{text(0)}</span>
      <span className="sr-only">{text(item.value)}</span>
    </span>
  );
}

/** A heading and a row of large figures. */
export function StatsSection({ title, description, stats, locale, className }: StatsSectionProps) {
  return (
    <section className={cn("@container w-full", className)}>
      <SectionHeading title={title} description={description} />
      <dl className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 @md:grid-cols-2 @4xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col gap-2 rounded-card bg-surface p-6">
            <dt className="order-2 text-sm text-ink">{s.label}</dt>
            <dd className="order-1 text-4xl font-semibold tracking-[-0.03em] text-ink @2xl:text-5xl">
              <CountUp item={s} locale={locale} />
            </dd>
            {s.note && <dd className="order-3 text-[13px] text-muted">{s.note}</dd>}
          </div>
        ))}
      </dl>
    </section>
  );
}
