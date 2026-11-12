import { useLayoutEffect, useRef, type ElementType } from "react";
import { useInView } from "motion/react";
import { cn } from "../../cn";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type TextAnimateProps = {
  text: string;
  /** Animate each word or each letter. */
  by?: "word" | "char";
  /** fade-up: rise 0.4em while fading in · rise: slide up from behind a line mask · fade: opacity only. */
  preset?: "fade-up" | "rise" | "fade";
  as?: ElementType;
  /** Seconds between units. Default 0.06 for words, 0.022 for letters. */
  stagger?: number;
  delay?: number;
  /** Play again every time it re-enters the screen. */
  repeat?: boolean;
  className?: string;
};

/* The same feel as springSoft, as a curve the compositor can run on its own. */
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const DURATION = 620;

const frames: Record<NonNullable<TextAnimateProps["preset"]>, Keyframe[]> = {
  "fade-up": [{ opacity: 0, transform: "translateY(0.4em)" }, { opacity: 1, transform: "translateY(0)" }],
  rise: [{ transform: "translateY(110%)" }, { transform: "translateY(0)" }],
  fade: [{ opacity: 0 }, { opacity: 1 }],
};

/**
 * A line of text that arrives word by word or letter by letter when it comes
 * into view. Each piece is a Web Animation, so even a long headline animates
 * on the compositor and never competes with scrolling. Words never break
 * apart, and screen readers get the plain text.
 */
export function TextAnimate({ text, by = "word", preset = "fade-up", as: Tag = "p", stagger, delay = 0, repeat, className }: TextAnimateProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: !repeat, amount: 0.6 });
  const reduce = usePrefersReducedMotion();
  const words = text.split(" ");
  const gap = (stagger ?? (by === "word" ? 0.06 : 0.022)) * 1000;
  const mask = preset === "rise";
  const hidden = frames[preset][0];

  // A layout effect, so the starting pose is set before the first paint.
  useLayoutEffect(() => {
    const units = Array.from(ref.current?.querySelectorAll<HTMLElement>("[data-unit]") ?? []);
    if (reduce) {
      for (const u of units) u.style.opacity = u.style.transform = "";
      return;
    }
    if (!inView) {
      for (const u of units) {
        u.style.opacity = hidden.opacity != null ? String(hidden.opacity) : "";
        u.style.transform = (hidden.transform as string | undefined) ?? "";
      }
      return;
    }
    const anims = units.map((u, i) => u.animate(frames[preset], { duration: DURATION, delay: delay * 1000 + i * gap, easing: EASE, fill: "backwards" }));
    for (const u of units) u.style.opacity = u.style.transform = "";
    return () => anims.forEach((a) => a.cancel());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduce, preset, delay, gap, text]);

  return (
    <Tag ref={ref} aria-label={text} className={className}>
      <span aria-hidden className="inline">
        {words.map((w, i) => (
          <span key={i} className={cn("inline-block whitespace-nowrap", mask && "overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom")}>
            {by === "word" ? (
              <span data-unit className="inline-block">{w}</span>
            ) : (
              Array.from(w).map((c, j) => (
                <span key={j} data-unit className="inline-block">{c}</span>
              ))
            )}
            {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
          </span>
        ))}
      </span>
    </Tag>
  );
}
