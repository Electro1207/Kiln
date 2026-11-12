import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { easeOut, fade, springFirm, springSoft } from "../../motion";
import { Button } from "../buttons/Button";
import { Switch } from "../choice-controls/Switch";
import { Portal } from "../shared/useOverlay";

export type ConsentCategory = {
  id: string;
  label: string;
  description: string;
  /** Always on and cannot be switched off. */
  required?: boolean;
};

export type ConsentChoice = Record<string, boolean>;

/** Text used by CookieConsent. Pass a partial via `labels` to translate or reword. */
export interface CookieConsentLabels {
  /** Default heading when `title` is not given. */
  title: string;
  /** aria-label of the dialog. */
  dialog: string;
  /** Primary button when the categories are closed. */
  acceptAll: string;
  /** Secondary button when the categories are closed. */
  rejectAll: string;
  /** Primary button when the categories are open. */
  save: string;
  /** Ghost button that opens the categories. */
  choose: string;
  /** Ghost button that closes the categories. */
  back: string;
}
export const cookieConsentLabels: CookieConsentLabels = {
  title: "Cookies",
  dialog: "Cookie preferences",
  acceptAll: "Accept all",
  rejectAll: "Reject all",
  save: "Save choices",
  choose: "Choose",
  back: "Back",
};

export type CookieConsentProps = {
  open: boolean;
  categories: ConsentCategory[];
  onDecide: (choice: ConsentChoice) => void;
  title?: ReactNode;
  children?: ReactNode;
  /** A link to the full policy. */
  policy?: ReactNode;
  /** Override any UI text. Merged over `cookieConsentLabels`. */
  labels?: Partial<CookieConsentLabels>;
};

/**
 * A consent card in the bottom corner. Equal weight for Accept and Reject;
 * "Choose" opens the categories in place, the card growing upwards.
 */
export function CookieConsent({ open, categories, onDecide, title, children, policy, labels }: CookieConsentProps) {
  const l = { ...cookieConsentLabels, ...labels };
  const [manage, setManage] = useState(false);
  const [choice, setChoice] = useState<ConsentChoice>(() => Object.fromEntries(categories.map((c) => [c.id, !!c.required])));
  const all = (v: boolean) => Object.fromEntries(categories.map((c) => [c.id, c.required ? true : v]));

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <motion.section
            key="consent"
            role="dialog"
            aria-label={l.dialog}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24, transition: { duration: 0.24, ease: easeOut } }}
            transition={springSoft}
            className="fixed inset-x-3 bottom-3 z-[65] rounded-[14px] border border-line bg-surface p-4 text-ink shadow-float sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[380px] sm:p-5"
          >
            <h2 className="text-[15px] font-semibold leading-6">{title ?? l.title}</h2>
            {children && <div className="mt-1 text-[13.5px] leading-5 text-muted">{children}</div>}

            <AnimatePresence initial={false}>
              {manage && (
                <motion.div
                  key="manage"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1, transition: { height: springFirm, opacity: { ...fade, delay: 0.08 } } }}
                  exit={{ height: 0, opacity: 0, transition: { height: { ...springFirm, delay: 0.06 }, opacity: { duration: 0.12 } } }}
                  className="-mx-1 overflow-hidden px-1"
                >
                  <ul className="mt-4 space-y-3">
                    {categories.map((c) => (
                      <li key={c.id}>
                        <Switch
                          labelFirst
                          size="sm"
                          checked={!!choice[c.id]}
                          disabled={c.required}
                          onCheckedChange={(v) => setChoice((s) => ({ ...s, [c.id]: v }))}
                          label={c.label}
                          description={c.description}
                          className="w-full"
                        />
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {manage ? (
                <Button size="sm" onClick={() => onDecide(choice)} className="flex-1 sm:flex-none">
                  {l.save}
                </Button>
              ) : (
                <>
                  <Button size="sm" onClick={() => onDecide(all(true))} className="flex-1 sm:flex-none">{l.acceptAll}</Button>
                  <Button size="sm" variant="secondary" onClick={() => onDecide(all(false))} className="flex-1 sm:flex-none">{l.rejectAll}</Button>
                </>
              )}
              <Button size="sm" variant="ghost" onClick={() => setManage((m) => !m)} aria-expanded={manage}>
                {manage ? l.back : l.choose}
              </Button>
              {policy && <span className="ml-auto text-[13px]">{policy}</span>}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </Portal>
  );
}
