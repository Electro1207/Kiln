import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../cn";
import { usePrefersReducedMotion } from "../shared/useLoop";

export type StreamingTextProps = {
  /** The full answer. While `streaming`, it is revealed a token at a time. */
  text: string;
  streaming: boolean;
  /** Tokens per second. */
  rate?: number;
  /** Called once every token is on screen. */
  onDone?: () => void;
  /** Stop revealing (the Stop button); the text shown so far stays. */
  stopped?: boolean;
  className?: string;
};

/** Split into word-ish tokens that keep their trailing space. */
function tokenize(text: string) {
  return text.match(/\S+\s*|\s+/g) ?? [];
}

/**
 * Assistant text that writes itself in, the way a model streams tokens. Each
 * new token fades in on the compositor; the text before it never re-renders,
 * so long answers stay smooth. Paragraphs split on blank lines.
 */
export function StreamingText({ text, streaming, rate = 32, onDone, stopped, className }: StreamingTextProps) {
  const tokens = useMemo(() => tokenize(text), [text]);
  const reduce = usePrefersReducedMotion();
  const [shown, setShown] = useState(streaming && !reduce ? 0 : tokens.length);
  const done = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!streaming || reduce) {
      setShown(tokens.length);
      return;
    }
    if (stopped) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      // Uneven bursts read as a real stream; the average holds at `rate`.
      acc += ((now - last) / 1000) * rate * (0.6 + Math.random() * 0.8);
      last = now;
      if (acc >= 1) {
        const step = Math.floor(acc);
        acc -= step;
        setShown((s) => Math.min(tokens.length, s + step));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [streaming, stopped, rate, tokens.length, reduce]);

  useEffect(() => {
    if (shown >= tokens.length && !done.current) {
      done.current = true;
      doneRef.current?.();
    }
  }, [shown, tokens.length]);

  const paras: Array<Array<{ t: string; i: number }>> = [[]];
  for (let i = 0; i < shown; i++) {
    const t = tokens[i];
    if (/\n\s*\n/.test(t)) {
      paras[paras.length - 1].push({ t: t.replace(/\s+$/, " "), i });
      paras.push([]);
    } else paras[paras.length - 1].push({ t, i });
  }
  const live = streaming && !stopped && shown < tokens.length;

  return (
    <div className={cn("space-y-3 text-[15px] leading-[24px] text-ink", className)} aria-busy={live}>
      {paras.map((p, k) => (
        <p key={k}>
          {p.map(({ t, i }) => (
            <Token key={i} text={t} animate={streaming && !reduce} />
          ))}
          {live && k === paras.length - 1 && (
            /* Zero width, so it never wraps onto a line of its own; the dot hangs just after the text. */
            <span aria-hidden className="relative inline-block w-0 align-middle">
              <span className="absolute left-0.5 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-ink opacity-70" />
            </span>
          )}
        </p>
      ))}
    </div>
  );
}

/** A token fades in once, when it mounts; React never touches it again. */
function Token({ text, animate }: { text: string; animate: boolean }) {
  return (
    <span
      ref={(el) => {
        if (el && animate && !el.dataset.in) {
          el.dataset.in = "1";
          el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
        }
      }}
    >
      {text}
    </span>
  );
}
