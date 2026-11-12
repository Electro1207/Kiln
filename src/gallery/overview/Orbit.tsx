import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { categories } from "../registry";
import { TextAnimate } from "../../kiln/components/text-effects/TextAnimate";
import { easeOut, springSoft } from "../../kiln/motion";
import { entryHref, useSheet } from "./sheet";
import { PIECES } from "./pieces";

/* "The library, in orbit": live Kiln components float at different depths in a slowly turning
   constellation. Deeper cards drift and parallax less. Every couple of seconds one card turns over
   to another component, so the scene works through the whole library; in between, one card at a time
   gets a new prop and animates itself.

   Cost: one animation loop writes a single clock (a MotionValue); every card's x, y and tilt are
   derived from it with useTransform. Only transform and opacity move. React state changes only on a
   swap or a tick, and only inside the one card concerned. The loop is unmounted when the scene is
   off-screen or the tab is hidden. */

type Slot = { x: number; y: number; d: number; rz: number; kind: "y" | "x" | "turn" };

/* x, y: centre as a percentage of the stage. d: depth, 0 far to 1 near. */
const WIDE: Slot[] = [
  { x: 12, y: 41, d: 0.25, rz: -4, kind: "y" },
  { x: 37, y: 39, d: 0.55, rz: 2, kind: "x" },
  { x: 63, y: 41, d: 0.35, rz: -2, kind: "turn" },
  { x: 88, y: 39, d: 0.2, rz: 4, kind: "y" },
  { x: 23, y: 59, d: 0.85, rz: 2, kind: "y" },
  { x: 50, y: 58, d: 1, rz: -2, kind: "x" },
  { x: 77, y: 60, d: 0.8, rz: 3, kind: "turn" },
  { x: 10, y: 80, d: 0.45, rz: 3, kind: "x" },
  { x: 36, y: 80, d: 0.3, rz: -3, kind: "y" },
  { x: 63, y: 81, d: 0.65, rz: 2, kind: "turn" },
  { x: 90, y: 79, d: 0.5, rz: -4, kind: "x" },
];
const MID: Slot[] = [
  { x: 18, y: 40, d: 0.3, rz: -3, kind: "y" },
  { x: 50, y: 38, d: 0.6, rz: 2, kind: "x" },
  { x: 82, y: 40, d: 0.25, rz: 3, kind: "turn" },
  { x: 27, y: 61, d: 0.9, rz: 2, kind: "y" },
  { x: 73, y: 61, d: 0.8, rz: -2, kind: "x" },
  { x: 18, y: 81, d: 0.5, rz: 3, kind: "turn" },
  { x: 50, y: 81, d: 0.35, rz: -3, kind: "y" },
  { x: 82, y: 81, d: 0.55, rz: 3, kind: "x" },
];
/* Tablet: two staggered columns, six cards. */
const TABLET: Slot[] = [
  { x: 30, y: 33, d: 0.3, rz: -3, kind: "y" },
  { x: 70, y: 41, d: 0.6, rz: 2, kind: "x" },
  { x: 30, y: 57, d: 0.8, rz: 2, kind: "turn" },
  { x: 70, y: 65, d: 0.4, rz: -2, kind: "y" },
  { x: 30, y: 80, d: 0.5, rz: 3, kind: "x" },
  { x: 70, y: 87, d: 0.25, rz: -3, kind: "turn" },
];
/* Phone: one staggered column. Every card keeps the 16px gutter (see PHONE below). */
const NARROW: Slot[] = [
  { x: 35, y: 36, d: 0.3, rz: -3, kind: "y" },
  { x: 65, y: 53, d: 0.6, rz: 2, kind: "x" },
  { x: 35, y: 70, d: 0.45, rz: 2, kind: "turn" },
  { x: 65, y: 87, d: 0.2, rz: -3, kind: "y" },
];
/* Phone motion is clamped so drift never carries a card past the stage edge. */
const PHONE = { x: 0.45, y: 0.5, scroll: 0.15, base: 0.86, zr: 0.1 };
const TABLET_AMP = { x: 0.5, y: 0.6, scroll: 0.2, base: 0.88, zr: 0.1 };
const MID_AMP = { x: 0.5, y: 0.7, scroll: 0.4, base: 0.74, zr: 0.14 };
const FULL = { x: 1, y: 1, scroll: 1, base: 0.84, zr: 0.3 };
type Amp = typeof FULL;
/* Too tall for a phone card's slot (the donut is ~390px): they stay on the larger layouts. */
const TALL = ["donut", "line-chart"];

function useMatch(query: string) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}

