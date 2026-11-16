import { useId, useLayoutEffect, useMemo, useRef, type ReactNode, type RefObject } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type StampTrailItem = {
  id: string;
  /** Read around the seal's edge, e.g. "Qdrant · Multi-Vector Search · 2026". It repeats to close the ring. */
  ring: string;
  /** The seal's centre: a score, a year, a short mark. */
  mark: ReactNode;
  /** How much of the inner ring is inked, 0 to 1 (a score of 92% is 0.92). Leave out for a full ring. */
  fill?: number;
  /** Everything beside the seal: its heading, details and links. */
  content: ReactNode;
};

/** Text used by StampTrail. Pass a partial via `labels` to translate or reword. */
export interface StampTrailLabels {
  /** The button that reveals the rest, given how many are hidden. */
  more: (hidden: number) => string;
  /** The button that folds them away again. */
  less: string;
}
export const stampTrailLabels: StampTrailLabels = { more: (n) => `Show ${n} more`, less: "Show fewer" };

export type StampTrailProps = {
  items: StampTrailItem[];
  /** How many show before "Show more". Default 2. Pass `items.length` to show them all. */
  initialCount?: number;
  /** Seal diameter in px on wide screens; phones get four fifths. Default 176. */
  size?: number;
  /** Swap the seal's side on every other row (wide screens). Default true. */
  alternate?: boolean;
  /** Whether the rest are shown; leave out to let the trail keep it. */
  open?: boolean;
  /** Starting state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** The scrolling element, when it isn't the page. */
  container?: RefObject<HTMLElement | null>;
  className?: string;
  /** Override any UI text. Merged over `stampTrailLabels`. */
  labels?: Partial<StampTrailLabels>;
};

/**
 * Credentials as seals pressed into the page as you scroll. Each row is a round
 * seal (its words run round the edge, its mark sits in the middle and an inked
 * ring shows how much of it is filled) beside its details. As a row comes up the
 * screen its seal comes down out of the air, turns square and presses in; the
 * ring inks itself; and the seal drifts at its own depth against the text, so a
 * long list still reads as one parallax trail. Only the first `initialCount` show
 * until "Show more", which carries the trail on with the rest.
 *
 * Every row keeps its height from the start, the motion is transform and opacity
 * tied to scroll, and with reduced motion every seal is simply pressed.
 */
