import { useMemo, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { ChevronsLeftRight } from "lucide-react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";

/** Text used by CompareSlider. Pass a partial via `labels` to translate or reword. */
export interface CompareSliderLabels {
  /** Spoken value of the handle, e.g. "50% Before, 50% After". */
  valueText: (before: number, after: number, beforeLabel: string, afterLabel: string) => string;
}
export const compareSliderLabels: CompareSliderLabels = {
  valueText: (b, a, bl, al) => `${b}% ${bl}, ${a}% ${al}`,
};

export type CompareSliderProps = {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** Starting split, 0..100. */
  initial?: number;
  /** Accessible name for the handle. */
  label?: string;
  /** Override any UI text. Merged over `compareSliderLabels`. */
  labels?: Partial<CompareSliderLabels>;
  /** Replace any built-in icon. Merged over `compareSliderIcons`. */
  icons?: Partial<CompareSliderIcons>;
  className?: string;
};

/**
 * Before and after, one over the other, with a handle you drag or move with
 * the arrow keys. The reveal is a window that slides by transform, so even
 * large pictures stay smooth.
 */
/** Icons used by CompareSlider. Pass a partial via `icons` to swap any of them. */
export interface CompareSliderIcons {
  /** Drag handle. */
  handle: ReactNode;
}
export const compareSliderIcons: CompareSliderIcons = { handle: <ChevronsLeftRight /> };

export function CompareSlider({ before, after, beforeLabel = "Before", afterLabel = "After", initial = 50, label = "Compare", labels, icons, className }: CompareSliderProps) {
  const l = { ...compareSliderLabels, ...labels };
  const ic = useMemo(() => ({ ...compareSliderIcons, ...icons }), [icons]);
  const box = useRef<HTMLDivElement>(null);
  const pos = useMotionValue(initial);
  const [value, setValue] = useState(initial);
  useMotionValueEvent(pos, "change", (v) => setValue(Math.round(v)));
  const dragging = useRef(false);

  // The "after" layer is a window from the split to the right edge; its content is shifted back so it stays put.
  const windowX = useTransform(pos, (p) => `${p}%`);
  const contentX = useTransform(pos, (p) => `${-p}%`);

  const fromPointer = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    return Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100));
  };

  return (
    <div
      ref={box}
      className={cn("relative select-none overflow-hidden rounded-card touch-pan-y", className)}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        animate(pos, fromPointer(e.clientX), springFirm);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return;
        pos.stop();
        pos.set(fromPointer(e.clientX));
      }}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div className="pointer-events-none h-full">{before}</div>
      <motion.div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ x: windowX }}>
        <motion.div className="absolute inset-0" style={{ x: contentX }}>
          {after}
        </motion.div>
      </motion.div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink">{beforeLabel}</span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-xs font-medium text-ink">{afterLabel}</span>

      {/* A full-width layer moved by x, so the handle travels by transform, never by left. */}
      <motion.div className="pointer-events-none absolute inset-0" style={{ x: windowX }}>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-px w-0.5 bg-surface" />
        <button
          type="button"
          role="slider"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={value}
          aria-valuetext={l.valueText(value, 100 - value, beforeLabel, afterLabel)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 10 : 2;
            const to =
              e.key === "ArrowLeft" || e.key === "ArrowDown" ? pos.get() - step
              : e.key === "ArrowRight" || e.key === "ArrowUp" ? pos.get() + step
              : e.key === "Home" ? 0
              : e.key === "End" ? 100
              : null;
            if (to === null) return;
            e.preventDefault();
            animate(pos, Math.min(100, Math.max(0, to)), springFirm);
          }}
          className="pointer-events-auto absolute left-0 top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full bg-surface text-ink shadow-float [&>svg]:size-4"
        >
          {ic.handle}
        </button>
      </motion.div>
    </div>
  );
}
