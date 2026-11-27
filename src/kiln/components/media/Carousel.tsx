import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, type PanInfo } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { springFirm, springSnappy } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

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
  /** aria-label of the pause button (shown while it autoplays). */
  pause: string;
  /** aria-label of the play button (shown while it is paused). */
  play: string;
}
export const carouselLabels: CarouselLabels = {
  slideOf: (i, n) => `${i} of ${n}`,
  chooseSlide: "Choose slide",
  goToSlide: (i) => `Go to slide ${i}`,
  previous: "Previous slide",
  next: "Next slide",
  announce: (i, n) => `Slide ${i} of ${n}`,
  pause: "Pause slideshow",
  play: "Start slideshow",
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
  /**
   * ms between automatic advances; leave out for no autoplay. It stops while the pointer or focus is
   * on the carousel, never runs under `calm` or `reduceMotion`, and shows a pause button (WCAG 2.2.2).
   */
  autoPlay?: number;
  /** Override any UI text. Merged over `carouselLabels`. */
  labels?: Partial<CarouselLabels>;
  /** Replace any built-in icon. Merged over `carouselIcons`. */
  icons?: Partial<CarouselIcons>;
  className?: string;
  /** Accessibility features to add here. `calm` and `reduceMotion` turn autoplay off; `screenReaderHints` keeps the pause button always visible. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** Drag with momentum, snaps to a slide, arrows and keyboard too. */
/** Icons used by Carousel. Pass a partial via `icons` to swap any of them. */
export interface CarouselIcons {
  /** Previous slide button. */
  previous: ReactNode;
  /** Next slide button. */
  next: ReactNode;
  /** Pause button. */
  pause: ReactNode;
  /** Play button. */
  play: ReactNode;
}
export const carouselIcons: CarouselIcons = { previous: <ChevronLeft />, next: <ChevronRight />, pause: <Pause />, play: <Play /> };

export function Carousel({ slides, label, value, defaultValue = 0, onChange, perView = 2, gap = 16, autoPlay, labels, icons, className, accessibilityFeatures }: CarouselProps) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const canPlay = autoPlay !== undefined && !a11y.reduceMotion && !a11y.calm;
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

  // Autoplay: one timer per slide, restarted by any change of slide, paused by hover, focus or the button.
  const goRef = useRef(go);
  useLayoutEffect(() => {
    goRef.current = go;
  });
  const running = canPlay && !paused && !held;
  useEffect(() => {
    if (!running || !autoPlay) return;
    const t = window.setTimeout(() => goRef.current(index >= maxIndex ? 0 : index + 1), autoPlay);
    return () => window.clearTimeout(t);
  }, [running, autoPlay, index, maxIndex]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const projected = x.get() + info.velocity.x * 0.18;
    go(Math.round(-projected / stride), info.velocity.x);
    window.setTimeout(() => (dragging.current = false), 0);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      {...rootProps}
      className={cn("flex w-full min-w-0 flex-col gap-4", className)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node | null) && setHeld(false)}
    >
      <div className="group/car relative">
      <div
        ref={viewport}
        // inline-size containment: the slides (sized from this width) can never widen it, which in a
        // content-sized parent (a wrapping flex column, a grid auto track) grew it without end.
        className="overflow-hidden rounded-card outline-offset-4 [contain:inline-size]"
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
      {canPlay && (
        // Its own layer over the corner of the slides: fades in, never moves anything.
        <button
          type="button"
          aria-label={paused ? l.play : l.pause}
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
          className={cn(
            "absolute right-2 top-2 z-10 grid size-8 place-items-center rounded-full border border-line-strong bg-surface text-ink shadow-float",
            "transition-opacity duration-200 hover:bg-raised [&>svg]:size-4",
            a11y.screenReaderHints
              ? "opacity-100"
              : "opacity-0 focus-visible:opacity-100 group-focus-within/car:opacity-100 group-hover/car:opacity-100",
          )}
        >
          {paused ? ic.play : ic.pause}
        </button>
      )}
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
              className="grid h-6 w-5 place-items-center"
            >
              {/* The active dot is a 20px pill drawn at full scale; the others shrink by transform (no width tween). */}
              <motion.span
                className={cn("block h-1.5 w-5 rounded-full transition-colors duration-300", i === index ? "bg-ink" : "bg-line-strong")}
                initial={false}
                animate={{ scaleX: i === index ? 1 : 0.3 }}
                transition={a11y.calm || a11y.reduceMotion ? { duration: 0 } : springFirm}
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
      <span id={uid} className="sr-only" aria-live={running ? "off" : "polite"}>
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
