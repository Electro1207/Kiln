import { forwardRef, useEffect, useId, useLayoutEffect, useRef, useState, type HTMLAttributes, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { cn } from "../../cn";
import { springFirm, springSnappy } from "../../motion";
import { useControllable } from "../../controllable";

/** Text used by Slider. Pass a partial via `labels` to translate or reword. */
export interface SliderLabels {
  /** aria-label of the lower thumb of a range. */
  minimum: string;
  /** aria-label of the upper thumb of a range. */
  maximum: string;
}
export const sliderLabels: SliderLabels = { minimum: "Minimum", maximum: "Maximum" };

/** Thumb diameter. Thumbs travel inside the track, so their edges line up with the label above. */
const T = 20;

/**
 * One value, or a range when `value` has two numbers. Thumbs glide when the
 * value jumps (a click on the track, a key) and track the finger 1:1 while dragged.
 */
export function Slider({
  value: valueProp, defaultValue, onChange: onChangeProp, min = 0, max = 100, step = 1, label, ariaLabel, format = (n) => String(n), className, showTicks, labels,
}: {
  /** Controlled value: one number, or two for a range. Leave out and use `defaultValue` to let it keep its own. */
  value?: number[];
  /** Starting value when uncontrolled. Defaults to `[min]`. */
  defaultValue?: number[];
  onChange?: (v: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Visible label; the current value shows beside it. */
  label?: string;
  /** Accessible name when there is no visible `label`. */
  ariaLabel?: string;
  /** How a value is written in the label and bubble, e.g. `(n) => `${n}%``. */
  format?: (n: number) => string;
  /** Root. Set a width here; the default fills its container. */
  className?: string;
  showTicks?: boolean;
  /** Override any UI text. Merged over `sliderLabels`. */
  labels?: Partial<SliderLabels>;
}) {
  const l = { ...sliderLabels, ...labels };
  const [value, onChange] = useControllable(valueProp, defaultValue ?? [min], onChangeProp);
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const width = useMotionValue(0);
  const [drag, setDrag] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const thumbs = useRef<(HTMLDivElement | null)[]>([]);
  const range = value.length > 1;

  const toPct = (v: number) => ((v - min) / (max - min)) * 100;
  const p0 = useMotionValue(toPct(value[0]));
  const p1 = useMotionValue(toPct(value[1] ?? value[0]));
  const pcts = [p0, p1];

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(() => width.set(el.clientWidth));
    ro.observe(el);
    width.set(el.clientWidth);
    return () => ro.disconnect();
  }, [width]);

  useEffect(() => {
    value.forEach((v, i) => {
      const mv = pcts[i];
      // While dragging, follow the pointer with jump(): it records no velocity, so the
      // spring that runs after release can never inherit a fling and overshoot.
      if (drag === i) mv.jump(toPct(v));
      else animate(mv, toPct(v), springFirm);
    });
  }, [value[0], value[1], drag]);

  const fillLeft = useTransform(() => (range ? p0.get() : 0));
  const fillRight = useTransform(() => (range ? p1.get() : p0.get()));
  const centre = (p: number) => T / 2 + (p / 100) * Math.max(0, width.get() - T);
  const fillX = useTransform(() => (range ? centre(fillLeft.get()) : 0));
  const fillScale = useTransform(() => (width.get() ? Math.max(0, centre(fillRight.get()) - (range ? centre(fillLeft.get()) : 0)) / width.get() : 0));

  const snap = (v: number) => {
    const s = Math.round((v - min) / step) * step + min;
    return Math.min(max, Math.max(min, Number(s.toFixed(6))));
  };
  const fromClient = (x: number) => {
    const r = track.current!.getBoundingClientRect();
    return snap(min + ((x - r.left - T / 2) / Math.max(1, r.width - T)) * (max - min));
  };
  const setAt = (i: number, v: number) => {
    const next = [...value];
    if (range) {
      if (i === 0) v = Math.min(v, value[1]);
      else v = Math.max(v, value[0]);
    }
    next[i] = v;
    if (next.some((n, k) => n !== value[k])) onChange(next);
  };

  const pressed = useRef<number | null>(null);
  const onDown = (e: RPointerEvent) => {
    if (e.button !== 0) return;
    const v = fromClient(e.clientX);
    const i = range ? (Math.abs(v - value[0]) <= Math.abs(v - value[1]) ? (v > value[1] ? 1 : 0) : 1) : 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pressed.current = i;
    setAt(i, v);
    // A pointer press focuses the thumb for the keyboard, without the keyboard focus ring.
    thumbs.current[i]?.focus({ preventScroll: true, focusVisible: false } as FocusOptions);
  };
  const onMove = (e: RPointerEvent) => {
    const i = pressed.current;
    if (i === null) return;
    if (drag !== i) {
      // Hand over from the glide to the finger without a jump.
      pcts[i].stop();
      setDrag(i);
    }
    setAt(i, fromClient(e.clientX));
  };
  const onUp = () => { pressed.current = null; setDrag(null); };

  const onKey = (e: KeyboardEvent, i: number) => {
    const big = Math.max(step, (max - min) / 10);
    const map: Record<string, number> = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, PageUp: big, PageDown: -big };
    if (e.key in map) { e.preventDefault(); setAt(i, snap(value[i] + map[e.key])); }
    else if (e.key === "Home") { e.preventDefault(); setAt(i, min); }
    else if (e.key === "End") { e.preventDefault(); setAt(i, max); }
  };

  const ticks = showTicks ? Array.from({ length: Math.round((max - min) / step) + 1 }, (_, k) => k) : [];

  return (
    <div className={cn("k-fill flex flex-col gap-3", className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-3">
          <span id={`${id}-l`} className="text-sm font-medium text-ink">{label}</span>
          <span className="text-sm text-muted tabular">{value.map(format).join(" – ")}</span>
        </div>
      )}
      <div
        ref={track}
        className="relative h-6 touch-none select-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-active">
          <motion.div className="h-full w-full origin-left bg-btn-primary" style={{ x: fillX, scaleX: fillScale }} />
        </div>
        {ticks.length > 0 && ticks.length <= 21 && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2" aria-hidden>
            {ticks.map((k) => (
              <span key={k} className="absolute top-0 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface/70" style={{ left: `calc(${T / 2}px + ${k / (ticks.length - 1)} * (100% - ${T}px))` }} />
            ))}
          </div>
        )}
        {value.map((v, i) => (
          <Thumb
            key={i}
            ref={(el) => { thumbs.current[i] = el; }}
            pct={pcts[i]}
            width={width}
            active={drag === i}
            showBubble={drag === i || focus === i}
            text={format(v)}
            aria-labelledby={label ? `${id}-l` : undefined}
            aria-label={range ? (i === 0 ? l.minimum : l.maximum) : label ? undefined : ariaLabel}
            aria-valuemin={range && i === 1 ? value[0] : min}
            aria-valuemax={range && i === 0 ? value[1] : max}
            aria-valuenow={v}
            aria-valuetext={format(v)}
            onKeyDown={(e) => onKey(e, i)}
            onFocus={() => setFocus(i)}
            onBlur={() => setFocus((f) => (f === i ? null : f))}
          />
        ))}
      </div>
    </div>
  );
}

const Thumb = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & {
  pct: MotionValue<number>; width: MotionValue<number>; active: boolean; showBubble: boolean; text: string;
  "aria-valuemin": number; "aria-valuemax": number; "aria-valuenow": number;
}>(function Thumb({ pct, width, active, showBubble, text, ...aria }, ref) {
  const x = useTransform(() => (pct.get() / 100) * Math.max(0, width.get() - T));
  return (
    <motion.div style={{ x }} className="absolute left-0 top-1/2 -mt-2.5 size-5">
      <div ref={ref} role="slider" tabIndex={0} {...aria} className="size-5 cursor-grab rounded-full outline-offset-2 active:cursor-grabbing">
        <motion.span
          animate={{ scale: active ? 1.15 : 1 }}
          transition={springSnappy}
          className="block size-5 rounded-full border-[5px] border-btn-primary bg-surface"
        />
      </div>
      <AnimatePresence>
        {showBubble && (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={springSnappy}
            className="pointer-events-none absolute bottom-full left-1/2 mb-2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs font-medium text-surface tabular"
            style={{ x: "-50%" }}
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
