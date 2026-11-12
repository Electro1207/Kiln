import { useId, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { springSoft } from "../../motion";
import { Avatar } from "../data-display/Avatar";
import { Button } from "../buttons/Button";

export type FeedEntry =
  | { kind: "comment"; id: string; author: string; avatar?: string; time: string; dateTime?: string; body: ReactNode }
  | { kind: "event"; id: string; icon: ReactNode; text: ReactNode; time: string; dateTime?: string };

/** Text used by CommentFeed. Pass a partial via `labels` to translate or reword. */
export interface CommentFeedLabels {
  /** Label and placeholder of the comment box. */
  addComment: string;
  /** Hint beside the submit button. */
  sendHint: string;
  /** Submit button text. */
  comment: string;
}
export const commentFeedLabels: CommentFeedLabels = { addComment: "Add a comment", sendHint: "Ctrl + Enter to send", comment: "Comment" };

/**
 * A thread of comments mixed with system events, with a box to add a comment.
 * Unlike Timeline, people's words sit in their own bubbles; a new comment rises
 * into place at the end.
 */
export function CommentFeed({
  entries, me, value, defaultValue = "", onChange, onComment, className, labels,
}: {
  entries: FeedEntry[];
  /** The current person, shown beside the composer. */
  me: { name: string; avatar?: string };
  /** Controlled draft text. Leave out to let the box keep its own; it clears after a send. */
  value?: string;
  /** Where the uncontrolled draft starts. Default empty. */
  defaultValue?: string;
  /** Called with the new draft text, controlled or not. */
  onChange?: (text: string) => void;
  onComment: (text: string) => void;
  className?: string;
  /** Override any UI text. Merged over `commentFeedLabels`. */
  labels?: Partial<CommentFeedLabels>;
}) {
  const l = { ...commentFeedLabels, ...labels };
  const [draft, setDraft] = useControllable(value, defaultValue, onChange);
  const id = useId();
  const submit = () => {
    const t = draft.trim();
    if (!t) return;
    onComment(t);
    setDraft("");
  };
  return (
    <div className={cn("flex w-full flex-col", className)}>
      <ol className="flex flex-col">
        <AnimatePresence initial={false}>
          {entries.map((e, i) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={springSoft}
              className="relative flex gap-3 pb-6"
            >
              {i < entries.length - 1 && <span aria-hidden className="absolute bottom-0 left-[17px] top-11 w-0.5 rounded-full bg-line" />}
              {e.kind === "comment" ? (
                <>
                  <Avatar name={e.author} src={e.avatar} size="md" />
                  <div className="min-w-0 flex-1 rounded-card border border-line bg-surface p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="text-sm font-medium text-ink">{e.author}</span>
                      <time dateTime={e.dateTime} className="tabular text-xs text-muted">{e.time}</time>
                    </div>
                    <div className="mt-1 text-sm text-ink">{e.body}</div>
                  </div>
                </>
              ) : (
                <>
                  <span aria-hidden className="relative grid size-9 shrink-0 place-items-center rounded-full bg-raised text-muted ring-4 ring-surface [&>svg]:size-4">
                    {e.icon}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 pt-2 text-sm text-muted">
                    <span className="min-w-0">{e.text}</span>
                    <time dateTime={e.dateTime} className="tabular text-xs">{e.time}</time>
                  </div>
                </>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
      <form
        className="flex gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <Avatar name={me.name} src={me.avatar} size="md" />
        <div className="min-w-0 flex-1 overflow-hidden rounded-card border border-line-strong bg-surface transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20">
          <label htmlFor={id} className="sr-only">{l.addComment}</label>
          <textarea
            id={id}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={l.addComment}
            className="block w-full resize-none bg-transparent px-3 pt-2.5 text-sm text-ink outline-none placeholder:text-faint"
          />
          <div className="flex items-center justify-between gap-2 px-2 pb-2">
            <span className="pl-1 text-xs text-faint">{l.sendHint}</span>
            <Button type="submit" size="sm" disabled={!draft.trim()}>
              {l.comment}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
