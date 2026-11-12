import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { springFirm, springSnappy } from "../../motion";

/** Text used by Carousel. Pass a partial via `labels` to translate or reword. */
export interface CarouselLabels {
  /** aria-label of each slide group, e.g. "2 of 6". */
  slideOf: (index: number, count: number) => string;
  /** aria-label of the dot list. */
  chooseSlide: string;
  /** aria-label of a dot. */
  goToSlide: (index: number) => string;
  /** Previous arrow. */
  previous: string;
  /** Next arrow. */
  next: string;
  /** Live-region announcement of the current slide. */
  announce: (index: number, count: number) => string;
}
export const carouselLabels: CarouselLabels = {
  slideOf: (i, n) => `${i} of ${n}`,
  chooseSlide: "Choose slide",
  goToSlide: (i) => `Go to slide ${i}`,
  previous: "Previous slide",
  next: "Next slide",
  announce: (i, n) => `Slide ${i} of ${n}`,
};

export type CarouselProps = {
  slides: ReactNode[];
  label: string;
  /** Controlled index of the first visible slide. Leave out to let the carousel keep its own. */
  value?: number;
  /** Where an uncontrolled carousel starts. Default 0. */
  defaultValue?: number;
  /** Called with the new index, controlled or not. */
  onChange?: (index: number) => void;
  /** Slides visible at once from 720px wide. Phones always show one with a peek of the next. */
  perView?: number;
  gap?: number;
  /** Override any UI text. Merged over `carouselLabels`. */
  labels?: Partial<CarouselLabels>;
  /** Replace any built-in icon. Merged over `carouselIcons`. */
  icons?: Partial<CarouselIcons>;
  className?: string;
};

/** Drag with momentum, snaps to a slide, arrows and keyboard too. */
/** Icons used by Carousel. Pass a partial via `icons` to swap any of them. */
export interface CarouselIcons {
  /** Previous slide button. */
  previous: ReactNode;
  /** Next slide button. */
  next: ReactNode;
}
export const carouselIcons: CarouselIcons = { previous: <ChevronLeft />, next: <ChevronRight /> };

export function Carousel({ slides, label, value, defaultValue = 0, onChange, perView = 2, gap = 16, labels, icons, className }: CarouselProps) {
  const l = { ...carouselLabels, ...labels };
  const ic = useMemo(() => ({ ...carouselIcons, ...icons }), [icons]);
  const uid = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useControllable(value, defaultValue, onChange);
  const settled = useRef(index);
  const x = useMotionValue(0);
  const dragging = useRef(false);

  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);

  const pv = width >= 720 ? perView : 1;
  const slideW = width === 0 ? 0 : pv === 1 ? width * 0.86 : (width - gap * (pv - 1)) / pv;
  const stride = slideW + gap;
  const maxIndex = Math.max(0, slides.length - pv);
  const minX = Math.min(0, -(slides.length * stride - gap - width));
  const posFor = useCallback((i: number) => Math.max(minX, -i * stride), [minX, stride]);

  // Re-seat the track only when the size changes, not on every index change (that would cut the spring).
  const reseat = useRef(() => {});
  useLayoutEffect(() => {
    reseat.current = () => {
      if (width) x.set(posFor(Math.min(index, maxIndex)));
    };
  });
  useLayoutEffect(() => reseat.current(), [width, pv]);

  const go = (i: number, velocity = 0) => {
    const next = Math.max(0, Math.min(maxIndex, i));
    settled.current = next;
    setIndex(next);
    animate(x, posFor(next), { ...springFirm, velocity });
  };

  // An index set from outside slides the track; one go() just made is already on its way.
  useEffect(() => {
    if (index === settled.current) return;
    settled.current = index;
    if (width) animate(x, posFor(Math.min(index, maxIndex)), springFirm);
  }, [index, width, maxIndex, posFor, x]);

  useEffect(() => () => x.stop(), [x]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const projected = x.get() + info.velocity.x * 0.18;
    go(Math.round(-projected / stride), info.velocity.x);
    window.setTimeout(() => (dragging.current = false), 0);
  };

  return (
    <section aria-roledescription="carousel" aria-label={label} className={cn("flex w-full min-w-0 flex-col gap-4", className)}>
      <div
        ref={viewport}
        className="overflow-hidden rounded-card outline-offset-4"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") { e.preventDefault(); go(index + 1); }
          if (e.key === "ArrowLeft") { e.preventDefault(); go(index - 1); }
        }}
      >
        <motion.div
          className="flex cursor-grab touch-pan-y active:cursor-grabbing"
          style={{ x, gap }}
          drag="x"
          dragConstraints={{ left: minX, right: 0 }}
          dragElastic={0.14}
          dragMomentum={false}
          onDragStart={() => (dragging.current = true)}
          onDragEnd={onDragEnd}
          onClickCapture={(e) => dragging.current && e.stopPropagation()}
        >
          {slides.map((s, i) => (
            <div
              key={i}
              role="group"
              aria-roledescription="slide"
              aria-label={l.slideOf(i + 1, slides.length)}
              aria-hidden={i < index || i >= index + Math.ceil(pv) ? true : undefined}
              className="shrink-0 select-none [&_img]:pointer-events-none"
              style={{ width: slideW || "86%" }}
            >
              {s}
            </div>
          ))}
        </motion.div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5" role="tablist" aria-label={l.chooseSlide}>
          {Array.from({ length: maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={l.goToSlide(i + 1)}
              onClick={() => go(i)}
              className="grid h-6 place-items-center"
            >
              <motion.span
                className={cn("block h-1.5 rounded-full transition-colors duration-300", i === index ? "bg-ink" : "bg-line-strong")}
                initial={false}
                animate={{ width: i === index ? 20 : 6 }}
                transition={springFirm}
              />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <ArrowBtn label={l.previous} disabled={index === 0} onClick={() => go(index - 1)}>
            {ic.previous}
          </ArrowBtn>
          <ArrowBtn label={l.next} disabled={index >= maxIndex} onClick={() => go(index + 1)}>
            {ic.next}
          </ArrowBtn>
        </div>
      </div>
      <span id={uid} className="sr-only" aria-live="polite">
        {l.announce(index + 1, slides.length)}
      </span>
    </section>
  );
}

function ArrowBtn({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={springSnappy}
      className="grid size-9 place-items-center rounded-full border border-line-strong bg-surface text-ink transition-[opacity,background-color] hover:bg-raised disabled:opacity-40 [&>svg]:size-4"
    >
      {children}
    </motion.button>
  );
}
