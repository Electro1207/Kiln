import { useEffect, useRef, useState, type ReactNode } from "react";
import { animate, AnimatePresence, motion, useMotionValue, useTransform, type AnimationPlaybackControls } from "motion/react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm } from "../../motion";

/** Text used by UndoBar. Pass a partial via `labels` to translate or reword. */
export interface UndoBarLabels {
  /** The undo button. */
  undo: string;
}
export const undoBarLabels: UndoBarLabels = { undo: "Undo" };

export type UndoItem = {
  /** Changes for every new deletion, so the timer restarts. */
  id: string;
  message: ReactNode;
};

export type UndoBarProps = {
  /** The last thing removed, or null when there is nothing to undo. */
  item: UndoItem | null;
  onUndo: (id: string) => void;
  /** The window closed without an undo: make the removal permanent. */
  onCommit: (id: string) => void;
  /** ms to change your mind. Default 6000. */
  duration?: number;
  /** Override any UI text. Merged over `undoBarLabels`. */
  labels?: Partial<UndoBarLabels>;
  className?: string;
};

/**
 * "Deleted X · Undo", in the flow of the page. A ring counts down the time
 * left and pauses while the pointer is on the bar. It opens and closes its
 * own space smoothly.
 */
export function UndoBar({ item, onUndo, onCommit, duration = 6000, labels, className }: UndoBarProps) {
  const l = { ...undoBarLabels, ...labels };
  // A deletion replaced by the next one before its time ran out is committed then.
  const resolved = useRef(new Set<string>());
  const prev = useRef<string | null>(null);
  const commitRef = useRef(onCommit);
  commitRef.current = onCommit;
  useEffect(() => {
    const before = prev.current;
    if (before && before !== item?.id && !resolved.current.has(before)) {
      resolved.current.add(before);
      commitRef.current(before);
    }
    prev.current = item?.id ?? null;
  }, [item?.id]);
  const undo = (id: string) => { resolved.current.add(id); onUndo(id); };
  const commit = (id: string) => { if (resolved.current.has(id)) return; resolved.current.add(id); onCommit(id); };

  return (
    <AnimatePresence initial={false}>
      {item && (
        <motion.div
          key="undo"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1, transition: { height: springFirm, opacity: { ...fade, delay: 0.06 } } }}
          exit={{ height: 0, opacity: 0, transition: { height: { ...springFirm, delay: 0.06 }, opacity: { duration: 0.14, ease: easeOut } } }}
          className="overflow-hidden"
        >
          <div className="pt-3">
            <div className="grid [&>*]:[grid-area:1/1]">
              <AnimatePresence initial={false}>
                <Bar key={item.id} item={item} onUndo={undo} onCommit={commit} duration={duration} undoText={l.undo} className={className} />
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Bar({ item, onUndo, onCommit, duration, undoText, className }: Required<Omit<UndoBarProps, "item" | "className" | "labels">> & { item: UndoItem; undoText: string; className?: string }) {
  const left = useMotionValue(1);
  const seconds = useTransform(left, (v) => Math.max(1, Math.ceil((v * duration) / 1000)));
  const controls = useRef<AnimationPlaybackControls | null>(null);
  const [paused, setPaused] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    controls.current = animate(left, 0, {
      duration: duration / 1000,
      ease: "linear",
      onComplete: () => {
        if (!done.current) {
          done.current = true;
          onCommit(item.id);
        }
      },
    });
    return () => controls.current?.stop();
    // A new item gets a new Bar (keyed), so this runs once per deletion.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (paused) controls.current?.pause();
    else controls.current?.play();
  }, [paused]);

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={fade}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn("flex h-11 items-center gap-3 rounded-card border border-line bg-surface pl-3 pr-1.5 text-[13.5px] text-ink", className)}
    >
      <span className="relative grid size-6 shrink-0 place-items-center" aria-hidden>
        <svg viewBox="0 0 24 24" className="absolute inset-0 -rotate-90">
          <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" className="stroke-active" />
          <motion.circle cx="12" cy="12" r="10" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-accent" style={{ pathLength: left }} />
        </svg>
        <motion.span className="tabular text-[10.5px] font-semibold leading-none text-muted">{seconds}</motion.span>
      </span>
      <span className="min-w-0 flex-1 truncate">{item.message}</span>
      <button
        type="button"
        onClick={() => {
          if (done.current) return;
          done.current = true;
          controls.current?.stop();
          onUndo(item.id);
        }}
        className="h-8 shrink-0 rounded-[6px] px-2.5 text-[13px] font-semibold text-accent transition-colors hover:bg-raised"
      >
        {undoText}
      </button>
    </motion.div>
  );
}
