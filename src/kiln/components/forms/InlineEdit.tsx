import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";

/** Text used by InlineEdit. Pass a partial via `labels` to translate or reword. */
export interface InlineEditLabels {
  /** aria-label of the edit button, given the field label and the current text (or placeholder). */
  edit: (label: string, text: string) => string;
}
export const inlineEditLabels: InlineEditLabels = { edit: (label, text) => `${label}: ${text}. Edit` };

/**
 * Text that edits in place. Click it or press Enter to edit; Enter or leaving
 * the field saves, Escape puts the old text back. Text and field are the same
 * size, so nothing around it moves when editing starts.
 * Controlled with `value` + `onChange`, or uncontrolled with `defaultValue`.
 */
export function InlineEdit({
  value: valueProp, defaultValue = "", onChange: onChangeProp, label, placeholder = "Untitled", className, textClassName = "text-sm", maxLength = 80, labels,
}: {
  /** The text; leave out to let the component keep it. */
  value?: string;
  /** Starting text when uncontrolled. */
  defaultValue?: string;
  /** Called with the saved text. */
  onChange?: (v: string) => void;
  /** Accessible name, e.g. "Ship name". */
  label: string;
  placeholder?: string;
  className?: string;
  /** Type size and weight, shared by the text and the field. */
  textClassName?: string;
  maxLength?: number;
  /** Override any UI text. Merged over `inlineEditLabels`. */
  labels?: Partial<InlineEditLabels>;
}) {
  const l = { ...inlineEditLabels, ...labels };
  const [value, onChange] = useControllable<string>(valueProp, defaultValue, onChangeProp);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const input = useRef<HTMLInputElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  useEffect(() => {
    if (editing) { input.current?.focus(); input.current?.select(); }
    else if (wasEditing.current) button.current?.focus({ preventScroll: true });
    wasEditing.current = editing;
  }, [editing]);

  const start = () => { setDraft(value); setEditing(true); };
  const commit = () => {
    const v = draft.trim();
    if (v && v !== value) onChange(v);
    setEditing(false);
  };
  const cancel = () => { setDraft(value); setEditing(false); };

  const shown = editing ? draft : value;
  const box = "col-start-1 row-start-1 rounded-md px-1.5 py-0.5";

  return (
    <span className={cn("group relative -mx-1.5 inline-grid w-fit max-w-full grid-cols-[minmax(0,max-content)] align-baseline", className)}>
      <span aria-hidden className={cn(box, textClassName, "invisible overflow-hidden whitespace-pre pr-7")}>{shown || placeholder}</span>
      {editing ? (
        <input
          ref={input}
          aria-label={label}
          // size=1 drops the input's default ~20-character width; the measuring copy sets it instead.
          size={1}
          value={draft}
          maxLength={maxLength}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); commit(); }
            if (e.key === "Escape") { e.preventDefault(); cancel(); }
          }}
          placeholder={placeholder}
          className={cn(box, textClassName, "w-full min-w-0 bg-surface text-ink outline-none ring-2 ring-accent/50 placeholder:text-faint")}
        />
      ) : (
        <button
          ref={button}
          type="button"
          onClick={start}
          aria-label={l.edit(label, value || placeholder)}
          className={cn(box, textClassName, "flex w-full min-w-0 items-center text-left text-ink transition-colors duration-200 hover:bg-raised")}
        >
          <span className={cn("truncate", !value && "text-faint")}>{value || placeholder}</span>
          <span aria-hidden className="ml-auto grid shrink-0 pl-2 text-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
            <Pencil className="size-3.5" />
          </span>
        </button>
      )}
    </span>
  );
}
