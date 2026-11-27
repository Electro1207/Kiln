import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Timer } from "lucide-react";
import { cn } from "../../cn";
import { springFirm } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";
import { announce } from "../accessibility/announce";
import { Button } from "../buttons/Button";
import { Dialog } from "../overlays/Dialog";

/** Text used by SessionTimeout. Pass a partial via `labels` to translate or reword. */
export interface SessionTimeoutLabels {
  /** Dialog title. */
  title: string;
  /** Sentence under the title. */
  description: string;
  /** The button that keeps the session going. */
  stay: string;
  /** The button that ends it now. */
  signOut: string;
  /** Spoken name of the countdown, e.g. "Time left". */
  timeLeft: string;
  /** Spoken at the 60 and 10 second marks, given the seconds left. */
  announce: (seconds: number) => string;
  /** Visible and spoken countdown, e.g. "1:05". Spoken form is `spoken`. */
  spoken: (seconds: number) => string;
}
export const sessionTimeoutLabels: SessionTimeoutLabels = {
  title: "Still there?",
  description: "For your safety this session is about to end. Anything you have not saved will be lost.",
  stay: "Stay signed in",
  signOut: "Sign out",
  timeLeft: "Time left",
  announce: (s) => `Your session ends in ${s} seconds.`,
  spoken: (s) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m > 0 ? `${m} ${m === 1 ? "minute" : "minutes"}` : ""}${m > 0 && r > 0 ? " " : ""}${r > 0 || m === 0 ? `${r} ${r === 1 ? "second" : "seconds"}` : ""}`;
  },
};

/** Icons used by SessionTimeout. Pass a partial via `icons` to swap any of them. */
export interface SessionTimeoutIcons {
  /** Beside the countdown. */
  timer: ReactNode;
}
export const sessionTimeoutIcons: SessionTimeoutIcons = { timer: <Timer /> };

export type SessionTimeoutProps = {
  /** When the session ends: a Date or a timestamp in ms. Push it forward in `onStay` to keep the person signed in. */
  expiresAt: Date | number;
  /** Seconds before `expiresAt` that the warning opens. Default 120; three times that under `extendedTime`. */
  warnBefore?: number;
  /** Force the dialog open or closed. Leave out and it opens by itself inside the warning window. */
  open?: boolean;
  /** "Stay signed in" was pressed. Extend `expiresAt` here. */
  onStay: () => void;
  /** "Sign out" was pressed, or the time ran out and `onExpire` was not given. */
  onSignOut: () => void;
  /** The time ran out. Fires once per `expiresAt`. Defaults to `onSignOut`. */
  onExpire?: () => void;
  /** Override any UI text. Merged over `sessionTimeoutLabels`. */
  labels?: Partial<SessionTimeoutLabels>;
  /** Replace any built-in icon. Merged over `sessionTimeoutIcons`. */
  icons?: Partial<SessionTimeoutIcons>;
  /** Accessibility features to add for this warning only. `extendedTime` triples the warning window. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
  /** Styles the dialog panel. */
  className?: string;
};

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Warns a person before their session ends. It opens inside the warning window with a
 * live countdown, "Stay signed in" and "Sign out", and tells screen readers at 60 and 10 seconds.
 */
export function SessionTimeout({
  expiresAt, warnBefore = 120, open: openProp, onStay, onSignOut, onExpire, labels, icons, accessibilityFeatures, className,
}: SessionTimeoutProps) {
  const l = { ...sessionTimeoutLabels, ...labels };
  const say = l.announce;
  const ic = useMemo(() => ({ ...sessionTimeoutIcons, ...icons }), [icons]);
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const end = typeof expiresAt === "number" ? expiresAt : expiresAt.getTime();
  const span = warnBefore * (a11y.extendedTime ? 3 : 1);
  const [secs, setSecs] = useState(() => Math.max(0, Math.ceil((end - Date.now()) / 1000)));
  const said = useRef(new Set<number>());
  const expired = useRef(false);
  const latest = useRef({ onExpire, onSignOut });
  useEffect(() => {
    latest.current = { onExpire, onSignOut };
  });

  // Tick on the second, using the clock rather than counting, so a background tab catches up.
  useEffect(() => {
    said.current = new Set();
    expired.current = false;
    let timer = 0;
    const tick = () => {
      const left = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setSecs((s) => (s === left ? s : left));
      if (left <= 0) return;
      const wait = Math.max(50, end - Date.now() - (left - 1) * 1000);
      timer = window.setTimeout(tick, wait);
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [end]);

  const open = openProp ?? (secs > 0 && secs <= span);

  useEffect(() => {
    if (secs > 0 || expired.current || Date.now() < end - 1000) return;
    expired.current = true;
    (latest.current.onExpire ?? latest.current.onSignOut)();
  }, [secs, end]);

  // Speak at 60 and at 10 seconds. A mark already passed when the dialog opens is skipped.
  useEffect(() => {
    if (!open || secs <= 0) return;
    const mark = secs <= 10 ? 10 : secs <= 60 ? 60 : 0;
    if (!mark || said.current.has(mark)) return;
    for (const m of [60, 10]) if (m >= mark) said.current.add(m);
    announce(say(secs), mark === 10 ? "assertive" : "polite");
  }, [open, secs, say]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {}}
      role="alertdialog"
      size="sm"
      hideClose
      dismissible={false}
      title={l.title}
      description={l.description}
      className={className}
      accessibilityFeatures={accessibilityFeatures}
      footer={
        <>
          <Button variant="secondary" onClick={onSignOut}>{l.signOut}</Button>
          <Button onClick={onStay} data-autofocus>{l.stay}</Button>
        </>
      }
    >
      <div {...rootProps} className="flex flex-col gap-3">
        <span className="sr-only">{`${l.timeLeft}: ${l.spoken(secs)}`}</span>
        <div aria-hidden className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-raised text-ink [&>svg]:size-[18px]">{ic.timer}</span>
          <span className="tabular text-[1.75rem] font-medium leading-none text-ink">{clock(secs)}</span>
        </div>
        <div aria-hidden className="relative h-1 overflow-hidden rounded-full bg-active">
          <motion.div
            className={cn("absolute inset-0 origin-left rounded-full", secs <= 10 ? "bg-negative" : "bg-accent")}
            initial={false}
            animate={{ scaleX: Math.min(1, secs / Math.max(1, span)) }}
            transition={springFirm}
          />
        </div>
      </div>
    </Dialog>
  );
}
