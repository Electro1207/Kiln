import { useState } from "react";
import { motion, useAnimate } from "motion/react";
import { RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "../../cn";
import { fade, springSoft } from "../../motion";
import { CopyButton } from "../buttons/CopyButton";
import { Tooltip } from "../overlays/Tooltip";

/** Text used by MessageActions. Pass a partial via `labels` to translate or reword. */
export interface MessageActionsLabels {
  /** Tooltip of the copy button. */
  copy: string;
  /** Confirmation announced after copying. */
  copied: string;
  /** Tooltip and aria-label of the thumbs-up button. */
  goodAnswer: string;
  /** Tooltip and aria-label of the thumbs-down button. */
  badAnswer: string;
  /** Tooltip and aria-label of the regenerate button. */
  regenerate: string;
}
export const messageActionsLabels: MessageActionsLabels = { copy: "Copy", copied: "Copied", goodAnswer: "Good answer", badAnswer: "Bad answer", regenerate: "Regenerate" };

export type MessageActionsProps = {
  /** The answer's plain text, for Copy. */
  text: string;
  onRegenerate?: () => void;
  onFeedback?: (v: "up" | "down" | null) => void;
  className?: string;
  /** Override any UI text. Merged over `messageActionsLabels`. */
  labels?: Partial<MessageActionsLabels>;
};

const btn = "relative grid size-8 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink";

/**
 * The row under an answer: copy, rate it up or down, or ask again. A rating
 * fills its icon (a fade, not a jump) and the other one clears.
 */
export function MessageActions({ text, onRegenerate, onFeedback, className, labels }: MessageActionsProps) {
  const l = { ...messageActionsLabels, ...labels };
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [spin, animate] = useAnimate<HTMLSpanElement>();
  const set = (v: "up" | "down") => {
    const next = vote === v ? null : v;
    setVote(next);
    onFeedback?.(next);
  };
  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      <Tooltip content={l.copy}>
        <span className="inline-flex">
          <CopyButton value={text} label={l.copy} copiedLabel={l.copied} className="size-8 justify-center rounded-full px-0" />
        </span>
      </Tooltip>
      {(["up", "down"] as const).map((v) => {
        const Icon = v === "up" ? ThumbsUp : ThumbsDown;
        const on = vote === v;
        return (
          <Tooltip key={v} content={v === "up" ? l.goodAnswer : l.badAnswer}>
            <motion.button type="button" aria-label={v === "up" ? l.goodAnswer : l.badAnswer} aria-pressed={on} onClick={() => set(v)} whileTap={{ scale: 0.88 }} transition={springSoft} className={cn(btn, on && "text-ink")}>
              <span className="grid [&>*]:[grid-area:1/1]">
                <Icon className="size-4" />
                <motion.span initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} className="grid">
                  <Icon className="size-4 fill-current" />
                </motion.span>
              </span>
            </motion.button>
          </Tooltip>
        );
      })}
      {onRegenerate && (
        <Tooltip content={l.regenerate}>
          <motion.button
            type="button"
            aria-label={l.regenerate}
            whileTap={{ scale: 0.88 }}
            transition={springSoft}
            className={btn}
            onClick={() => {
              if (spin.current) animate(spin.current, { rotate: [0, 360] }, { duration: 0.6, ease: [0.65, 0, 0.35, 1] });
              onRegenerate();
            }}
          >
            <span ref={spin} className="grid"><RefreshCw className="size-4" /></span>
          </motion.button>
        </Tooltip>
      )}
    </div>
  );
}
