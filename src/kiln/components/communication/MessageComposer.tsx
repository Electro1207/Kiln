import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { ArrowUp, FileText, Image as ImageIcon, Paperclip, X } from "lucide-react";
import { cn } from "../../cn";
import { fade, spring, springFirm, springSnappy } from "../../motion";

export type Attachment = { id: string; name: string; size: number; kind: "image" | "file" };

/** Text used by MessageComposer. Pass a partial via `labels` to translate or reword. */
export interface MessageComposerLabels {
  /** aria-label of the attachment list. */
  attachments: string;
  /** aria-label of an attachment's remove button, given the file name. */
  remove: (name: string) => string;
  /** aria-label of the attach button. */
  attach: string;
  /** aria-label of the send button. */
  send: string;
  /** Human-readable file size, given bytes. */
  fileSize: (bytes: number) => string;
}
export const messageComposerLabels: MessageComposerLabels = {
  attachments: "Attachments",
  remove: (name) => `Remove ${name}`,
  attach: "Attach files",
  send: "Send",
  fileSize: (n) => (n < 1024 ? `${n} B` : n < 1024 ** 2 ? `${(n / 1024).toFixed(0)} KB` : `${(n / 1024 ** 2).toFixed(1)} MB`),
};

/**
 * A chat input. Grows with its text, holds attachments as chips, and its send
 * button fills in once there is something to send. Enter sends, Shift+Enter
 * starts a new line.
 */
export function MessageComposer({
  onSend, placeholder = "Write a message", maxRows = 8, className, label = "Message", labels,
}: {
  onSend: (text: string, attachments: Attachment[]) => void;
  placeholder?: string;
  maxRows?: number;
  className?: string;
  label?: string;
  /** Override any UI text. Merged over `messageComposerLabels`. */
  labels?: Partial<MessageComposerLabels>;
}) {
  const l = { ...messageComposerLabels, ...labels };
  const [text, setText] = useState("");
  const [files, setFiles] = useState<Attachment[]>([]);
  const area = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const height = useMotionValue<number>(24);
  const [capped, setCapped] = useState(false);
  const ready = text.trim().length > 0 || files.length > 0;

  useLayoutEffect(() => {
    const t = area.current;
    if (!t) return;
    const line = parseFloat(getComputedStyle(t).lineHeight) || 24;
    const prev = t.style.height;
    t.style.height = "0px";
    const target = Math.min(Math.max(t.scrollHeight, line), line * maxRows);
    setCapped(t.scrollHeight > line * maxRows);
    t.style.height = prev;
    animate(height, target, springFirm);
  }, [text, maxRows, height]);

  const send = () => {
    if (!ready) return;
    onSend(text.trim(), files);
    setText("");
    setFiles([]);
    area.current?.focus();
  };

  const add = (list: FileList | null) => {
    if (!list) return;
    setFiles((f) => [...f, ...Array.from(list).map((x, i) => ({ id: `${Date.now()}-${i}-${x.name}`, name: x.name, size: x.size, kind: (x.type.startsWith("image/") ? "image" : "file") as Attachment["kind"] }))]);
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col rounded-sheet border border-line-strong bg-surface transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20",
        className,
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
    >
      <AnimatePresence initial={false}>
        {files.length > 0 && (
          <motion.ul
            key="files"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
            className="flex flex-wrap gap-2 px-3 pt-3"
            aria-label={l.attachments}
          >
            <AnimatePresence initial={false} mode="popLayout">
              {files.map((f) => (
                <motion.li
                  key={f.id}
                  layout="position"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.12 } }}
                  transition={spring}
                  className="flex h-9 max-w-full items-center gap-2 rounded-control bg-raised pl-2.5 pr-1 text-[13px]"
                >
                  {f.kind === "image" ? <ImageIcon className="size-4 shrink-0 text-muted" /> : <FileText className="size-4 shrink-0 text-muted" />}
                  <span className="min-w-0 truncate text-ink">{f.name}</span>
                  <span className="shrink-0 text-faint tabular">{l.fileSize(f.size)}</span>
                  <button type="button" aria-label={l.remove(f.name)} onClick={() => setFiles((all) => all.filter((x) => x.id !== f.id))}
                    className="grid size-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-active hover:text-ink">
                    <X className="size-3.5" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>
      <div className="flex items-end gap-2 p-2">
        <button type="button" aria-label={l.attach} onClick={() => picker.current?.click()}
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink">
          <Paperclip className="size-[18px]" />
        </button>
        <input ref={picker} type="file" multiple className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
        <motion.textarea
          ref={area}
          rows={1}
          aria-label={label}
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); }
          }}
          style={{ height, overflowY: capped ? "auto" : "hidden" }}
          className="my-1.5 min-w-0 flex-1 resize-none self-center bg-transparent p-0 text-sm leading-6 text-ink outline-none placeholder:text-faint"
        />
        <motion.button
          type="button"
          aria-label={l.send}
          aria-disabled={!ready}
          onClick={send}
          whileTap={ready ? { scale: 0.9 } : undefined}
          transition={springSnappy}
          className={cn(
            "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-full transition-colors duration-300 ease-out-soft",
            ready ? "bg-btn-primary text-btn-primary-ink hover:bg-btn-primary-hover" : "cursor-default bg-raised text-faint",
          )}
        >
          <motion.span className="grid" initial={false} animate={{ rotate: ready ? 0 : 90 }} transition={spring}>
            <ArrowUp className="size-[18px]" strokeWidth={2.25} />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}
