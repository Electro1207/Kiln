import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown } from "lucide-react";
import { cn } from "../../cn";
import { fade, springSoft } from "../../motion";

export type TermTone = "plain" | "muted" | "green" | "red" | "yellow" | "blue" | "bold";
/** One line of output: a list of coloured spans, like ANSI escapes. */
export type TermLine = { id: string; parts: { text: string; tone?: TermTone }[] };

const tones: Record<TermTone, string> = {
  plain: "text-ink",
  muted: "text-muted",
  green: "text-positive",
  red: "text-negative",
  yellow: "text-warning",
  blue: "text-info",
  bold: "font-semibold text-ink",
};

/** Text used by Terminal. Pass a partial via `labels` to translate or reword. */
export interface TerminalLabels {
  /** aria-label of the output log when there is no title. */
  output: string;
  /** aria-label of the command input. */
  command: string;
  /** Text of the jump-to-tail button. */
  jumpToLatest: string;
}
export const terminalLabels: TerminalLabels = { output: "Terminal output", command: "Command", jumpToLatest: "Jump to latest" };

export type TerminalProps = {
  lines: TermLine[];
  prompt?: string;
  /** Text being typed at the prompt right now (for scripted demos). */
  typing?: string;
  /** Called when the person presses Enter on a command. */
  onCommand?: (cmd: string) => void;
  title?: string;
  height?: number;
  className?: string;
  /** Override any UI text. Merged over `terminalLabels`. */
  labels?: Partial<TerminalLabels>;
  /** Replace any built-in icon. Merged over `terminalIcons`. */
  icons?: Partial<TerminalIcons>;
};

export interface TerminalIcons {
  /** Jump-to-latest pill. */
  latest: ReactNode;
}
export const terminalIcons: TerminalIcons = { latest: <ArrowDown /> };

/**
 * A terminal: scrollback with coloured spans, a prompt with a blinking caret and
 * a real input. It follows new output while you are at the bottom; scroll up and
 * it stays put, with a button to jump back to the latest line.
 */
export function Terminal({ lines, prompt = "$", typing, onCommand, title, height = 340, className, labels, icons }: TerminalProps) {
  const lb = { ...terminalLabels, ...labels };
  const ic = useMemo(() => ({ ...terminalIcons, ...icons }), [icons]);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [pinned, setPinned] = useState(true);
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && pinned) el.scrollTop = el.scrollHeight;
  }, [lines, typing, pinned]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => setPinned(el.scrollHeight - el.scrollTop - el.clientHeight < 8);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const shown = typing ?? value;
  const render = (parts: TermLine["parts"]): ReactNode => parts.map((p, i) => <span key={i} className={tones[p.tone ?? "plain"]}>{p.text}</span>);

  return (
    <div className={cn("relative flex w-full flex-col overflow-hidden rounded-card border border-line bg-surface transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20", className)}>
      <div className="flex h-9 items-center gap-2 border-b border-line px-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-active" />
          <span className="size-2.5 rounded-full bg-active" />
          <span className="size-2.5 rounded-full bg-active" />
        </span>
        {title && <span className="mx-auto truncate pr-12 text-xs text-muted">{title}</span>}
      </div>
      <div
        ref={scroller}
        role="log"
        aria-live="polite"
        aria-label={title ?? lb.output}
        className="overflow-y-auto px-4 py-3 font-mono text-[13px] leading-[21px] [contain:strict]"
        style={{ height }}
        onClick={() => input.current?.focus()}
      >
        {lines.map((l) => (
          <div key={l.id} className="whitespace-pre-wrap break-words">
            {l.parts.length ? render(l.parts) : " "}
          </div>
        ))}
        <form
          className="flex"
          onSubmit={(e) => {
            e.preventDefault();
            if (typing != null) return;
            const cmd = value;
            setValue("");
            setHIndex(null);
            if (cmd.trim()) setHistory((h) => [...h, cmd]);
            setPinned(true);
            onCommand?.(cmd);
          }}
        >
          <span className="shrink-0 pr-2 text-positive" aria-hidden>{prompt}</span>
          <span className="relative min-w-0 flex-1">
            <span aria-hidden className="whitespace-pre-wrap break-all text-ink">
              {shown}
              <motion.span
                className="inline-block h-[17px] w-[8px] translate-y-[3px] bg-ink"
                animate={{ opacity: [1, 1, 0, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear", times: [0, 0.5, 0.5, 1] }}
              />
            </span>
            <input
              ref={input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" && history.length) {
                  e.preventDefault();
                  const i = hIndex == null ? history.length - 1 : Math.max(0, hIndex - 1);
                  setHIndex(i);
                  setValue(history[i]);
                } else if (e.key === "ArrowDown" && hIndex != null) {
                  e.preventDefault();
                  const i = hIndex + 1;
                  if (i >= history.length) { setHIndex(null); setValue(""); } else { setHIndex(i); setValue(history[i]); }
                }
              }}
              readOnly={typing != null}
              aria-label={lb.command}
              autoComplete="off"
              spellCheck={false}
              className="absolute inset-0 w-full opacity-0 outline-none"
            />
          </span>
        </form>
      </div>
      <AnimatePresence>
        {!pinned && (
          <motion.button
            type="button"
            onClick={() => {
              setPinned(true);
              scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: fade }}
            transition={springSoft}
            className="absolute bottom-3 right-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-elevated px-3 text-xs font-medium text-ink shadow-float"
          >
            <span className="inline-flex [&>svg]:size-3.5" aria-hidden>{ic.latest}</span> {lb.jumpToLatest}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
