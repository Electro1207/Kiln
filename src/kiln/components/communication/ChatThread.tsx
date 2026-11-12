import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springSoft } from "../../motion";
import { Avatar } from "../data-display/Avatar";
import { useLoop } from "../shared/useLoop";

export type ChatMessage = {
  id: string;
  author: string;
  text: string;
  /** Minutes since midnight; used for grouping and the time labels. */
  at: number;
};

/** Text used by ChatThread. Pass a partial via `labels` to translate or reword. */
export interface ChatThreadLabels {
  /** aria-label of the message log. */
  messages: string;
  /** aria-label of the typing indicator, given the typist's name. */
  typing: (name: string) => string;
  /** Jump pill text when messages arrived while scrolled up. */
  newMessages: (count: number) => string;
  /** Jump pill text when nothing new arrived. */
  latest: string;
  /** aria-label of the send button. */
  send: string;
}
export const chatThreadLabels: ChatThreadLabels = {
  messages: "Messages",
  typing: (name) => `${name} is typing`,
  newMessages: (n) => `${n} new ${n === 1 ? "message" : "messages"}`,
  latest: "Latest",
  send: "Send",
};

export interface ChatThreadIcons {
  /** Jump-to-latest pill. */
  latest: ReactNode;
  /** Send button. */
  send: ReactNode;
}
export const chatThreadIcons: ChatThreadIcons = { latest: <ArrowDown />, send: <ArrowUp /> };

export type ChatThreadProps = {
  messages: ChatMessage[];
  /** The author name that is "me": right-aligned, filled bubbles. */
  me: string;
  /** Name of whoever is typing right now, or null. */
  typing?: string | null;
  onSend?: (text: string) => void;
  /** Height of the scrolling area. Default 420px. */
  height?: number;
  placeholder?: string;
  className?: string;
  /** Override any UI text. Merged over `chatThreadLabels`. */
  labels?: Partial<ChatThreadLabels>;
  /** Replace any built-in icon. Merged over `chatThreadIcons`. */
  icons?: Partial<ChatThreadIcons>;
};

/** Messages from one author closer together than this share one group. */
const GROUP_MINUTES = 5;
/** A time label appears above a group that starts this long after the last one. */
const GAP_MINUTES = 30;
const NEAR_BOTTOM = 96;

/** Three dots breathing in turn: a compositor loop that pauses off-screen. */
function TypingDots({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useLoop(
    ref,
    (el) =>
      Array.from(el.children).map((d, i) =>
        d.animate(
          [{ opacity: 0.3, transform: "translateY(0)" }, { opacity: 1, transform: "translateY(-2px)" }, { opacity: 0.3, transform: "translateY(0)" }],
          { duration: 1100, iterations: Infinity, easing: "ease-in-out", delay: i * 160 },
        ),
      ),
    [],
  );
  return (
    <span ref={ref} role="status" aria-label={label} className="flex h-9 items-center gap-1 rounded-[18px] bg-raised px-3.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-1.5 rounded-full bg-muted opacity-30" />
      ))}
    </span>
  );
}

const clock = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

type Group = { author: string; messages: ChatMessage[]; showTime: boolean };

function groupMessages(messages: ChatMessage[]): Group[] {
  const out: Group[] = [];
  for (const m of messages) {
    const last = out[out.length - 1];
    const prev = last?.messages[last.messages.length - 1];
    if (last && last.author === m.author && m.at - prev!.at <= GROUP_MINUTES) last.messages.push(m);
    else out.push({ author: m.author, messages: [m], showTime: !prev || m.at - prev.at >= GAP_MINUTES });
  }
  return out;
}

/**
 * A conversation. Messages from one person run together in a group; new ones
 * rise in from the composer. If you have scrolled up when something arrives,
 * a pill offers to take you down to it instead of yanking the view.
 */