function usePageVisible() {
  const [v, setV] = useState(() => typeof document === "undefined" || !document.hidden);
  useEffect(() => {
    const on = () => setV(!document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);
  return v;
}

/** Pieces that exist in the registry, with the name the gallery gives them and where they live. */
const LIVE = PIECES.flatMap((p) => {
  const to = entryHref(p.id);
  const name = categories.flatMap((c) => c.entries).find((e) => e.id === p.id)?.name;
  return to && name ? [{ ...p, to, name }] : [];
});
type Live = (typeof LIVE)[number];
const byId = new Map(LIVE.map((p) => [p.id, p]));

/** The opening hand: a spread of kinds, so the first screen is not twelve charts. */
const OPENING = ["switch", "tabs", "bar-chart", "badge", "slider", "command-palette", "rating", "avatar", "progress", "toast", "gauge", "button-group"];

type Handle = { swap: (p: Live) => void; poke: () => void };

function Face({ piece, tick, veil = 0 }: { piece: Live; tick: number; veil?: number }) {
  return (
    <div className="relative w-[208px] overflow-hidden rounded-card border border-line bg-surface shadow-float sm:w-[252px]">
      {/* Live, but not reachable: the whole card is one link, so nothing inside takes focus or clicks. */}
      <div inert aria-hidden className="pointer-events-none min-h-[88px] px-4 pb-3.5 pt-4">{piece.render(tick)}</div>
      <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[13px]">
        <a href={piece.to} className="font-medium text-ink outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-accent focus-visible:after:rounded-card">
          {piece.name}
          <span className="sr-only"> in the gallery</span>
        </a>
        <ArrowUpRight aria-hidden className="size-3.5 text-muted" />
      </div>
      {/* Distance: a veil of the ground colour over far cards. Static opacity, so no filter and no see-through overlaps. */}
      {veil > 0 && <span aria-hidden className="pointer-events-none absolute inset-0 bg-raised" style={{ opacity: veil }} />}
    </div>
  );
}

const swapVariants = {
  y: { initial: { rotateY: -78, opacity: 0 }, animate: { rotateY: 0, opacity: 1 }, exit: { rotateY: 78, opacity: 0 } },
  x: { initial: { rotateX: 74, opacity: 0 }, animate: { rotateX: 0, opacity: 1 }, exit: { rotateX: -74, opacity: 0 } },
  turn: { initial: { rotateZ: -5, scale: 0.94, opacity: 0 }, animate: { rotateZ: 0, scale: 1, opacity: 1 }, exit: { rotateZ: 5, scale: 0.96, opacity: 0 } },
};

type Scene = { t: MotionValue<number>; px: MotionValue<number>; py: MotionValue<number>; sp: MotionValue<number> };

const Card = memo(function Card({ slot, i, first, scene, register, amp }: { slot: Slot; i: number; first: Live; amp: Amp; scene: Scene; register: (i: number, h: Handle | null) => void }) {
  const [piece, setPiece] = useState(first);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    register(i, { swap: setPiece, poke: () => setTick((n) => n + 1) });
    return () => register(i, null);
  }, [register, i]);

  const { t, px, py, sp } = scene;
  const { d } = slot;
  const k = useMemo(() => ({ w: 0.42 + ((i * 37) % 11) / 40, p: i * 1.7, ry: (50 - slot.x) * 0.42, rx: (62 - slot.y) * 0.16 }), [i, slot.x, slot.y]);
  const x = useTransform([t, px], ([tt, p]: number[]) => (Math.sin(tt * k.w + k.p) * (5 + 9 * d) + p * 30 * (0.2 + d)) * amp.x);
  const y = useTransform([t, py, sp], ([tt, p, s]: number[]) => Math.cos(tt * k.w * 0.8 + k.p) * (6 + 10 * d) * amp.y + (s - 0.5) * -150 * (0.25 + d) * amp.scroll + p * 18 * (0.2 + d) * amp.y);
  const rotateY = useTransform([t, px], ([tt, p]: number[]) => k.ry + Math.sin(tt * k.w * 0.7 + k.p) * 3 + p * 4 * d);
  const rotateX = useTransform([t, py], ([tt, p]: number[]) => k.rx + Math.cos(tt * k.w * 0.6 + k.p) * 2 - p * 3);
  const rotateZ = useTransform(t, (tt) => slot.rz + Math.sin(tt * k.w * 0.5 + k.p) * 1.2);

  const v = swapVariants[slot.kind];
  return (
    <motion.div
      className="absolute"
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, translate: "-50% -50%", x, y, rotateX, rotateY, rotateZ, scale: amp.base + amp.zr * d, transformPerspective: 1000, zIndex: Math.round(d * 10) }}
    >
      <motion.div whileHover={{ scale: 1.04 }} transition={springSoft} style={{ transformPerspective: 900 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={piece.id}
            initial={v.initial}
            animate={{ ...v.animate, transition: springSoft }}
            exit={{ ...v.exit, transition: { duration: 0.2, ease: easeOut } }}
            style={{ transformPerspective: 900 }}
          >
            <Face piece={piece} tick={tick} veil={(1 - d) * 0.42} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
});

function Driver({ t }: { t: MotionValue<number> }) {
  useAnimationFrame((_, delta) => t.set(t.get() + Math.min(delta, 64) / 1000));
  return null;
}

export function Orbit({ total }: { total: number }) {
  const reduce = useReducedMotion();
  const phone = useMatch("(max-width: 639px)");
  const tablet = useMatch("(max-width: 767px)");
  const mid = useMatch("(max-width: 1199px)");
  const fine = useMatch("(hover: hover) and (pointer: fine)");
  const box = useRef<HTMLElement>(null);
  const sheet = useSheet(box);
  const inView = useInView(box, { margin: "80px" });
  const visible = usePageVisible();
  const active = inView && visible && !reduce;

  const slots = phone ? NARROW : tablet ? TABLET : mid ? MID : WIDE;
  const amp = phone ? PHONE : tablet ? TABLET_AMP : mid ? MID_AMP : FULL;
  const handles = useRef<(Handle | null)[]>([]);
  const register = useCallback((i: number, h: Handle | null) => {
    handles.current[i] = h;
  }, []);
  const t = useMotionValue(0);
  const rawX = useMotionValue(0), rawY = useMotionValue(0);
  const px = useSpring(rawX, { stiffness: 60, damping: 20, mass: 0.6 });
  const py = useSpring(rawY, { stiffness: 60, damping: 20, mass: 0.6 });
  const { scrollYProgress } = useScroll({ target: box, container: sheet, offset: ["start end", "end start"] });
  const sp = useSpring(scrollYProgress, { stiffness: 70, damping: 24, mass: 0.6 });
  const scene = useMemo(() => ({ t, px, py, sp }), [t, px, py, sp]);

  // What each slot shows to begin with, and the order the rest of the library queues up in.
  const opening = useMemo(() => {
    const first = OPENING.flatMap((id) => byId.get(id) ?? []);
    const rest = LIVE.filter((p) => !first.includes(p));
    return { first: [...first, ...rest].slice(0, WIDE.length), rest: shuffle([...LIVE]) };
  }, []);
  const shown = useRef<string[]>([]);
  useEffect(() => {
    shown.current = opening.first.map((p) => p.id);
  }, [opening]);

  useEffect(() => {
    if (!active) return;
    let n = 0, q = 0, s = 0;
    const order = shuffle(slots.map((_, i) => i));
    const id = window.setInterval(() => {
      n++;
      if (n % 2 === 0) {
        const slot = order[s++ % order.length];
        let next: Live | undefined;
        for (let tries = 0; tries < LIVE.length && !next; tries++) {
          const c = opening.rest[q++ % opening.rest.length];
          if (!shown.current.includes(c.id) && !(phone && TALL.includes(c.id))) next = c;
        }
        if (next) { shown.current[slot] = next.id; handles.current[slot]?.swap(next); }
      } else {
        handles.current[Math.floor(Math.random() * slots.length)]?.poke();
      }
    }, 1200);
    return () => window.clearInterval(id);
  }, [active, slots, opening, phone]);

  const move = (e: React.PointerEvent) => {
    if (!active || !fine || phone || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    rawY.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const leave = () => { rawX.set(0); rawY.set(0); };

  const copy = (
    <div className="pointer-events-none relative z-30 mx-auto max-w-[760px] px-6 pt-10 text-center md:pt-14">
      <h2 id="orbit-title" className="text-[clamp(32px,5vw,68px)] font-medium leading-[1.02] tracking-[-0.035em]">
        <TextAnimate as="span" text="The library, in orbit" preset="rise" />
      </h2>
      <p className="mx-auto mt-4 max-w-[46ch] text-[17px] leading-relaxed text-muted">
        {total} components, and every card here is a live one. They turn over as you watch; press any of them to open its page.
      </p>
    </div>
  );

  if (reduce) {
    return (
      <section aria-labelledby="orbit-title" className="rounded-[10px] bg-raised pb-8">
        {copy}
        <ul className="mx-auto mt-10 grid max-w-[1240px] grid-cols-1 justify-items-center gap-5 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {opening.first.slice(0, 8).map((p) => <li key={p.id}><Face piece={p} tick={0} /></li>)}
        </ul>
      </section>
    );
  }

  return (
    <section
      ref={box}
      aria-labelledby="orbit-title"
      onPointerMove={move}
      onPointerLeave={leave}
      className="relative h-[1000px] max-sm:h-[1000px] overflow-hidden rounded-[10px] bg-raised md:h-[min(calc(100dvh-96px),840px)] md:min-h-[680px]"
    >
      {active && <Driver t={t} />}
      <div aria-hidden className="absolute left-1/2 top-[64%] h-[44%] w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-line/70" />
      <div aria-hidden className="absolute left-1/2 top-[64%] h-[78%] w-[118%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-line/40" />
      {slots.map((slot, i) => (
        <Card key={`${slots.length}-${i}`} slot={slot} i={i} first={opening.first[i]} scene={scene} register={register} amp={amp} />
      ))}
      {copy}
    </section>
  );
}

function shuffle<T>(xs: T[]) {
  for (let i = xs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [xs[i], xs[j]] = [xs[j], xs[i]];
  }
  return xs;
}
