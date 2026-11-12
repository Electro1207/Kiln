import { motion } from "motion/react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";

export type FunnelStage = { label: string; value: number };

/**
 * Stages that narrow, each bar centred and as wide as its share of the first,
 * with the step-to-step conversion between them. Bars open from the centre once in view.
 */
export function FunnelChart({ stages, title, format = (v) => v.toLocaleString("en-US"), className }: { stages: FunnelStage[]; title: string; format?: (v: number) => string; className?: string }) {
  const top = stages[0]?.value || 1;
  return (
    <figure className={cn("flex w-full flex-col", className)} aria-label={title}>
      <ol className="flex flex-col">
        {stages.map((s, i) => {
          const share = s.value / top;
          const conv = i > 0 ? s.value / stages[i - 1].value : null;
          return (
            <li key={s.label} className="flex flex-col">
              {conv != null && (
                <div className="flex h-7 items-center justify-center text-xs text-muted" aria-label={`${(conv * 100).toFixed(1)}% went on`}>
                  <span className="tabular">{(conv * 100).toFixed(1)}% went on</span>
                </div>
              )}
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)_minmax(0,1fr)] items-center gap-3">
                <span className="truncate text-right text-sm text-ink">{s.label}</span>
                <div className="relative flex h-9 justify-center">
                  <motion.span
                    aria-hidden
                    className="h-full rounded-[6px] bg-accent"
                    style={{ width: `${share * 100}%`, opacity: 1 - i * (0.55 / Math.max(1, stages.length - 1)) }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ ...springSoft, delay: i * 0.06 }}
                  />
                </div>
                <span className="tabular text-sm font-medium text-ink">
                  {format(s.value)} <span className="font-normal text-muted">{i > 0 ? `${(share * 100).toFixed(share < 0.01 ? 2 : 1)}%` : ""}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <figcaption className="sr-only">{title}</figcaption>
    </figure>
  );
}
