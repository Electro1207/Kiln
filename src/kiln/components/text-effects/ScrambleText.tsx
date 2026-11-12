import { useCallback, useEffect, useRef } from "react";
import { useInView } from "motion/react";
import { cn } from "../../cn";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type ScrambleTextProps = {
  text: string;
  /** Code-like text (a key, a hash, a call sign) is set in the mono face; anything else stays in the house face. */
  code?: boolean;
  /** When to decode: on entering the screen, on hover, or both. */
  trigger?: "view" | "hover" | "both";
  /** ms for the whole decode. */
  duration?: number;
  className?: string;
};

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const CODE = "アイウエオカキクケコサシスセソ0123456789ABCDEF";

/**
 * Text that decodes itself, Matrix-style: letters flicker through random
 * glyphs and lock in from left to right. Each letter has its own cell sized by
 * the real letter, so nothing on the line moves while it scrambles.
 */
export function ScrambleText({ text, code, trigger = "both", duration = 900, className }: ScrambleTextProps) {
  const root = useRef<HTMLSpanElement>(null);
  const cells = useRef<Array<HTMLSpanElement | null>>([]);
  const raf = useRef(0);
  const reduce = usePrefersReducedMotion();
  const inView = useInView(root, { once: true, amount: 0.8 });

  const run = useCallback(() => {
    if (reduce) return;
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const chars = Array.from(text);
    const pool = (c: string) => (code ? CODE : /[A-Z]/.test(c) ? UPPER : /[a-z]/.test(c) ? LOWER : /[0-9]/.test(c) ? DIGITS : null);
    let lastSwap = 0;
    const frame = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const swap = now - lastSwap > 33;
      if (swap) lastSwap = now;
      chars.forEach((c, i) => {
        const el = cells.current[i];
        if (!el) return;
        const lockAt = 0.25 + (i / Math.max(chars.length, 1)) * 0.75;
        const set = pool(c);
        if (p >= lockAt || !set) {
          if (el.textContent !== c) el.textContent = c;
          if (el.dataset.locked !== "1") el.dataset.locked = "1";
        } else if (swap) {
          el.textContent = set[(Math.random() * set.length) | 0];
          el.dataset.locked = "0";
        }
      });
      if (p < 1) raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
  }, [text, code, duration, reduce]);

  useEffect(() => {
    if (inView && trigger !== "hover") run();
  }, [inView, trigger, run]);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Words keep their trailing space so the line can break between them.
  const words: Array<{ chars: string[]; start: number }> = [];
  let at = 0;
  for (const part of text.split(/(?<= )/)) {
    words.push({ chars: Array.from(part), start: at });
    at += Array.from(part).length;
  }

  return (
    <span
      ref={root}
      aria-label={text}
      onPointerEnter={trigger !== "view" ? run : undefined}
      onFocus={trigger !== "view" ? run : undefined}
      className={cn(code && "font-mono", "inline-block", className)}
    >
      {words.map(({ chars, start }, w) => (
        <span key={w} aria-hidden className="inline-block whitespace-pre">
          {chars.map((c, j) => {
            const i = start + j;
            return (
              <span key={i} className="relative inline-block whitespace-pre [contain:layout_paint]">
                <span className="invisible">{c}</span>
                <span
                  ref={(el) => {
                    cells.current[i] = el;
                  }}
                  data-locked="1"
                  className="absolute inset-0 text-center data-[locked=0]:text-accent"
                >
                  {c}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
