import { useId, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade } from "../../motion";
import { Button } from "../buttons/Button";

/** Text used by NewsletterSignup. Pass a partial via `labels` to translate or reword. */
export interface NewsletterSignupLabels {
  /** Screen-reader label of the email input. */
  emailLabel: string;
  /** Email input placeholder. */
  placeholder: string;
  /** Submit button. */
  subscribe: string;
  /** Error for a non-empty invalid email. */
  invalid: string;
  /** Error for an empty email. */
  empty: string;
  /** Fallback when subscribing fails without a message. */
  failed: string;
  /** Default success heading. */
  successTitle: string;
  /** Default success body, given the email. */
  successBody: (email: string) => string;
}
/** Icons used by NewsletterSignup. Pass a partial via `icons` to swap any of them. */
export interface NewsletterSignupIcons {
  /** The mark on the subscribed confirmation. */
  success: ReactNode;
}
export const newsletterSignupIcons: NewsletterSignupIcons = { success: <Check /> };
export const newsletterSignupLabels: NewsletterSignupLabels = {
  emailLabel: "Email address",
  placeholder: "Your email address",
  subscribe: "Subscribe",
  invalid: "That doesn’t look like an email address",
  empty: "Enter your email address",
  failed: "Something went wrong. Try again.",
  successTitle: "You’re on the list",
  successBody: (e) => `We sent a confirmation to ${e}.`,
};

export type NewsletterSignupProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Resolve to subscribe; reject with an Error to show its message. */
  onSubscribe?: (email: string) => Promise<void>;
  /** Shown under the field. */
  fineprint?: ReactNode;
  success?: { title: ReactNode; body?: ReactNode };
  /** inline: text beside the form. card: stacked on its own panel. */
  variant?: "inline" | "card";
  /** Override any UI text. Merged over `newsletterSignupLabels`. */
  labels?: Partial<NewsletterSignupLabels>;
  /** Replace any built-in icon. Merged over `newsletterSignupIcons`. */
  icons?: Partial<NewsletterSignupIcons>;
  className?: string;
};

const valid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Email sign-up with inline validation and a success state that replaces the form in place. */
export function NewsletterSignup({
  title, description, onSubscribe = () => wait(900), fineprint, success, variant = "inline", labels, icons, className,
}: NewsletterSignupProps) {
  const l = { ...newsletterSignupLabels, ...labels };
  const ic = { ...newsletterSignupIcons, ...icons };
  const id = useId();
  const [email, setEmail] = useState("");
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const error = serverError ?? (tried && !valid(email) ? (email.trim() ? l.invalid : l.empty) : null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    setServerError(null);
    if (!valid(email)) return;
    setBusy(true);
    try {
      await onSubscribe(email.trim());
      setDone(true);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : l.failed);
    } finally {
      setBusy(false);
    }
  };

  const form = (
    <div className="grid w-full [&>*]:[grid-area:1/1]">
      <AnimatePresence initial={false}>
        {done ? (
          <motion.div
            key="done"
            role="status"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { ...fade, delay: 0.12 } }}
            className="flex items-start gap-3 self-center"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-positive-soft text-positive [&>svg]:size-4 [&>svg]:[stroke-width:2.5]">
              {ic.success}
            </span>
            <span>
              <span className="block text-[15px] font-medium text-ink">{success?.title ?? l.successTitle}</span>
              <span className="mt-0.5 block text-sm text-muted">{success?.body ?? l.successBody(email.trim())}</span>
            </span>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={submit}
            exit={{ opacity: 0, y: -6, transition: { duration: 0.14, ease: easeOut } }}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-2 @md:flex-row">
              <label htmlFor={`${id}-email`} className="sr-only">{l.emailLabel}</label>
              <input
                id={`${id}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={l.placeholder}
                value={email}
                aria-invalid={!!error}
                aria-describedby={`${id}-msg`}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setServerError(null);
                }}
                className={cn(
                  "h-11 min-w-0 @md:flex-1 rounded-control border bg-surface px-3.5 text-[15px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted focus:ring-[3px]",
                  error ? "border-negative focus:ring-negative/20" : "border-line-strong focus:border-accent focus:ring-accent/20",
                )}
              />
              <Button type="submit" size="lg" loading={busy} className="h-11 shrink-0">
                {l.subscribe}
              </Button>
            </div>
            <div id={`${id}-msg`} className="grid min-h-5 [&>*]:[grid-area:1/1]">
              <AnimatePresence initial={false}>
                {error ? (
                  <motion.p key="e" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="text-[13px] text-negative">
                    {error}
                  </motion.p>
                ) : fineprint ? (
                  <motion.p key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={fade} className="text-[13px] text-muted">
                    {fineprint}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <section className={cn("@container w-full", variant === "card" && "rounded-sheet bg-surface p-6 @2xl:p-8", className)}>
      <div className={cn("grid gap-6", variant === "inline" && "@3xl:grid-cols-2 @3xl:items-center @3xl:gap-10")}>
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink text-balance @2xl:text-[1.75rem]">{title}</h2>
          {description && <p className="mt-2 text-[15px] leading-relaxed text-ink">{description}</p>}
        </div>
        {form}
      </div>
    </section>
  );
}
