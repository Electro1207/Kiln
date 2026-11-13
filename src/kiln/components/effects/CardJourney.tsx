import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { cn } from "../../cn";
import { useLoop, usePrefersReducedMotion } from "../shared/useLoop";

/** One stop on the journey: what the card shows there, and where it rests. */
export type JourneyStop = {
  /** Anchor id: a link to `#id`, or scrolling the element with this id into view, lands on this stop. */
  id: string;
  /** Short name, for navigation and for screen readers. */
  label: string;
  /** One line on what this stop covers, for previews such as ScrollCheckpoints. */
  summary?: ReactNode;
  /**
   * The card's face at this stop. A function gets `active` (this is the stop nearest the card) and
   * `moving` (the card is between stops, turning). Video is best swapped for a still while `moving`:
   * browsers clip video layers unreliably inside a 3D turn. Keep the player mounted so playback carries on.
   */
  content: ReactNode | ((state: { active: boolean; moving: boolean }) => ReactNode);
  /** Shown beside the card on wide screens (behind it on narrow ones); it rises in and leaves faster than the card moves. */
  aside?: ReactNode;
  /** Where the card rests on wide screens. Its aside takes the other side. Default "center". */
  side?: "left" | "center" | "right";
};

export type CardJourneyProps = {
  stops: JourneyStop[];
  /** Scroll from one stop to the next, in viewport heights. Default 1.2. */
  length?: number;
  /** Share of each step the card rests before it moves on, 0 to 0.9. Default 0.45. */
  hold?: number;
  /** Axis the card spins on as it changes face. "none" cross-fades in place. Default "y". */
  spin?: "y" | "x" | "none";
  /** Half-turns per change: 1 flips once, 3 spins one and a half times. Odd numbers only. Default 1. */
  turns?: 1 | 3 | 5;
  /** How far left or right a side stop rests, as a share of the stage's width. Default 0.22. */
  offset?: number;
  /**
   * Degrees a side stop leans at rest. Default 0: upright, which keeps a video and fine text on the card
   * sharp and correctly clipped in every browser (Firefox misplaces video inside a rotated, rounded box).
   */
  lean?: number;
  /** How far it bobs at rest, in px. 0 keeps it still. A face showing a video always holds still. Default 8. */
  float?: number;
  /**
   * The scrolling element, when it isn't the page. Set `--journey-vh` on it to 1% of
   * its height (e.g. `4.8px` for a 480px box) so the stage fills it.
   */
  container?: RefObject<HTMLElement | null>;
  /** Behind everything in the pinned stage. Read the journey's progress inside it with `useJourney()`. */
  backdrop?: ReactNode;
  /** Above the asides and below the card: for things people use, such as floating controls, so no aside covers them. `useJourney()` works here too. */
  foreground?: ReactNode;
  /** Called with the index of the stop nearest the card as it changes. */
  onStopChange?: (index: number) => void;
  /** Classes for the tall outer section. */
  className?: string;
  /** Classes for the card's surface: background, border, radius, padding. */
  cardClassName?: string;
  /** Size of the card. Default `w-[min(90vw,720px)] h-[min(76vh,540px)]`. */
  sizeClassName?: string;
  "aria-label"?: string;
};

type JourneyState = { progress: MotionValue<number>; count: number };
const JourneyContext = createContext<JourneyState | null>(null);

/**
 * Inside a CardJourney's `backdrop` or a stop's content: `progress` runs from 0 at
 * the first stop to `count - 1` at the last, smoothed, so layers can drift with it.
 */
