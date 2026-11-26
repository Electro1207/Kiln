import { useEffect, useRef, useState } from "react";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { useLoop, useOnScreen } from "../shared/useLoop";

export type TypewriterProps = {
  /** Phrases typed one after another, then deleted, in a loop. */
  phrases: string[];
  /** ms per typed character. */
  speed?: number;
  /** ms per deleted character. */
  deleteSpeed?: number;
  /** ms the full phrase stays before deleting. */
  hold?: number;
  className?: string;
  caretClassName?: string;
  /**
   * Accessibility features this component supports on its own, on top of the person's settings and any
   * AccessibilityScope: "all", "none", a profile name, a list of profiles, or single features.
   */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/**
 * Types phrases out and deletes them again, with a real blinking caret that
 * stays solid while it is typing. Under reduced motion it shows the first
 * phrase, still.
 */
export function Typewriter({ phrases, speed = 55, deleteSpeed = 28, hold = 1600, className, caretClassName, accessibilityFeatures }: TypewriterProps) {
  const root = useRef<HTMLSpanElement>(null);
  const caret = useRef<HTMLSpanElement>(null);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  // Reduced motion and calm both hold the first phrase, still.
  const reduce = a11y.reduceMotion || a11y.calm;
  const visible = useOnScreen(root);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(true);
  const state = useRef({ phrase: 0, len: 0, deleting: false });

  useEffect(() => {
    if (reduce || !visible) return;
    let t: number;
    const tick = () => {
      const s = state.current;
      const full = phrases[s.phrase % phrases.length];
      if (!s.deleting && s.len < full.length) {
        s.len++;
        setTyping(true);
        t = window.setTimeout(tick, speed + (Math.random() * speed) / 2);
      } else if (!s.deleting) {
        s.deleting = true;
        setTyping(false);
        t = window.setTimeout(tick, hold);
      } else if (s.len > 0) {
        s.len--;
        setTyping(true);
        t = window.setTimeout(tick, deleteSpeed);
      } else {
        s.deleting = false;
        s.phrase++;
        setTyping(false);
        t = window.setTimeout(tick, 380);
      }
      setText(phrases[s.phrase % phrases.length].slice(0, s.len));
    };
    t = window.setTimeout(tick, 300);
    return () => window.clearTimeout(t);
  }, [reduce, visible, phrases, speed, deleteSpeed, hold]);

  // useLoop reads the shared settings; the caret also holds still for this component's own prop.
  useLoop(
    caret,
    (el) => (typing || reduce ? [] : [el.animate([{ opacity: 1 }, { opacity: 1, offset: 0.5 }, { opacity: 0, offset: 0.5 }, { opacity: 0 }], { duration: 1000, iterations: Infinity })]),
    [typing, reduce],
  );

  const shown = reduce ? phrases[0] : text;
  return (
    <span ref={root} className={cn("whitespace-pre-wrap", className)} {...rootProps}>
      <span className="sr-only">{phrases[0]}</span>
      <span aria-hidden>
        {shown}
        <span
          ref={caret}
          className={cn("ml-[0.06em] inline-block h-[1.05em] w-[0.08em] translate-y-[0.16em] rounded-full bg-accent align-baseline", caretClassName)}
        />
      </span>
    </span>
  );
}
