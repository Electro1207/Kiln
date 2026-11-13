import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "../shared/useLoop";
import { Terminal, type TermLine, type TermTone, type TerminalProps } from "./Terminal";

/** One step of a script: a command typed at the prompt, or output printed under it. */
export type TerminalStep =
  | {
      /** Typed at the prompt one key at a time, then entered. */
      command: string;
      /** Prompt to show from this command on, e.g. after a `cd`. */
      prompt?: string;
      /** Wait before typing starts, in ms. Default 380. */
      pause?: number;
    }
  | {
      /** A plain string, or coloured spans like ANSI escapes. */
      output: string | TermLine["parts"];
      /** Colour for a plain-string output. */
      tone?: TermTone;
      /** Wait before it prints, in ms. Default 140. */
      pause?: number;
    };

export type TerminalScriptProps = Omit<TerminalProps, "lines" | "typing" | "onCommand" | "prompt"> & {
  steps: TerminalStep[];
  /** Prompt before any step changes it. Default "$". */
  prompt?: string;
  /** Average ms per typed key; each key varies a little, like a person typing. Default 55. */
  speed?: number;
  /** When the script starts: as soon as it mounts, or when half of it is on screen. Default "view". */
  start?: "mount" | "view";
  /** Called once when the last step has run. */
  onDone?: () => void;
  /**
   * After the script, the prompt is live. Return what to print for a command
   * (a string, or steps that may change the prompt); return nothing to print nothing.
   * Without it the prompt stays read-only.
   */
  onCommand?: (cmd: string) => string | TerminalStep[] | void;
  /**
   * With `onCommand`, put the cursor in the prompt when the script ends, so people can type at once.
   * It never takes focus from another field, from a terminal that is off screen, or on touch screens
   * (where it would open the keyboard). Default true.
   */
  focusWhenDone?: boolean;
};

const lineOf = (parts: TermLine["parts"], n: number): TermLine => ({ id: `s${n}`, parts });

/**
 * Plays a scripted session in a Terminal: commands are typed key by key at a
 * human pace, output prints line by line, and a `cd` can change the prompt. Click
 * or press a key while it plays to skip to the end. Once it ends, the prompt can
 * take real commands through `onCommand`. With reduced motion the whole session
 * is shown at once.
 */
export function TerminalScript({ steps, prompt: firstPrompt = "$", speed = 55, start = "view", onDone, onCommand, focusWhenDone = true, className, ...rest }: TerminalScriptProps) {
  const reduce = usePrefersReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<TermLine[]>([]);
  const [typing, setTyping] = useState<string | undefined>("");
  const [prompt, setPrompt] = useState(firstPrompt);
  const [running, setRunning] = useState(false);
  const count = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const finished = useRef(false);
  const doneRef = useRef(onDone);
  const focusRef = useRef(focusWhenDone && !!onCommand);
  useLayoutEffect(() => { focusRef.current = focusWhenDone && !!onCommand; });
  useLayoutEffect(() => { doneRef.current = onDone; });

  const print = useCallback((step: TerminalStep, p: string) => {
    if ("command" in step) {
      const at = step.prompt ?? p;
      setLines((ls) => [...ls, lineOf([{ text: `${at} `, tone: "green" }, { text: step.command }], count.current++)]);
      return at;
    }
    const parts = typeof step.output === "string" ? [{ text: step.output, tone: step.tone }] : step.output;
    setLines((ls) => [...ls, lineOf(parts, count.current++)]);
    return p;
  }, []);

  // Run every remaining step at once: for reduced motion and for skipping.
  const finish = useCallback((from: number, p: string) => {
    window.clearTimeout(timer.current);
    let at = p;
    for (const s of steps.slice(from)) at = print(s, at);
    setPrompt(at);
    setTyping(undefined);
    setRunning(false);
    if (!finished.current) {
      finished.current = true;
      doneRef.current?.();
      if (focusRef.current) requestAnimationFrame(() => {
        const el = root.current;
        const field = el?.querySelector("input");
        const r = el?.getBoundingClientRect();
        const free = !document.activeElement || document.activeElement === document.body || el?.contains(document.activeElement);
        const touch = window.matchMedia("(pointer: coarse)").matches;
        if (field && r && free && !touch && r.bottom > 0 && r.top < window.innerHeight) field.focus({ preventScroll: true });
      });
    }
  }, [steps, print]);

  const skip = useRef<() => void>(() => {});

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let index = 0;
    let at = firstPrompt;
    let cancelled = false;
    const wait = (ms: number, fn: () => void) => { timer.current = window.setTimeout(() => !cancelled && fn(), ms); };

    const next = () => {
      if (index >= steps.length) return finish(index, at);
      const step = steps[index];
      if ("command" in step) {
        if (step.prompt) { at = step.prompt; setPrompt(at); }
        let i = 0;
        const key = () => {
          i++;
          setTyping(step.command.slice(0, i));
          if (i < step.command.length) wait(speed * (0.55 + Math.random() * 0.9), key);
          else wait(260, () => { print(step, at); setTyping(""); index++; next(); });
        };
        wait(step.pause ?? 380, key);
      } else {
        wait(step.pause ?? 140, () => { print(step, at); index++; next(); });
      }
    };

    skip.current = () => { if (!finished.current) { cancelled = true; finish(index, at); } };

    if (reduce) { finish(0, firstPrompt); return () => { cancelled = true; }; }

    const go = () => { setRunning(true); next(); };
    if (start === "mount") {
      go();
      return () => { cancelled = true; window.clearTimeout(timer.current); };
    }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); go(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => { cancelled = true; io.disconnect(); window.clearTimeout(timer.current); };
    // The script runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => { if (!e.metaKey && !e.ctrlKey && !e.altKey && e.key !== "Tab") skip.current(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running]);

  return (
    <div ref={root} className={className} onPointerDown={() => running && skip.current()}>
      <Terminal
        {...rest}
        lines={lines}
        prompt={prompt}
        typing={typing ?? (onCommand ? undefined : "")}
        onCommand={(cmd) => {
          print({ command: cmd }, prompt);
          const out = onCommand?.(cmd);
          if (!out) return;
          let at = prompt;
          for (const s of typeof out === "string" ? [{ output: out } as TerminalStep] : out) {
            if ("command" in s && s.prompt) at = s.prompt;
            else at = print(s, at);
          }
          setPrompt(at);
        }}
      />
    </div>
  );
}
