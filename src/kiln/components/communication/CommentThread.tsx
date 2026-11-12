import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Laugh, MoreHorizontal, Pencil, ThumbsUp, Trash2 } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm, springSnappy, springSoft } from "../../motion";
import { Avatar } from "../data-display/Avatar";
import { Button } from "../buttons/Button";
import { DropdownMenu } from "../menus/DropdownMenu";

export type ReactionKind = "agree" | "love" | "funny";

export type Comment = {
  id: string;
  author: string;
  time: string;
  text: string;
  reactions: Partial<Record<ReactionKind, number>>;
  /** The reactions the viewer has given. */
  mine?: ReactionKind[];
  edited?: boolean;
  replies?: Comment[];
};

/** Text used by CommentThread. Pass a partial via `labels` to translate or reword. */
export interface CommentThreadLabels {
  /** aria-label of a comment, given the author. */
  commentBy: (author: string) => string;
  /** Suffix after the time on an edited comment (keep the leading " · "). */
  edited: string;
  /** Time shown on a reply just posted. */
  justNow: string;
  /** aria-label of the own-comment menu. */
  actionsMenu: string;
  /** aria-label of the own-comment menu trigger. */
  actions: string;
  edit: string;
  delete: string;
  /** Reaction names by kind. */
  reactions: Record<ReactionKind, string>;
  /** aria-label of a reaction chip, given the name and count. */
  reactionCount: (name: string, count: number) => string;
  /** Label of the add-reaction menu and button. */
  addReaction: string;
  reply: string;
  /** Placeholder of the reply box, given the first name of the author. */
  replyTo: (firstName: string) => string;
  /** Edit box save button. */
  save: string;
  cancel: string;
  /** Fallback label of a composer box that has no placeholder. */
  comment: string;
}
export const commentThreadLabels: CommentThreadLabels = {
  commentBy: (author) => `Comment by ${author}`,
  edited: " · edited",
  justNow: "Just now",
  actionsMenu: "Actions for your comment",
  actions: "Comment actions",
  edit: "Edit",
  delete: "Delete",
  reactions: { agree: "Agree", love: "Love", funny: "Funny" },
  reactionCount: (name, count) => `${name}, ${count}`,
  addReaction: "Add a reaction",
  reply: "Reply",
  replyTo: (first) => `Reply to ${first}`,
  save: "Save",
  cancel: "Cancel",
  comment: "Comment",
};

export type CommentThreadProps = {
  comments: Comment[];
  onChange: (comments: Comment[]) => void;
  /** The viewer's name: their comments get Edit and Delete. */
  me: string;
  /** How deep replies may nest. Default 2 (a comment and its replies). */
  maxDepth?: number;
  className?: string;
  /** Override any UI text. Merged over `commentThreadLabels`. */
  labels?: Partial<CommentThreadLabels>;
};

const REACTIONS: Array<{ kind: ReactionKind; icon: ReactNode }> = [
  { kind: "agree", icon: <ThumbsUp className="size-3.5" /> },
  { kind: "love", icon: <Heart className="size-3.5" /> },
  { kind: "funny", icon: <Laugh className="size-3.5" /> },
];

let made = 0;

const mapTree = (list: Comment[], id: string, fn: (c: Comment) => Comment | null): Comment[] =>
  list.flatMap((c) => {
    if (c.id === id) {
      const r = fn(c);
      return r ? [r] : [];
    }
    return [{ ...c, replies: c.replies ? mapTree(c.replies, id, fn) : c.replies }];
  });

/**
 * A discussion with replies, reactions and an Edit / Delete menu on your own
 * comments. Counts roll when they change; deleted comments fold away.
 */
export function CommentThread({ comments, onChange, me, maxDepth = 2, className, labels }: CommentThreadProps) {
  const l = { ...commentThreadLabels, ...labels };
  return (
    <div className={cn("space-y-1", className)}>
      <CommentList list={comments} depth={1} root={comments} onChange={onChange} me={me} maxDepth={maxDepth} l={l} />
    </div>
  );
}

type ListProps = { list: Comment[]; depth: number; root: Comment[]; onChange: (c: Comment[]) => void; me: string; maxDepth: number; l: CommentThreadLabels };