export function useJourney(): JourneyState | null {
  return useContext(JourneyContext);
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

function useWide(query = "(min-width: 1024px)") {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setWide(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return wide;
}

/**
 * One card carries a whole page. The section pins a stage while you scroll; at
 * each stop the card rests, floating, showing that stop's face. Between stops it
 * lifts, spins and glides to its next place, and the new face is on the other
 * side when it lands. Each stop's aside rises in beside it and leaves faster
 * than the card moves, for depth. Every stop has a real anchor, so links and
 * `scrollIntoView` travel the same path. Scroll-linked transforms only, smoothed
 * by a spring; with reduced motion the card stays put and changes face in place.
 * Only the face being shown is interactive. At rest the card lies flat, so a video on it plays as
 * smoothly as anywhere else.
 */
export function CardJourney({
  stops, container, length = 1.2, hold = 0.45, spin = "y", turns = 1, offset = 0.22, lean = 0, float = 8,
  backdrop, foreground, onStopChange, className, cardClassName, sizeClassName = "w-[min(90vw,720px)] h-[min(76vh,540px)]", "aria-label": ariaLabel,
}: CardJourneyProps) {
  const root = useRef<HTMLElement>(null);
  const bob = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const wide = useWide();
  const n = stops.length;
  const last = Math.max(0, n - 1);
  const h = Math.min(0.9, Math.max(0, hold));

  const { scrollYProgress } = useScroll({ target: root, container, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, (p) => p * last);
  const smooth = useSpring(raw, { stiffness: 170, damping: 32, mass: 0.6, restDelta: 0.0005 });
  const f = reduce ? raw : smooth;

  // Where the step stands: resting at stop r (t = 0), or travelling from a to a + 1 (eased t).
  const at = (v: number) => {
    const c = Math.min(last, Math.max(0, v));
    const r = Math.round(c);
    if (Math.abs(c - r) <= h / 2 || last === 0) return { a: r, b: r, t: 0, arc: 0 };
    const a = Math.floor(c);
    const t = Math.min(1, Math.max(0, (c - a - h / 2) / (1 - h)));
    return { a, b: a + 1, t: ease(t), arc: Math.sin(Math.PI * t) };
  };
  const sideOf = (i: number) => (wide ? stops[i]?.side ?? "center" : "center");
  const xOf = (i: number) => ({ left: -offset * 100, center: 0, right: offset * 100 })[sideOf(i)];
  const tiltOf = (i: number) => ({ left: -lean, center: 0, right: lean })[sideOf(i)];
  const turn = 180 * turns;

  const x = useTransform(f, (v) => { const s = at(v); return `${xOf(s.a) + (xOf(s.b) - xOf(s.a)) * s.t}%`; });
  const y = useTransform(f, (v) => `${-7 * at(v).arc}%`);
  const scale = useTransform(f, (v) => 1 - 0.16 * at(v).arc);
  const rotateZ = useTransform(f, (v) => { const s = at(v); return tiltOf(s.a) + (tiltOf(s.b) - tiltOf(s.a)) * s.t + (s.b > s.a ? 5 * s.arc : 0); });

  // The spin. At rest the card is laid flat (no 3D transform, only the face being shown), so a video or
  // fine text on it composites like any flat layer. Faces and spin are written in the same frame, so
  // the switch between flat and 3D never shows.
  const rotate = useMotionValue(0);
  const spinner = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const faces = useRef<(HTMLDivElement | null)[]>([]);
  const axis = spin === "x" ? "rotateX" : "rotateY";
  const lay = (v: number) => {
    const s = at(v);
    const rest = s.t === 0;
    rotate.set(rest ? 0 : (s.a + (s.b - s.a) * s.t) * turn);
    if (spinner.current) spinner.current.style.transformStyle = rest ? "flat" : "preserve-3d";
    // Safari stops drawing a video under perspective or a hidden backface, so both go at rest.
    if (stage.current) stage.current.style.perspective = rest ? "none" : "1600px";
    const r = Math.round(Math.min(last, Math.max(0, v)));
    faces.current.forEach((el, k) => {
      if (!el) return;
      el.style.transform = rest || !k ? "none" : `${axis}(180deg)`;
      el.style.visibility = rest && k !== r % 2 ? "hidden" : "visible";
      el.style.backfaceVisibility = el.style.webkitBackfaceVisibility = rest ? "visible" : "hidden";
    });
  };

  // Which stops sit on the two faces, and which one is being shown.
  const [pair, setPair] = useState(0);
  const [near, setNear] = useState(0);
  const [moving, setMoving] = useState(false);
  const changed = useRef(onStopChange);
  useLayoutEffect(() => { changed.current = onStopChange; });
  useLayoutEffect(() => lay(f.get()));
  useMotionValueEvent(f, "change", (v) => {
    lay(v);
    const c = Math.min(last, Math.max(0, v));
    setPair(Math.min(Math.max(0, last - 1), Math.floor(c)));
    setNear(Math.round(c));
    setMoving(at(v).t !== 0);
  });
  useEffect(() => { changed.current?.(near); }, [near]);

  // A face showing a video holds still: Firefox can leave a video's picture behind while its card bobs.
  const [hasVideo, setHasVideo] = useState(false);
  useEffect(() => {
    const sp = spinner.current;
    if (!sp) return;
    let last = false;
    const check = () => {
      const now = [...sp.children].some((face) => face.getAttribute("aria-hidden") !== "true" && !!face.querySelector("video"));
      if (now !== last) setHasVideo((last = now));
    };
    check();
    const mo = new MutationObserver(check);
    mo.observe(sp, { childList: true, subtree: true, attributes: true, attributeFilter: ["aria-hidden"] });
    return () => mo.disconnect();
  }, []);

  useLoop(
    root,
    () => {
      const el = bob.current;
      if (!el || !float || reduce || hasVideo) return [];
      return [el.animate(
        [{ transform: "translate3d(0,0,0)" }, { transform: `translate3d(0,${-float}px,0)` }, { transform: "translate3d(0,0,0)" }],
        { duration: 6000, iterations: Infinity, easing: "ease-in-out" },
      )];
    },
    [float, reduce, hasVideo],
  );

  const front = pair % 2 === 0 ? pair : pair + 1;
  const back = pair % 2 === 0 ? pair + 1 : pair;
  const flat = reduce || spin === "none";
  const render = (i: number) => {
    const s = stops[i];
    if (!s) return null;
    return typeof s.content === "function" ? s.content({ active: i === near, moving: !flat && moving }) : s.content;
  };
  const ctx = useMemo(() => ({ progress: f, count: n }), [f, n]);
  const card = cn("absolute inset-0 overflow-hidden rounded-sheet border border-line bg-surface shadow-float", cardClassName);

  return (
    <section
      ref={root}
      aria-label={ariaLabel}
      className={cn("relative", className)}
      style={{ height: `calc(var(--journey-vh, 1vh) * ${last * length * 100 + 100})` }}
    >
      {stops.map((s, i) => (
        <div key={s.id} id={s.id} aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: `calc(var(--journey-vh, 1vh) * ${i * length * 100})` }} />
      ))}
      <JourneyContext.Provider value={ctx}>
        <div className="sticky top-0 h-[calc(var(--journey-vh,1vh)*100)] overflow-clip">
          {backdrop && <div className="absolute inset-0">{backdrop}</div>}
          {stops.map((s, i) => s.aside && (
            <Aside key={s.id} f={f} i={i} hold={h} side={sideOf(i)} reduce={reduce}>{s.aside}</Aside>
          ))}
          {foreground && <div className="pointer-events-none absolute inset-0">{foreground}</div>}
          <motion.div ref={stage} style={flat ? undefined : { x, y, scale, rotate: rotateZ }} className="pointer-events-none absolute inset-0 grid place-items-center will-change-transform">
            <div ref={bob} className="grid size-full place-items-center will-change-transform">
              <motion.div
                style={flat ? undefined : spin === "x" ? { rotateX: rotate } : { rotateY: rotate }}
                ref={spinner}
                className={cn("relative [transform-style:preserve-3d]", sizeClassName)}
              >
                {flat ? (
                  <div className={cn(card, "pointer-events-auto")}>
                    <motion.div key={near} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="size-full">
                      {render(near)}
                    </motion.div>
                  </div>
                ) : (
                  [front, back].map((i, k) => (
                    <div
                      key={k}
                      ref={(el) => { faces.current[k] = el; }}
                      inert={i !== near}
                      aria-hidden={i !== near}
                      className={cn(card, i === near ? "pointer-events-auto" : "pointer-events-none")}
                    >
                      {render(i)}
                    </div>
                  ))
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </JourneyContext.Provider>
    </section>
  );
}

function Aside({ f, i, hold, side, reduce, children }: { f: MotionValue<number>; i: number; hold: number; side: "left" | "center" | "right"; reduce: boolean; children: ReactNode }) {
  const span = 0.5 + hold / 2;
  const range = [i - span, i - hold / 2, i + hold / 2, i + span];
  const opacity = useTransform(f, range, [0, 1, 1, 0]);
  const y = useTransform(f, range, reduce ? ["0%", "0%", "0%", "0%"] : ["38%", "0%", "0%", "-38%"]);
  const [shown, setShown] = useState(false);
  useMotionValueEvent(opacity, "change", (o) => setShown(o > 0.02));
  const place = side === "left" ? "right-0 w-1/2 justify-items-start" : side === "right" ? "left-0 w-1/2 justify-items-end" : "inset-x-0 justify-items-center";
  return (
    <motion.div
      style={{ opacity, y }}
      inert={!shown}
      aria-hidden={!shown}
      className={cn("pointer-events-none absolute inset-y-0 grid items-center px-[6vw] will-change-[opacity,transform]", place)}
    >
      {/* Only the content takes the pointer, so whatever sits behind the empty half stays reachable. */}
      <div className={side !== "center" && shown ? "pointer-events-auto" : undefined}>{children}</div>
    </motion.div>
  );
}
