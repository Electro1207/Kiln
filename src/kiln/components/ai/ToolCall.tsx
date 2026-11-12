import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ban, Check, ChevronDown, Loader2, ShieldQuestion, Wrench } from "lucide-react";
import { cn } from "../../cn";
import { fade, springFirm } from "../../motion";
import { Button } from "../buttons/Button";

export type ToolCallState = "pending" | "running" | "done" | "denied";

/** Text used by ToolCall. Pass a partial via `labels` to translate or reword. */
export interface ToolCallLabels {
  /** Status chip while waiting for the person to decide. */
  pending: string;
  /** Status chip while the tool runs. */
  running: string;
  /** Status chip once the tool has finished. */
  done: string;
  /** Status chip after the person denied the call. */
  denied: string;
  /** Approve button. */
  approve: string;
  /** Deny button. */
  deny: string;
}
export const toolCallLabels: ToolCallLabels = { pending: "Needs approval", running: "Running", done: "Completed", denied: "Denied", approve: "Approve", deny: "Deny" };

export type ToolCallProps = {
  /** The tool's name, e.g. open_pod_bay_doors. */
  name: string;
  /** One line on what it will do, in plain words. */
  summary: string;
  args: Record<string, string | number | boolean>;
  state: ToolCallState;
  /** Shown once the tool has run or was denied. */
  result?: ReactNode;
  onApprove?: () => void;
  onDeny?: () => void;
  className?: string;
  /** Override any UI text. Merged over `toolCallLabels`. */
  labels?: Partial<ToolCallLabels>;
};

const states: Record<ToolCallState, { tone: string; icon: ReactNode }> = {
  pending: { tone: "bg-warning-soft text-warning", icon: <ShieldQuestion className="size-3.5" /> },
  running: { tone: "bg-info-soft text-info", icon: <Loader2 className="size-3.5 animate-spin" /> },
  done: { tone: "bg-positive-soft text-positive", icon: <Check className="size-3.5" /> },
  denied: { tone: "bg-active text-muted", icon: <Ban className="size-3.5" /> },
};

/**
 * A tool the assistant wants to use, shown before it runs. Its arguments are
 * laid out plainly; Approve or Deny decides. The status chip cross-fades and
 * the result folds in below.
 */
export function ToolCall({ name, summary, args, state, result, onApprove, onDeny, className, labels }: ToolCallProps) {
  const l = { ...toolCallLabels, ...labels };
  const [open, setOpen] = useState(true);
  return (
    <div className={cn("overflow-hidden rounded-card border border-line bg-surface", className)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-raised"
      >
        <span className="grid size-8 shrink-0 place-items-center rounded-[10px] bg-raised text-muted"><Wrench className="size-4" /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-[13px] font-medium">{name}</span>
          <span className="block truncate text-[13px] text-muted">{summary}</span>
        </span>
        {/* Every status chip sits in one cell; the cell keeps the widest, so nothing shifts. */}
        <span className="grid shrink-0 justify-items-end [&>*]:[grid-area:1/1]">
          {(Object.keys(states) as ToolCallState[]).map((k) => (
            <motion.span
              key={k}
              initial={false}
              animate={{ opacity: k === state ? 1 : 0 }}
              transition={fade}
              aria-hidden={k !== state}
              className={cn("inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-xs font-medium", states[k].tone)}
            >
              {states[k].icon}
              {l[k]}
            </motion.span>
          ))}
        </span>
        <ChevronDown className={cn("size-4 shrink-0 text-muted transition-transform duration-300 ease-out-soft", open && "rotate-180")} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: springFirm, opacity: fade }}
            className="overflow-hidden"
          >
            <div className="border-t border-line px-4 pb-4 pt-3">
              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-[13px]">
                {Object.entries(args).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="font-mono text-muted">{k}</dt>
                    <dd className="min-w-0 break-words font-mono text-ink">{typeof v === "string" ? `"${v}"` : String(v)}</dd>
                  </div>
                ))}
              </dl>

              <AnimatePresence initial={false} mode="wait">
                {state === "pending" ? (
                  <motion.div key="ask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={onApprove}>{l.approve}</Button>
                    <Button size="sm" variant="secondary" onClick={onDeny}>{l.deny}</Button>
                  </motion.div>
                ) : result && state !== "running" ? (
                  <motion.div key="result" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={fade} className="mt-4 rounded-[10px] bg-raised px-3 py-2.5 text-[13.5px] leading-5">
                    {result}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