export function ChatThread({ messages, me, typing, onSend, height = 420, placeholder = "Message", className, labels, icons }: ChatThreadProps) {
  const l = { ...chatThreadLabels, ...labels };
  const ic = useMemo(() => ({ ...chatThreadIcons, ...icons }), [icons]);
  const scroller = useRef<HTMLDivElement>(null);
  const [initialIds] = useState(() => new Set(messages.map((m) => m.id)));
  const [atBottom, setAtBottom] = useState(true);
  // Where the reader was before anything new arrived: following along, or reading back.
  const following = useRef(true);
  const lastTop = useRef(0);
  const [unseen, setUnseen] = useState(0);
  const [draft, setDraft] = useState("");
  const groups = groupMessages(messages);
  const draftId = useId();

  const toBottom = useCallback((smooth: boolean) => {
    const el = scroller.current;
    if (!el) return;
    following.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useLayoutEffect(() => toBottom(false), [toBottom]);

  const lastId = messages[messages.length - 1]?.id;
  const prevLast = useRef(lastId);
  useLayoutEffect(() => {
    const isNew = lastId !== prevLast.current;
    prevLast.current = lastId;
    if (!scroller.current) return;
    const mine = messages[messages.length - 1]?.author === me;
    if (following.current || (isNew && mine)) toBottom(true);
    else if (isNew) setUnseen((n) => n + 1);
  }, [lastId, typing, me, messages, toBottom]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM;
    if (bottom || el.scrollTop < lastTop.current) following.current = bottom;
    lastTop.current = el.scrollTop;
    setAtBottom(bottom);
    if (bottom) setUnseen(0);
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onSend?.(text);
    setDraft("");
  };

  return (
    <div className={cn("relative flex flex-col overflow-hidden rounded-card border border-line bg-surface", className)}>
      <div
        ref={scroller}
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-label={l.messages}
        className="overflow-y-auto overscroll-contain px-4 pb-3 pt-4"
        style={{ height }}
      >
        {groups.map((g) => {
          const mine = g.author === me;
          return (
            <div key={g.messages[0].id} className={cn(g.showTime ? "pt-4 first:pt-0" : "pt-3")}>
              {g.showTime && (
                <p className="pb-3 text-center text-xs font-medium text-muted tabular">{clock(g.messages[0].at)}</p>
              )}
              <div className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
                {!mine && <Avatar name={g.author} size="sm" className="mb-0.5" />}
                <div className={cn("flex min-w-0 max-w-[78%] flex-col gap-0.5", mine ? "items-end" : "items-start")}>
                  {!mine && <span className="px-3 pb-0.5 text-xs font-medium text-muted">{g.author}</span>}
                  {g.messages.map((m, i) => {
                    const first = i === 0, last = i === g.messages.length - 1;
                    const fresh = !initialIds.has(m.id);
                    return (
                      <motion.div
                        key={m.id}
                        initial={fresh ? { opacity: 0, y: 14, scale: 0.97 } : false}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={springSoft}
                        style={{ transformOrigin: mine ? "100% 100%" : "0% 100%" }}
                        title={clock(m.at)}
                        className={cn(
                          "px-3.5 py-2 text-[14px] leading-5 [overflow-wrap:anywhere]",
                          mine ? "bg-btn-primary text-btn-primary-ink" : "bg-raised text-ink",
                          "rounded-[18px]",
                          mine
                            ? cn(!first && "rounded-tr-[6px]", !last && "rounded-br-[6px]")
                            : cn(!first && "rounded-tl-[6px]", !last && "rounded-bl-[6px]"),
                        )}
                      >
                        {m.text}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        <AnimatePresence initial={false}>
          {typing && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={springSoft}
              className="flex items-end gap-2 pt-3"
            >
              <Avatar name={typing} size="sm" className="mb-0.5" />
              <TypingDots label={l.typing(typing)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {!atBottom && (
          <motion.button
            key="jump"
            type="button"
            onClick={() => {
              toBottom(true);
              setUnseen(0);
            }}
            initial={{ opacity: 0, y: 10, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%", transition: { duration: 0.16, ease: easeOut } }}
            transition={springSoft}
            className="absolute bottom-[68px] left-1/2 z-10 flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-surface px-3 [&>svg]:size-3.5 text-[13px] font-medium text-ink shadow-float"
          >
            {ic.latest}
            <span className="grid [&>*]:[grid-area:1/1]">
              <motion.span initial={false} animate={{ opacity: unseen > 0 ? 1 : 0 }} transition={fade}>
                {l.newMessages(unseen)}
              </motion.span>
              <motion.span initial={false} animate={{ opacity: unseen > 0 ? 0 : 1 }} transition={fade} aria-hidden={unseen > 0}>
                {l.latest}
              </motion.span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-2.5">
        <label className="sr-only" htmlFor={draftId}>{placeholder}</label>
        <input
          id={draftId}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="h-10 min-w-0 flex-1 rounded-full bg-raised px-4 text-sm text-ink outline-none transition-shadow placeholder:text-faint focus:ring-2 focus:ring-accent-soft"
        />
        <motion.button
          type="submit"
          aria-label={l.send}
          disabled={!draft.trim()}
          whileTap={{ scale: 0.9 }}
          transition={springSoft}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-btn-primary text-btn-primary-ink transition-[background-color,opacity] hover:bg-btn-primary-hover disabled:opacity-40 [&>svg]:size-[18px] [&>svg]:stroke-[2.25]"
        >
          {ic.send}
        </motion.button>
      </form>
    </div>
  );
}
