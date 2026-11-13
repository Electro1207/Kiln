import { useRef, useState, type ReactNode } from "react";
import { animate, motion, useMotionValue, useScroll, useTransform, type MotionValue } from "motion/react";
import { cn } from "../../cn";
import { easeOut, springSoft } from "../../motion";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type FanCard = {
  id: string;
  /** The card's face. A function gets `{ active }`: true while it is lifted (hovered or focused). */
  content: ReactNode | ((state: { active: boolean }) => ReactNode);
};

export type CardFanProps = {
  cards: FanCard[];
  /** Degrees between the outermost cards. Default 22. */
  spread?: number;
  /** How much each card covers the next, as a share of its width. Default 0.28. */
  overlap?: number;
  /** How far a lifted card rises, in px. Default 26. */
  lift?: number;
  /**
   * How the hand is dealt: "scroll" deals it out of a stack as it scrolls into view and gathers it
   * again on the way back; "view" deals it once when it comes into view. Default "scroll".
   */
  deal?: "scroll" | "view";
  /** Called with the lifted card's id, or null when none is. */
  onActiveChange?: (id: string | null) => void;
  /** Classes for every card: give them a size, e.g. `w-44 aspect-[4/5]`. */
  cardClassName?: string;
  className?: string;
  "aria-label"?: string;
};

/**
* A hand of cards fanned out on an arc, each overlapping the one before like a hand held to read. It deals itself out of a single stack as it comes into view,
 * and a card lifts out of the hand while it is hovered or focused, so its face can play something.
 * On narrow screens the hand lays out as a row you can scroll sideways. Transform only.
 */
export function CardFan({ cards, spread = 22, overlap = 0.28, lift = 26, deal = "scroll", onActiveChange, cardClassName, className, "aria-label": ariaLabel }: CardFanProps) {
  const root = useRef<HTMLUListElement>(null);
  const reduce = usePrefersReducedMotion();
  const [active, setActive] = useState<string | null>(null);
  const { scrollYProgress } = useScroll({ target: root, offset: ["start end", "center 60%"] });
  const once = useMotionValue(0);
  const full = useMotionValue(1);
  const dealt = reduce ? full : deal === "view" ? once : scrollYProgress;

  const set = (id: string | null) => {
    setActive(id);
    onActiveChange?.(id);
  };
  const n = cards.length;
  const mid = (n - 1) / 2;

  return (
    <motion.ul
      ref={root}
      aria-label={ariaLabel}
      onViewportEnter={() => deal === "view" && animate(once, 1, { duration: 0.9, ease: easeOut })}
      viewport={{ once: true, amount: 0.4 }}
      className={cn(
        "flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-4 pt-10 md:justify-center md:gap-0 md:overflow-visible md:pb-12",
        className,
      )}
    >
      {cards.map((c, i) => (
        <Card
          key={c.id}
          i={i}
          mid={mid}
          n={n}
          spread={spread}
          overlap={overlap}
          lift={lift}
          dealt={dealt}
          active={active === c.id}
          onActive={(on) => set(on ? c.id : active === c.id ? null : active)}
          className={cardClassName}
        >
          {typeof c.content === "function" ? c.content({ active: active === c.id }) : c.content}
        </Card>
      ))}
    </motion.ul>
  );
}

function Card({ i, mid, n, spread, overlap, lift, dealt, active, onActive, className, children }: {
  i: number; mid: number; n: number; spread: number; overlap: number; lift: number; dealt: MotionValue<number>;
  active: boolean; onActive: (on: boolean) => void; className?: string; children: ReactNode;
}) {
  const off = i - mid;
  const angle = n > 1 ? (off / mid || 0) * (spread / 2) : 0;
  // Each card leaves the stack a little after the one before it.
  const t = useTransform(dealt, (v) => Math.min(1, Math.max(0, (v - (i / n) * 0.35) / 0.65)));
  const ease = (x: number) => 1 - Math.pow(1 - x, 3);
  const rotate = useTransform(t, (v) => angle * ease(v) + (1 - ease(v)) * (i % 2 ? 2 : -2));
  const x = useTransform(t, (v) => `${off * (overlap * 100) * ease(v) * -1 + off * -100 * (1 - ease(v))}%`);
  const y = useTransform(t, (v) => off * off * 6 * ease(v));

  return (
    <motion.li
      style={{ x, y, rotate, zIndex: active ? n + 1 : i + 1 }}
      onPointerEnter={(e) => e.pointerType === "mouse" && onActive(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && onActive(false)}
      onFocus={() => onActive(true)}
      onBlur={() => onActive(false)}
      className={cn(
        "relative shrink-0 snap-center origin-[50%_120%] will-change-transform max-md:![transform:none]",
        className,
      )}
    >
      {/* The lift is its own layer, so it springs on top of wherever the deal has put the card. */}
      <motion.div
        animate={{ y: active ? -lift : 0, rotate: active ? -angle * 0.6 : 0, scale: active ? 1.04 : 1 }}
        transition={springSoft}
        className="size-full overflow-hidden rounded-card border border-line bg-surface shadow-float"
      >
        {children}
      </motion.div>
    </motion.li>
  );
}