export function StampTrail({ items, initialCount = 2, size = 176, alternate = true, open: openProp, defaultOpen = false, onOpenChange, container, className, labels }: StampTrailProps) {
  const l = useMemo(() => ({ ...stampTrailLabels, ...labels }), [labels]);
  const reduce = usePrefersReducedMotion();
  const listId = useId();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const hidden = Math.max(0, items.length - initialCount);
  const shown = open || hidden === 0 ? items : items.slice(0, initialCount);

  const toggle = useRef<HTMLButtonElement>(null);
  const rows = useRef<(HTMLLIElement | null)[]>([]);
  // Folding the rows away shortens the page above the button; keep the button where the reader is.
  const keep = useRef<number | null>(null);
  const firstNew = useRef<number | null>(null);
  useLayoutEffect(() => {
    if (keep.current != null && toggle.current) {
      const now = toggle.current.getBoundingClientRect().top;
      const delta = now - keep.current;
      if (delta) (container?.current ?? window).scrollBy({ top: delta, behavior: "instant" as ScrollBehavior });
      keep.current = null;
    }
    if (firstNew.current != null) {
      rows.current[firstNew.current]?.focus({ preventScroll: true });
      firstNew.current = null;
    }
  }, [open, container]);

  const flip = () => {
    if (open) keep.current = toggle.current?.getBoundingClientRect().top ?? null;
    else firstNew.current = initialCount;
    setOpen(!open);
  };

  return (
    <div className={cn("relative overflow-x-clip [overflow-clip-margin:24px]", className)}>
      <ul id={listId} className="flex flex-col gap-16 md:gap-24">
        {shown.map((item, i) => (
          <Row
            key={item.id}
            ref={(el) => void (rows.current[i] = el)}
            item={item}
            size={size}
            flip={alternate && i % 2 === 1}
            reduce={reduce}
            container={container}
          />
        ))}
      </ul>
      {hidden > 0 && (
        <div className="mt-14 flex md:mt-20 md:justify-center">
          <button
            ref={toggle}
            type="button"
            aria-expanded={open}
            aria-controls={listId}
            onClick={flip}
            className="inline-flex h-11 items-center rounded-full bg-raised px-5 text-[15px] font-medium text-ink transition-colors duration-200 hover:bg-active focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {open ? l.less : l.more(hidden)}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({
  item, size, flip, reduce, container, ref,
}: {
  item: StampTrailItem; size: number; flip: boolean; reduce: boolean;
  container?: RefObject<HTMLElement | null>; ref: (el: HTMLLIElement | null) => void;
}) {
  const box = useRef<HTMLLIElement | null>(null);
  // The press: from the row's top at the foot of the screen to just above the middle.
  const { scrollYProgress: p } = useScroll({ target: box, container, offset: ["start 0.95", "start 0.4"] });
  // The drift: the whole time the row is on screen, the seal moves against the text.
  const { scrollYProgress: pass } = useScroll({ target: box, container, offset: ["start end", "end start"] });

  const still = (v: number) => [v, v];
  const scale = useTransform(p, [0, 0.72, 0.86, 1], reduce ? [1, 1, 1, 1] : [1.5, 1, 0.95, 1]);
  const rotate = useTransform(p, [0, 0.8], reduce ? still(0) : [-24, 0]);
  const sealOpacity = useTransform(p, [0, 0.4], reduce ? still(1) : [0, 1]);
  const drift = useTransform(pass, [0, 1], reduce ? still(0) : [48, -48]);
  const ink = useTransform(p, [0.7, 1], reduce ? still(1) : [0, 1]);
  const textOpacity = useTransform(p, [0.45, 0.85], reduce ? still(1) : [0, 1]);
  const textY = useTransform(p, [0.45, 0.85], reduce ? still(0) : [20, 0]);

  return (
    <li
      ref={(el) => {
        box.current = el;
        ref(el);
      }}
      tabIndex={-1}
      className={cn(
        "grid items-center gap-x-12 gap-y-6 outline-none md:grid-cols-[auto_minmax(0,1fr)]",
        flip && "md:grid-cols-[minmax(0,1fr)_auto] md:[&>*:first-child]:order-2",
      )}
    >
      <motion.div style={{ y: drift }} className={cn("justify-self-start", flip && "md:justify-self-end")}>
        <motion.div style={{ scale, rotate, opacity: sealOpacity }}>
          <Seal item={item} size={size} ink={ink} />
        </motion.div>
      </motion.div>
      <motion.div style={{ opacity: textOpacity, y: textY }} className="min-w-0">
        {item.content}
      </motion.div>
    </li>
  );
}

const R_TEXT = 84;
const R_RING = 66;
const CIRC_TEXT = 2 * Math.PI * R_TEXT;

function Seal({ item, size, ink }: { item: StampTrailItem; size: number; ink: MotionValue<number> }) {
  const path = useId().replace(/:/g, "");
  const fill = Math.max(0, Math.min(1, item.fill ?? 1));
  const length = useTransform(ink, (v) => v * fill);
  // Repeat the words until they roughly close the ring, then let textLength space them evenly.
  const unit = `${item.ring} · `;
  const repeats = Math.max(1, Math.round(CIRC_TEXT / (unit.length * 8.5)));
  const words = unit.repeat(repeats);

  return (
    <div
      className="relative grid aspect-square place-items-center"
      style={{ width: `clamp(${Math.round(size * 0.8)}px, 30vw, ${size}px)` }}
    >
      <svg viewBox="0 0 200 200" aria-hidden className="absolute inset-0 size-full overflow-visible">
        <circle cx="100" cy="100" r="98" className="fill-surface" />
        <defs>
          <path id={path} d={`M100,${100 - R_TEXT} a${R_TEXT},${R_TEXT} 0 1,1 0,${2 * R_TEXT} a${R_TEXT},${R_TEXT} 0 1,1 0,${-2 * R_TEXT}`} />
        </defs>
        <text className="fill-muted" style={{ fontSize: 16, fontWeight: 500 }}>
          <textPath href={`#${path}`} textLength={CIRC_TEXT - 4} lengthAdjust="spacing">
            {words}
          </textPath>
        </text>
        <circle cx="100" cy="100" r={R_RING} fill="none" strokeWidth="7" className="stroke-active" />
        <motion.circle
          cx="100"
          cy="100"
          r={R_RING}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          className="stroke-accent"
          transform="rotate(-90 100 100)"
          style={{ pathLength: length }}
        />
      </svg>
      <div className="relative grid place-items-center text-center text-ink">{item.mark}</div>
    </div>
  );
}