function CommentList({ list, depth, ...rest }: ListProps) {
  return (
    <AnimatePresence initial={false}>
      {list.map((c) => (
        <motion.div
          key={c.id}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1, transition: { height: springFirm, opacity: { ...fade, delay: 0.08 } } }}
          exit={{ height: 0, opacity: 0, transition: { height: { ...springFirm, delay: 0.1 }, opacity: { duration: 0.14, ease: easeOut } } }}
          className="-mx-[3px] overflow-hidden px-[3px]"
        >
          <CommentItem comment={c} depth={depth} {...rest} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

function CommentItem({ comment: c, depth, root, onChange, me, maxDepth, l }: Omit<ListProps, "list"> & { comment: Comment }) {
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const mineComment = c.author === me;
  const update = (fn: (c: Comment) => Comment | null) => onChange(mapTree(root, c.id, fn));

  const toggleReaction = (kind: ReactionKind) =>
    update((x) => {
      const has = x.mine?.includes(kind);
      const count = (x.reactions[kind] ?? 0) + (has ? -1 : 1);
      return {
        ...x,
        reactions: { ...x.reactions, [kind]: count },
        mine: has ? (x.mine ?? []).filter((k) => k !== kind) : [...(x.mine ?? []), kind],
      };
    });

  return (
    <article className="flex gap-3 py-3" aria-label={l.commentBy(c.author)}>
      <Avatar name={c.author} size={depth > 1 ? "sm" : "md"} className={depth > 1 ? "mt-0.5" : undefined} />
      <div className="min-w-0 flex-1">
        <div className="flex h-6 items-center gap-2">
          <span className="truncate text-sm font-semibold">{c.author}</span>
          <span className="shrink-0 text-xs text-faint">
            {c.time}
            {c.edited && l.edited}
          </span>
          {mineComment && !editing && (
            <span className="ml-auto">
              <DropdownMenu
                label={l.actionsMenu}
                placement="bottom-end"
                items={[
                  { label: l.edit, icon: <Pencil className="size-4" />, onSelect: () => setEditing(true) },
                  { label: l.delete, icon: <Trash2 className="size-4" />, danger: true, onSelect: () => update(() => null) },
                ]}
                trigger={({ open, ...p }) => (
                  <button
                    {...p}
                    type="button"
                    aria-label={l.actions}
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink",
                      open && "bg-raised text-ink",
                    )}
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                )}
              />
            </span>
          )}
        </div>

        <AutoHeight>
          <AnimatePresence initial={false} mode="wait">
            {editing ? (
              <Composer
                key="edit"
                initial={c.text}
                submitLabel={l.save} l={l}
                onCancel={() => setEditing(false)}
                onSubmit={(text) => {
                  update((x) => ({ ...x, text, edited: true }));
                  setEditing(false);
                }}
              />
            ) : (
              <motion.p
                key="text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={fade}
                className="mt-0.5 text-[14px] leading-[21px] text-ink [overflow-wrap:anywhere]"
              >
                {c.text}
              </motion.p>
            )}
          </AnimatePresence>
        </AutoHeight>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {REACTIONS.map((r) => {
            const count = c.reactions[r.kind] ?? 0;
            const on = !!c.mine?.includes(r.kind);
            if (count === 0 && !on) return null;
            return (
              <motion.button
                key={r.kind}
                type="button"
                aria-pressed={on}
                aria-label={l.reactionCount(l.reactions[r.kind], count)}
                whileTap={{ scale: 0.92 }}
                transition={springSoft}
                onClick={() => toggleReaction(r.kind)}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors duration-200",
                  on ? "border-accent text-accent" : "border-line text-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {r.icon}
                <Count value={count} />
              </motion.button>
            );
          })}
          <AddReaction comment={c} onPick={toggleReaction} l={l} />
          {depth < maxDepth && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              aria-expanded={replying}
              className="h-7 rounded-full px-2.5 text-xs font-medium text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              {l.reply}
            </button>
          )}
        </div>

        <AnimatePresence initial={false}>
          {replying && (
            <motion.div
              key="reply"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0, transition: { height: springFirm, opacity: { duration: 0.12 } } }}
              transition={{ height: springFirm, opacity: { ...fade, delay: 0.06 } }}
              className="-mx-[3px] overflow-hidden px-[3px]"
            >
              <div className="pt-3">
                <Composer
                  initial=""
                  autoFocus
                  placeholder={l.replyTo(c.author.split(" ")[0])}
                  submitLabel={l.reply}
                  l={l}
                  onCancel={() => setReplying(false)}
                  onSubmit={(text) => {
                    const reply: Comment = { id: `reply-${++made}`, author: me, time: l.justNow, text, reactions: {} };
                    update((x) => ({ ...x, replies: [...(x.replies ?? []), reply] }));
                    setReplying(false);
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {c.replies && c.replies.length > 0 && (
          <div className="mt-1">
            <CommentList list={c.replies} depth={depth + 1} root={root} onChange={onChange} me={me} maxDepth={maxDepth} l={l} />
          </div>
        )}
      </div>
    </article>
  );
}

/** Animates its own height to whatever its content measures, so swaps inside never jump. */
function AutoHeight({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState<number | "auto">("auto");
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // The 3px bleed keeps focus rings inside the clip.
  return (
    <motion.div initial={false} animate={{ height: h }} transition={springFirm} className="-m-[3px] overflow-hidden">
      <div ref={inner} className="p-[3px]">{children}</div>
    </motion.div>
  );
}

/** The number on a reaction: the old value rolls out as the new one rolls in, in one fixed cell. */
function Count({ value }: { value: number }) {
  const [prev, setPrev] = useState(value);
  const [dir, setDir] = useState(1);
  if (prev !== value) {
    setDir(value > prev ? 1 : -1);
    setPrev(value);
  }
  return (
    <span className="tabular relative grid h-4 min-w-[1ch] overflow-hidden leading-4 [&>*]:[grid-area:1/1]">
      <AnimatePresence initial={false} custom={dir}>
        <motion.span
          key={value}
          custom={dir}
          variants={{
            enter: (d: number) => ({ y: d * 12, opacity: 0 }),
            center: { y: 0, opacity: 1 },
            exit: (d: number) => ({ y: d * -12, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={springSnappy}
          className="text-center"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function AddReaction({ comment, onPick, l }: { comment: Comment; onPick: (k: ReactionKind) => void; l: CommentThreadLabels }) {
  return (
    <DropdownMenu
      label={l.addReaction}
      items={REACTIONS.map((r) => ({
        type: "checkbox" as const,
        label: l.reactions[r.kind],
        checked: !!comment.mine?.includes(r.kind),
        onCheckedChange: () => onPick(r.kind),
      }))}
      trigger={({ open, ...p }) => (
        <button
          {...p}
          type="button"
          aria-label={l.addReaction}
          className={cn(
            "grid h-7 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink",
            open && "bg-raised text-ink",
          )}
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <circle cx="7" cy="8.5" r="5" />
            <path d="M5.2 9.8a2.4 2.4 0 0 0 3.6 0M5.4 7h.01M8.6 7h.01M13 1.5v4M11 3.5h4" />
          </svg>
        </button>
      )}
    />
  );
}

type ComposerProps = {
  initial: string;
  submitLabel: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSubmit: (text: string) => void;
  onCancel: () => void;
  l: CommentThreadLabels;
};

function Composer({ initial, submitLabel, placeholder, autoFocus, onSubmit, onCancel, l }: ComposerProps) {
  const [text, setText] = useState(initial);
  const id = useId();
  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.1 } }}
      transition={springSoft}
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onSubmit(text.trim());
      }}
      className="mt-1"
    >
      <label htmlFor={id} className="sr-only">{placeholder ?? l.comment}</label>
      <textarea
        id={id}
        autoFocus={autoFocus ?? true}
        value={text}
        rows={2}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") { e.stopPropagation(); onCancel(); }
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && text.trim()) onSubmit(text.trim());
        }}
        className="block w-full resize-none rounded-control border border-line-strong bg-surface px-3 py-2 text-[14px] leading-[21px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-faint focus:border-accent focus:ring-2 focus:ring-accent-soft"
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>{l.cancel}</Button>
        <Button type="submit" size="sm" disabled={!text.trim()}>{submitLabel}</Button>
      </div>
    </motion.form>
  );
}
