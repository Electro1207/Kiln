import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { springSoft } from "../../motion";

/** Text used by ChatMessage. Pass a partial via `labels` to translate or reword. */
export interface ChatMessageLabels {
  /** Screen-reader name of a person's own message. */
  youSaid: string;
  /** Screen-reader name of an assistant message; receives the assistant's `name`. */
  assistantSaid: (name: string) => string;
}
export const chatMessageLabels: ChatMessageLabels = { youSaid: "You said", assistantSaid: (name) => `${name} said` };

export type ChatMessageProps = {
  role: "user" | "assistant";
  /** The assistant's name, for screen readers and the mark. */
  name?: string;
  /** A small mark beside assistant messages. */
  avatar?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Override any UI text. Merged over `chatMessageLabels`. */
  labels?: Partial<ChatMessageLabels>;
};

/**
 * One turn of a conversation. The person's words sit right in a quiet bubble;
 * the assistant's answer reads as open text beside its mark, with room for
 * reasoning, code, sources and actions below it.
 */
export function ChatMessage({ role, name = "Assistant", avatar, children, className, labels }: ChatMessageProps) {
  const l = { ...chatMessageLabels, ...labels };
  if (role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={springSoft}
        className={cn("flex justify-end", className)}
        aria-label={l.youSaid}
      >
        <div className="max-w-[80%] whitespace-pre-wrap rounded-[18px] rounded-br-[6px] bg-raised px-4 py-2.5 text-[15px] leading-[22px] text-ink [overflow-wrap:anywhere]">
          {children}
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springSoft}
      className={cn("flex gap-3", className)}
      aria-label={l.assistantSaid(name)}
    >
      <span className="mt-0.5 shrink-0">{avatar ?? <AssistantMark />}</span>
      <div className="min-w-0 flex-1 space-y-3">{children}</div>
    </motion.div>
  );
}

/** A neutral assistant mark: a lens with a lit centre. */
export function AssistantMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 28 28" width={size} height={size} className={className} aria-hidden>
      <circle cx="14" cy="14" r="13" className="fill-btn-secondary" />
      <circle cx="14" cy="14" r="7.5" className="fill-surface" />
      <circle cx="14" cy="14" r="3.5" className="fill-accent" />
    </svg>
  );
}
