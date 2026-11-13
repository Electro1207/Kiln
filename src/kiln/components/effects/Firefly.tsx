import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { easeOut, springSoft } from "../../motion";
import { useLoop, usePrefersReducedMotion } from "../shared/useLoop";

export type FireflyProps = {
  /** How many wander about. Default 1. */
  count?: number;
  /**
   * Shown beside a firefly when someone catches it (clicks or presses it), for a few seconds.
   * Leave out and the fireflies are only to look at.
   */
  message?: ReactNode;
  /**
   * Where the message shows: beside the firefly, opening towards the middle of the parent (default),
   * or in a pill at the bottom of the screen, for fireflies that drift behind other content.
   */
  messageAt?: "beside" | "bottom";
  /** Called when one is caught. */
  onCatch?: () => void;
  /** Seconds per wander, roughly; each firefly gets its own. Default 14. */
  pace?: number;
  /** Name of a firefly for screen readers, when `message` makes it a button. Default "A firefly". */
  label?: string;
  /** Classes for each light: its colour comes from the text colour. Default `text-accent`. */
  fireflyClassName?: string;
  className?: string;
};

/* A tiny seeded random, so each firefly keeps the same path between renders. */
const rand = (seed: number) => {
  let s = (seed * 2654435761) % 2147483647 || 1;
  const next = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  next(); next(); next(); // small seeds start small: step past the first few
  return next;
};

/**
 * Small lights drifting slowly across their parent, blinking as they go, like fireflies in a dark
 * field. Fill a positioned parent (they never take the pointer except on the light itself). With
 * `message`, catching one makes it flare and shows the message beside it. Transform and opacity
 * only, on the compositor; with reduced motion they glow in place without wandering.
 */
export function Firefly({ count = 1, message, messageAt = "beside", onCatch, pace = 14, label = "A firefly", fireflyClassName, className }: FireflyProps) {
  return (
    <div data-firefly-field aria-hidden={message ? undefined : true} className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      {Array.from({ length: count }, (_, i) => (
        <Fly key={i} seed={i * 7919 + 17} message={message} messageAt={messageAt} onCatch={onCatch} pace={pace} label={label} className={fireflyClassName} />
      ))}
    </div>
  );
}

function Fly({ seed, message, messageAt, onCatch, pace, label, className }: { seed: number; message?: ReactNode; messageAt: "beside" | "bottom"; onCatch?: () => void; pace: number; label: string; className?: string }) {
  const travel = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLSpanElement>(null);
  const reduce = usePrefersReducedMotion();
  const [caught, setCaught] = useState(false);
  // The message opens towards the middle of the parent, where there is room for it.
  const [toLeft, setToLeft] = useState(false);
  const r = rand(seed);
  const start = { x: 10 + r() * 80, y: 15 + r() * 70 };

  // The wander: a closed loop of points across the parent, eased between, in percent of the parent.
  useLoop(
    travel,
    (el) => {
      if (reduce) return [];
      const g = rand(seed + 1);
      const pts = Array.from({ length: 6 }, () => `translate(${(g() - 0.5) * 40}cqw, ${(g() - 0.5) * 40}cqh)`);
      const wander = el.animate(
        [...pts, pts[0]].map((transform) => ({ transform })),
        { duration: pace * 1000 * (0.8 + g() * 0.5), iterations: Infinity, easing: "ease-in-out" },
      );
      const blink = light.current?.animate(
        [{ opacity: 0.25 }, { opacity: 1 }, { opacity: 0.9 }, { opacity: 0.2 }, { opacity: 0.25 }],
        { duration: 2600 + g() * 1800, iterations: Infinity, easing: "ease-in-out" },
      );
      return blink ? [wander, blink] : [wander];
    },
    [reduce, pace, seed],
  );

  // A caught firefly holds still while its message shows.
  useEffect(() => {
    for (const a of travel.current?.getAnimations() ?? []) if (caught) a.pause(); else if (a.playState === "paused" && a.currentTime) a.play();
    if (!caught) return;
    const t = window.setTimeout(() => setCaught(false), 3600);
    return () => window.clearTimeout(t);
  }, [caught]);

  const dot = (
    <span
      ref={light}
      className={cn(
        "block size-2 rounded-full bg-current text-accent shadow-[0_0_10px_3px_currentColor,0_0_24px_8px_color-mix(in_oklab,currentColor_35%,transparent)]",
        className,
      )}
    />
  );

  return (
    <div className="absolute inset-0 [container-type:size]">
      <div ref={travel} className="absolute will-change-transform" style={{ left: `${start.x}%`, top: `${start.y}%` }}>
        {message ? (
          <motion.button
            type="button"
            aria-label={label}
            onClick={(e) => {
              const box = e.currentTarget.closest("[data-firefly-field]")?.getBoundingClientRect();
              const me = e.currentTarget.getBoundingClientRect();
              setToLeft(!!box && me.left - box.left > box.width / 2);
              setCaught(true);
              onCatch?.();
            }}
            animate={{ scale: caught ? 1.8 : 1 }}
            transition={springSoft}
            className="pointer-events-auto -m-3 grid size-8 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {dot}
          </motion.button>
        ) : (
          dot
        )}
        {messageAt === "bottom" && typeof document !== "undefined" && createPortal(
          <div role="status" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center">
            <AnimatePresence>
              {caught && message && (
                <motion.p
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, transition: { duration: 0.3, ease: easeOut } }}
                  transition={springSoft}
                  className="flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink shadow-float"
                >
                  <span aria-hidden className={cn("size-2 rounded-full bg-current text-accent shadow-[0_0_8px_2px_currentColor]", className)} />
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>,
          document.body,
        )}
        <AnimatePresence>
          {caught && message && messageAt === "beside" && (
            <motion.p
              role="status"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.4, ease: easeOut } }}
              transition={springSoft}
              className={cn("absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-sm font-medium text-ink", toLeft ? "right-6" : "left-6")}
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
