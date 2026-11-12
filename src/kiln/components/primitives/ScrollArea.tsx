import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue } from "motion/react";
import { cn } from "../../cn";
import { fade, springFirm } from "../../motion";

type ScrollAreaProps = {
  children: ReactNode;
  className?: string;
  /** Classes for the scrolling viewport (padding, height...). */
  viewportClassName?: string;
  /** "auto" shows the thumb while scrolling or hovering, "always" keeps it. */
  visibility?: "auto" | "always";
};

/** A scroll container with an overlay thumb in the macOS manner: it fades in while
    you scroll or hover, can be dragged, and never takes width from the content.
    The thumb moves through motion values, so scrolling never re-renders React. */
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { children, className, viewportClassName, visibility = "auto" },
  ref,
) {
  const viewport = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => viewport.current!);
  const y = useMotionValue(0);
  const height = useMotionValue(0);
  const [scrollable, setScrollable] = useState(false);
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);
  const idle = useRef<number | undefined>(undefined);
  const drag = useRef<{ startY: number; startTop: number } | null>(null);

  const measure = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const can = scrollHeight > clientHeight + 1;
    setScrollable(can);
    if (!can) return;
    const track = clientHeight - 8;
    const h = Math.max(28, (clientHeight / scrollHeight) * track);
    height.set(h);
    y.set(4 + (scrollTop / (scrollHeight - clientHeight)) * (track - h));
  }, [height, y]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [measure]);

  const onScroll = () => {
    measure();
    setActive(true);
    window.clearTimeout(idle.current);
    idle.current = window.setTimeout(() => setActive(false), 900);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const el = viewport.current;
    if (!el) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    drag.current = { startY: e.clientY, startTop: el.scrollTop };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const el = viewport.current;
    if (!el || !drag.current) return;
    const track = el.clientHeight - 8 - height.get();
    const ratio = (el.scrollHeight - el.clientHeight) / Math.max(1, track);
    el.scrollTop = drag.current.startTop + (e.clientY - drag.current.startY) * ratio;
  };
  const onPointerUp = () => { drag.current = null; };

  const onTrackDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const el = viewport.current;
    if (!el) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const dir = e.clientY - rect.top < y.get() ? -1 : 1;
    animate(el.scrollTop, el.scrollTop + dir * el.clientHeight * 0.85, {
      ...springFirm,
      onUpdate: (v) => { el.scrollTop = v; },
    });
  };

  const shown = visibility === "always" || active || hover || drag.current !== null;

  return (
    <div
      className={cn("relative min-h-0 overflow-hidden", className)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div
        ref={viewport}
        onScroll={onScroll}
        tabIndex={0}
        className={cn(
          "h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline-offset-[-2px]",
          viewportClassName,
        )}
      >
        {children}
      </div>
      {scrollable && (
        <motion.div
          aria-hidden
          onPointerDown={onTrackDown}
          className="absolute inset-y-0 right-0 w-3"
          initial={false}
          animate={{ opacity: shown ? 1 : 0 }}
          transition={fade}
        >
          <motion.div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            style={{ y, height }}
            className="absolute right-[3px] top-0 w-1.5 cursor-grab touch-none rounded-full bg-line-strong transition-[width,background-color] duration-150 hover:w-2 hover:bg-faint active:cursor-grabbing"
          />
        </motion.div>
      )}
    </div>
  );
});
