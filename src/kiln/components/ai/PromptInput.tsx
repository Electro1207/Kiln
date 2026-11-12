import { useId, useLayoutEffect, useMemo, useRef, type KeyboardEvent, type ReactNode } from "react";
import { animate, AnimatePresence, motion, useMotionValue } from "motion/react";
import { ArrowUp, ChevronDown, FileText, Paperclip, X } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, springFirm, springSoft } from "../../motion";
import { DropdownMenu } from "../menus/DropdownMenu";

export type PromptAttachment = { id: string; name: string; size: string };
export type PromptModel = { id: string; name: string; note?: string; disabled?: boolean };

/** Text used by PromptInput. Pass a partial via `labels` to translate or reword. */
export interface PromptInputLabels {
  /** Default placeholder (and hidden label) of the text area; the `placeholder` prop wins. */
  placeholder: string;
  /** aria-label of the remove button on an attachment. */
  removeAttachment: (name: string) => string;
  /** aria-label of the attach-files button. */
  attachFiles: string;
  /** Label of the model menu. */
  model: string;
  /** aria-label of the send button. */
  send: string;
  /** aria-label of the send button while streaming. */
  stop: string;
  /** Size shown on an attachment picked from disk, from its byte count. */
  fileSize: (bytes: number) => string;
}
export const promptInputLabels: PromptInputLabels = {
  placeholder: "Ask anything",
  removeAttachment: (name) => `Remove ${name}`,
  attachFiles: "Attach files",
  model: "Model",
  send: "Send",
  stop: "Stop generating",
  fileSize: (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`),
};

export type PromptInputProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  /** While a reply is streaming the send button becomes Stop. */
  streaming?: boolean;
  onStop?: () => void;
  models?: PromptModel[];
  model?: string;
  onModelChange?: (id: string) => void;
  attachments?: PromptAttachment[];
  onAttachmentsChange?: (a: PromptAttachment[]) => void;
  placeholder?: string;
  /** Extra controls in the toolbar, left of the send button. */
  tools?: ReactNode;
  maxRows?: number;
  className?: string;
  /** Override any UI text. Merged over `promptInputLabels`. */
  labels?: Partial<PromptInputLabels>;
  /** Replace any built-in icon. Merged over `promptInputIcons`. */
  icons?: Partial<PromptInputIcons>;
};

/** Icons used by PromptInput. Pass a partial via `icons` to replace any. */
export interface PromptInputIcons {
  /** Attach-files button. */
  attach: ReactNode;
  /** Beside each attachment. */
  file: ReactNode;
  /** Remove button on an attachment. */
  remove: ReactNode;
  /** The chevron on the model picker. */
  chevron: ReactNode;
  /** Send button. */
  send: ReactNode;
  /** Send button while a reply streams. */
  stop: ReactNode;
}
export const promptInputIcons: PromptInputIcons = {
  attach: <Paperclip />,
  file: <FileText />,
  remove: <X />,
  chevron: <ChevronDown />,
  send: <ArrowUp />,
  stop: <svg viewBox="0 0 12 12"><rect width="12" height="12" rx="3" fill="currentColor" /></svg>,
};

const LINE = 22;

/**
 * The composer for an assistant: grows with its text, carries attachments
 * above it, picks a model, and turns Send into Stop while a reply streams.
 * Enter sends, Shift+Enter starts a new line.
 */
export function PromptInput({
  value, onChange, onSubmit, streaming, onStop, models, model, onModelChange, attachments = [], onAttachmentsChange,
  placeholder: placeholderProp, tools, maxRows = 8, className, labels, icons,
}: PromptInputProps) {
  const l = { ...promptInputLabels, ...labels };
  const ic = useMemo(() => ({ ...promptInputIcons, ...icons }), [icons]);
  const placeholder = placeholderProp ?? l.placeholder;
  const id = useId();
  const area = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const height = useMotionValue(LINE);
  const first = useRef(true);

  // Grow with the text: measure, then ease the height so new lines never jump.
  useLayoutEffect(() => {
    const t = area.current;
    if (!t) return;
    const prev = t.style.height;
    t.style.height = "0px";
    const target = Math.min(Math.max(t.scrollHeight, LINE), LINE * maxRows);
    t.style.height = prev;
    if (first.current) {
      height.set(target);
      first.current = false;
    } else animate(height, target, springFirm);
  }, [value, maxRows, height]);

  const canSend = value.trim().length > 0 && !streaming;
  const send = () => canSend && onSubmit(value.trim());
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };
  const current = models?.find((m) => m.id === model);

  return (
    <div
      className={cn(
        "rounded-[20px] border border-line-strong bg-surface text-ink transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft",
        className,
      )}
      onClick={(e) => e.target === e.currentTarget && area.current?.focus()}
    >
      <AnimatePresence initial={false}>
        {attachments.length > 0 && (
          <motion.div
            key="files"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ height: springFirm, opacity: fade }}
            className="overflow-hidden"
          >
            <ul className="flex flex-wrap gap-2 px-3 pt-3">
              <AnimatePresence initial={false}>
                {attachments.map((a) => (
                  <motion.li
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.14, ease: easeOut } }}
                    transition={springSoft}
                    className="flex h-11 items-center gap-2.5 rounded-[12px] bg-raised pl-2 pr-1.5"
                  >
                    <span className="grid size-7 place-items-center rounded-[8px] bg-surface text-muted"><span className="grid [&>svg]:size-4" aria-hidden>{ic.file}</span></span>
                    <span className="min-w-0">
                      <span className="block max-w-40 truncate text-[13px] font-medium leading-4">{a.name}</span>
                      <span className="block text-[11.5px] leading-4 text-muted">{a.size}</span>
                    </span>
                    <button
                      type="button"
                      aria-label={l.removeAttachment(a.name)}
                      onClick={() => onAttachmentsChange?.(attachments.filter((x) => x.id !== a.id))}
                      className="grid size-6 place-items-center rounded-full text-muted transition-colors hover:bg-active hover:text-ink"
                    >
                      <span className="grid [&>svg]:size-3.5" aria-hidden>{ic.remove}</span>
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <motion.textarea
        ref={area}
        id={id}
        rows={1}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKey}
        style={{ height }}
        className="block w-full resize-none bg-transparent px-4 pt-3.5 text-[15px] leading-[22px] text-ink outline-none placeholder:text-faint"
      />

      <div className="flex items-center gap-1.5 p-2 pl-2.5">
        {onAttachmentsChange && (
          <>
            <input
              ref={file}
              type="file"
              multiple
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                const added = Array.from(e.target.files ?? []).map((f) => ({
                  id: `${f.name}-${f.lastModified}`,
                  name: f.name,
                  size: l.fileSize(f.size),
                }));
                onAttachmentsChange([...attachments, ...added]);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              aria-label={l.attachFiles}
              onClick={() => file.current?.click()}
              className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <span className="grid [&>svg]:size-[18px]" aria-hidden>{ic.attach}</span>
            </button>
          </>
        )}
        {models && current && (
          <DropdownMenu
            label={l.model}
            items={models.map((m) => ({
              type: "checkbox" as const,
              label: m.note ? `${m.name} · ${m.note}` : m.name,
              checked: m.id === model,
              disabled: m.disabled,
              onCheckedChange: () => onModelChange?.(m.id),
            }))}
            trigger={({ open, ...p }) => (
              <button
                {...p}
                type="button"
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-muted transition-colors hover:bg-raised hover:text-ink",
                  open && "bg-raised text-ink",
                )}
              >
                {current.name}
                <span className={cn("grid transition-transform duration-300 [&>svg]:size-3.5", open && "rotate-180")} aria-hidden>{ic.chevron}</span>
              </button>
            )}
          />
        )}
        <span className="flex-1" />
        {tools}
        <motion.button
          type="button"
          onClick={streaming ? onStop : send}
          disabled={!streaming && !canSend}
          aria-label={streaming ? l.stop : l.send}
          whileTap={{ scale: 0.9 }}
          transition={springSoft}
          className="grid size-9 place-items-center rounded-full bg-btn-primary text-btn-primary-ink transition-[background-color,opacity] duration-200 hover:bg-btn-primary-hover disabled:opacity-35 [&>*]:[grid-area:1/1]"
        >
          <motion.span initial={false} animate={{ opacity: streaming ? 0 : 1, scale: streaming ? 0.6 : 1 }} transition={springFirm} className="grid place-items-center [&>svg]:size-[18px] [&>svg]:stroke-[2.25]" aria-hidden>
            {ic.send}
          </motion.span>
          <motion.span initial={false} animate={{ opacity: streaming ? 1 : 0, scale: streaming ? 1 : 0.6 }} transition={springFirm} className="grid place-items-center [&>svg]:size-3" aria-hidden>
            {ic.stop}
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}
