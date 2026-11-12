import { useState, type ReactNode } from "react";
import { Button } from "../buttons/Button";
import { Dialog } from "./Dialog";

/** Text used by AlertDialog. Pass a partial via `labels` to translate or reword. */
export interface AlertDialogLabels {
  /** Default cancel button text when `cancelLabel` is not given. */
  cancel: string;
}
export const alertDialogLabels: AlertDialogLabels = { cancel: "Cancel" };

export type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  /** "danger" paints the confirm button red. */
  tone?: "danger" | "default";
  /** May return a promise; the button shows a spinner until it settles, then the dialog closes. */
  onConfirm: () => void | Promise<void>;
  /** Override any UI text. Merged over `alertDialogLabels`. */
  labels?: Partial<AlertDialogLabels>;
};

/** A confirmation that must be answered. Esc and the scrim count as "cancel". */
export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = "default",
  onConfirm,
  labels,
}: AlertDialogProps) {
  const l = { ...alertDialogLabels, ...labels };
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
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
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy} data-autofocus>
            {cancelLabel ?? l.cancel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} loading={busy} onClick={confirm}>
            {confirmLabel}
          </Button>
        </>
      }
    />
  );
}
