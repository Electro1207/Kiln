import { useEffect, useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../cn";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { announce } from "../accessibility/announce";
import { Button } from "../buttons/Button";
import { TextField } from "../text-input/TextField";
import { Dialog } from "./Dialog";

/** Text used by TypeToConfirmDialog. Pass a partial via `labels` to translate or reword. */
export interface TypeToConfirmDialogLabels {
  /** Default cancel button text. */
  cancel: string;
  /** The line above the field. The text to type is passed as a node, so it can be set in a code style. */
  instruction: (text: ReactNode) => ReactNode;
  /** Plain-text version of the instruction, for the field's accessible name. */
  fieldLabel: (text: string) => string;
  /** Spoken when the text matches and the button is ready. */
  ready: string;
  /** Shown under the field when the text is as long as it should be but does not match. */
  mismatch: string;
  /** Extra sentence for screen reader users when `screenReaderHints` is on. */
  hint: string;
}
export const typeToConfirmDialogLabels: TypeToConfirmDialogLabels = {
  cancel: "Cancel",
  instruction: (t) => <>Type {t} to confirm.</>,
  fieldLabel: (t) => `Type ${t} to confirm`,
  ready: "The text matches. You can confirm now.",
  mismatch: "That does not match yet.",
  hint: "The confirm button stays disabled until the text matches exactly.",
};

export type TypeToConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  /** What will happen, and that it cannot be undone. */
  description?: ReactNode;
  /** The exact text the person has to type, such as the name of the thing being deleted. */
  confirmText: string;
  /** Label of the confirm button. Default "Delete". */
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" (default) paints the confirm button red. */
  tone?: "danger" | "default";
  /** Match capitals exactly. Default true. */
  caseSensitive?: boolean;
  /** May return a promise; the button shows a spinner until it settles, then the dialog closes. */
  onConfirm: () => void | Promise<void>;
  /** Placeholder of the field. Defaults to the text to type. */
  placeholder?: string;
  /** Override any UI text. Merged over `typeToConfirmDialogLabels`. */
  labels?: Partial<TypeToConfirmDialogLabels>;
  className?: string;
  /** Turn accessibility features on for this component only. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** A confirmation for something that cannot be undone: the button stays off until the person types the name of what they are deleting. */
export function TypeToConfirmDialog({
  open, onOpenChange, title, description, confirmText, confirmLabel = "Delete", cancelLabel, tone = "danger", caseSensitive = true, onConfirm, placeholder, labels, className, accessibilityFeatures,
}: TypeToConfirmDialogProps) {
  const l = { ...typeToConfirmDialogLabels, ...labels };
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const id = useId();
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setTyped("");
  }

  const match = caseSensitive ? typed === confirmText : typed.toLowerCase() === confirmText.toLowerCase();
  const ready = l.ready;
  useEffect(() => { if (match) announce(ready); }, [match, ready]);

  const confirm = async () => {
    if (!match || busy) return;
    try {
      setBusy(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); void confirm(); }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => !busy && onOpenChange(v)}
      role="alertdialog"
      size="sm"
      hideClose
      title={title}
      description={description}
      className={className}
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>{cancelLabel ?? l.cancel}</Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} loading={busy} disabled={!match} onClick={confirm}>{confirmLabel}</Button>
        </>
      }
    >
      <div {...rootProps} className="flex flex-col gap-3">
        <p id={`${id}-ins`} className="text-sm text-ink">
          {l.instruction(<code className={cn("rounded-[4px] bg-raised px-1.5 py-0.5 font-mono text-[0.8125rem] font-medium")}>{confirmText}</code>)}
        </p>
        {a11y.screenReaderHints && <p className="sr-only">{l.hint}</p>}
        <TextField
          data-autofocus
          aria-label={l.fieldLabel(confirmText)}
          aria-describedby={`${id}-ins`}
          value={typed}
          onValueChange={setTyped}
          onKeyDown={onKey}
          placeholder={placeholder ?? confirmText}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          disabled={busy}
          error={typed && !match && typed.length >= confirmText.length ? l.mismatch : undefined}
        />
      </div>
    </Dialog>
  );
}
