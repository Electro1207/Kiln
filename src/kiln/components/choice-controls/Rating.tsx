import { useId, useMemo, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { useAnimate } from "motion/react";
import { cn } from "../../cn";
import { springBouncy } from "../../motion";
import type { Size } from "../../controllable";

const STAR_PX: Record<Size, number> = { sm: 20, md: 28, lg: 36 };
const LABEL_TEXT: Record<Size, string> = { sm: "text-[13px]", md: "text-sm", lg: "text-[15px]" };

const STAR = "M12 2.8l2.75 5.6 6.15.9-4.45 4.33 1.05 6.12L12 16.86l-5.5 2.9 1.05-6.13L3.1 9.3l6.15-.9z";

/** Text used by Rating. Pass a partial via `uiLabels` to translate or reword (`labels` already holds the value words). */
export interface RatingLabels {
  /** Visible word for no rating, when `labels` words are shown. */
  notRated: string;
  /** Spoken value when no word is given for it, e.g. "3 of 5". */
  valueOf: (value: number, max: number) => string;
}
export const ratingLabels: RatingLabels = { notRated: "Not rated", valueOf: (v, n) => `${v} of ${n}` };

/** Icons used by Rating. Pass a partial via `icons` to replace any. */
export interface RatingIcons {
  /** A lit item. It takes the warning colour and fills with it. */
  star: ReactNode;
  /** An unlit item. It takes the muted line colour. */
  starOff: ReactNode;
}
const starSvg = (
  <svg viewBox="0 0 24 24">
    <path d={STAR} fill="var(--star-fill, currentColor)" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
);
export const ratingIcons: RatingIcons = { star: starSvg, starOff: starSvg };

/**
 * Star rating. The whole row owns the pointer: the value under it comes from the pointer's x across
 * the row, so the gaps between stars are never dead zones. A pick makes the chosen stars hop in a wave.
 */
export function Rating({
  value, onChange, max = 5, label = "Rating", size = "md", gap = 4, readOnly, className, labels, hideLabel, uiLabels, icons,
}: {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
  label?: string;
  /** `sm`, `md` (default) or `lg`; or a star size in px. */
  size?: Size | number;
  /** Space between stars in px. */
  gap?: number;
  readOnly?: boolean;
  className?: string;
  /** Words for each value, read out and shown, e.g. ["Poor", …, "Excellent"]. */
  labels?: string[];
  /** Keep the label for screen readers only. */
  hideLabel?: boolean;
  /** Override any UI text. Merged over `ratingLabels`. */
  uiLabels?: Partial<RatingLabels>;
  /** Replace the lit and unlit icon, e.g. a heart. Merged over `ratingIcons`. */
  icons?: Partial<RatingIcons>;
}) {
  const l = { ...ratingLabels, ...uiLabels };
  const ic = useMemo(() => ({ ...ratingIcons, ...icons }), [icons]);
  const px = typeof size === "number" ? size : STAR_PX[size];
  const textSize = typeof size === "number" ? (size < 24 ? LABEL_TEXT.sm : size > 32 ? LABEL_TEXT.lg : LABEL_TEXT.md) : LABEL_TEXT[size];
  const id = useId();
  const [hover, setHover] = useState<number | null>(null);
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const shown = hover ?? value;

  const at = (e: PointerEvent) => {
    const r = scope.current!.getBoundingClientRect();
    const t = (e.clientX - r.left) / r.width;
    return Math.min(max, Math.max(1, Math.ceil(t * max)));
  };

  const hop = (n: number) => {
    const stars = scope.current?.querySelectorAll<HTMLElement>("[data-star]");
    stars?.forEach((s, i) => {
      if (i < n) animate(s, { scale: [0.6, 1] }, { ...springBouncy, delay: i * 0.045 });
    });
  };

  const set = (n: number) => {
    onChange?.(n);
    if (n > 0) hop(n);
  };

  const onKey = (e: KeyboardEvent) => {
    if (readOnly) return;
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowUp") { e.preventDefault(); set(Math.min(max, value + 1)); }
    else if (k === "ArrowLeft" || k === "ArrowDown") { e.preventDefault(); onChange?.(Math.max(0, value - 1)); }
    else if (k === "Home") { e.preventDefault(); onChange?.(0); }
    else if (k === "End") { e.preventDefault(); set(max); }
    else if (/^[0-9]$/.test(k) && +k <= max) { e.preventDefault(); set(+k); }
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span id={`${id}-l`} className={cn("text-sm font-medium text-ink", hideLabel && "sr-only")}>{label}</span>
      <div className="flex items-center gap-3">
        <div
          ref={scope}
          role="slider"
          tabIndex={readOnly ? -1 : 0}
          aria-labelledby={`${id}-l`}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={labels?.[value - 1] ?? l.valueOf(value, max)}
          aria-readonly={readOnly}
          onKeyDown={onKey}
          onPointerMove={readOnly ? undefined : (e) => { if (e.pointerType !== "touch") { const n = at(e); setHover((h) => (h === n ? h : n)); } }}
          onPointerLeave={() => setHover(null)}
          onClick={readOnly ? undefined : (e) => { const n = at(e as unknown as PointerEvent); set(n === value ? 0 : n); setHover(null); }}
          className={cn("flex touch-manipulation rounded-control outline-offset-4", readOnly ? "cursor-default" : "cursor-pointer")}
          style={{ gap }}
        >
          {Array.from({ length: max }, (_, i) => {
            const n = i + 1;
            const on = n <= shown;
            const preview = hover !== null && n > value && on;
            return (
              <span
                key={n}
                data-star
                aria-hidden
                style={{ width: px, height: px }}
                className={cn(
                  "pointer-events-none inline-flex will-change-transform [&>svg]:size-full [&_*]:transition-[fill,stroke] [&_*]:duration-150",
                  on
                    ? cn("[--star-fill:currentColor] [&>svg]:fill-current", preview ? "text-warning/60" : "text-warning")
                    : "text-line-strong [--star-fill:var(--color-active)]",
                )}
              >
                {on ? ic.star : ic.starOff}
              </span>
            );
          })}
        </div>
        {labels && (
          // Every word sits in one grid cell and only the current one shows, so the cell is as wide as the
          // longest. A label that changed width would move the row under the pointer when the row is centred.
          <span className={cn("grid text-muted [&>*]:[grid-area:1/1]", textSize)} aria-hidden>
            {[l.notRated, ...labels].map((w, i) => (
              <span key={i} className={i === shown ? "" : "invisible"}>{w}</span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
