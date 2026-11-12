import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform } from "motion/react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";

export type ResizablePanelsProps = {
  first: ReactNode;
  second: ReactNode;
  direction?: "horizontal" | "vertical";
  /** Share of the first panel, 0–100. */
  defaultSize?: number;
  /** Smallest size of each panel in px. */
  minFirst?: number;
  minSecond?: number;
  /** Accessible name of the divider. Wins over `labels.resize`. */
  label?: string;
  /** Override any UI text. Merged over `resizablePanelsLabels`. */
  labels?: Partial<ResizablePanelsLabels>;
  onResize?: (percent: number) => void;
  className?: string;
};

/** Text used by ResizablePanels. Pass a partial via `labels` to translate or reword. */
export interface ResizablePanelsLabels {
  /** Accessible name of the divider. */
  resize: string;
}
export const resizablePanelsLabels: ResizablePanelsLabels = { resize: "Resize panels" };

/**
 * Two panels with a draggable divider. Arrow keys move it by 2% (Shift: 10%),
 * Home and End go to the limits, and a double-click resets it.
 */
export function ResizablePanels({
  first,
  second,
  direction = "horizontal",
  defaultSize = 50,
  minFirst = 120,
  minSecond = 120,
  label,
  labels,
  onResize,
  className,
}: ResizablePanelsProps) {
  const l = { ...resizablePanelsLabels, ...labels };
  const id = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const size = useMotionValue(defaultSize);
  const basis = useTransform(size, (v) => `${v}%`);
  const [now, setNow] = useState(defaultSize);
  const [dragging, setDragging] = useState(false);
  const horizontal = direction === "horizontal";
  const onResizeRef = useRef(onResize);
  useEffect(() => {
    onResizeRef.current = onResize;
  });

  useMotionValueEvent(size, "change", (v) => {
    setNow(Math.round(v));
    onResizeRef.current?.(v);
  });

  const limits = () => {
    const box = boxRef.current;
    const total = box ? (horizontal ? box.clientWidth : box.clientHeight) : 0;
    if (!total) return [0, 100] as const;
    return [Math.min(50, (minFirst / total) * 100), Math.max(50, 100 - (minSecond / total) * 100)] as const;
  };
  const clamp = (v: number) => {
    const [lo, hi] = limits();
    return Math.min(hi, Math.max(lo, v));
  };

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const ro = new ResizeObserver(() => size.set(clamp(size.get())));
    ro.observe(box);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [horizontal, minFirst, minSecond]);

  const fromPointer = (e: PointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    const v = horizontal ? ((e.clientX - r.left) / r.width) * 100 : ((e.clientY - r.top) / r.height) * 100;
    size.set(clamp(v));
  };

  const onKey = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 2;
    const [lo, hi] = limits();
    const less = horizontal ? "ArrowLeft" : "ArrowUp";
    const more = horizontal ? "ArrowRight" : "ArrowDown";
    let to: number | null = null;
    if (e.key === less) to = size.get() - step;
    else if (e.key === more) to = size.get() + step;
    else if (e.key === "Home") to = lo;
    else if (e.key === "End") to = hi;
    else if (e.key === "Enter") to = defaultSize;
    if (to == null) return;
    e.preventDefault();
    animate(size, clamp(to), springFirm);
  };

  return (
    <div ref={boxRef} className={cn("flex h-full w-full min-h-0 min-w-0 overflow-hidden", horizontal ? "flex-row" : "flex-col", className)}>
      <motion.div id={`${id}-a`} className="min-h-0 min-w-0 shrink-0 overflow-auto" style={{ flexBasis: basis }}>
        {first}
      </motion.div>
      <div
        role="separator"
        tabIndex={0}
        aria-label={label ?? l.resize}
        aria-controls={`${id}-a`}
        aria-orientation={horizontal ? "vertical" : "horizontal"}
        aria-valuenow={now}
        aria-valuemin={0}
        aria-valuemax={100}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDragging(true);
        }}
        onPointerMove={(e) => dragging && fromPointer(e)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onDoubleClick={() => animate(size, clamp(defaultSize), springFirm)}
        onKeyDown={onKey}
        className={cn(
          // The separator is the 1px line itself, so it sits on whole pixels.
          "group relative z-10 flex shrink-0 touch-none items-center justify-center outline-none transition-colors duration-200",
          horizontal ? "w-px cursor-col-resize" : "h-px cursor-row-resize",
          dragging ? "bg-accent" : "bg-line hover:bg-line-strong focus-visible:bg-accent",
        )}
      >
        {/* A 13px hit area centred on the line; the grip shows on hover, focus and drag.
            Odd sizes (13, 5) keep both centred on whole pixels. */}
        <span aria-hidden className={cn("absolute", horizontal ? "inset-y-0 -left-1.5 w-[13px]" : "inset-x-0 -top-1.5 h-[13px]")} />
        <span
          aria-hidden
          className={cn(
            "relative shrink-0 rounded-full transition-[opacity,background-color] duration-200",
            horizontal ? "h-8 w-[5px]" : "h-[5px] w-8",
            dragging ? "bg-accent opacity-100" : "bg-line-strong opacity-0 group-hover:opacity-100 group-focus-visible:bg-accent group-focus-visible:opacity-100",
          )}
        />
      </div>
      <div className="min-h-0 min-w-0 flex-1 overflow-auto">{second}</div>
    </div>
  );
}
