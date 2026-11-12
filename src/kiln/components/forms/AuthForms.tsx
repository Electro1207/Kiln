import { useId, useLayoutEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, animate, motion, useMotionValue } from "motion/react";
import { ArrowLeft, Mail, MailCheck, User } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade, spring, springSoft } from "../../motion";
import { Button } from "../buttons/Button";
import { TextField } from "../text-input/TextField";
import { PasswordField } from "../text-input/PasswordField";

export type AuthMode = "sign-in" | "sign-up" | "forgot";

export type AuthCopy = Record<AuthMode, { title: string; subtitle: string; submit: string }>;

/** Text used by AuthForms. Pass a partial via `labels` to translate or reword. (Titles, subtitles and submit labels per mode live in `copy`.) */
export interface AuthFormsLabels {
  /** Name field label (sign up). */
  name: string;
  /** Email field label. */
  email: string;
  /** Link to the forgot-password mode. */
  forgotPassword: string;
  /** Confirmation after requesting a reset link, given the email as a node. */
  resetSent: (email: ReactNode) => ReactNode;
  /** Button back to sign in after the confirmation. */
  backToSignIn: string;
  /** Divider text above the providers. */
  or: string;
  /** Footer line in sign-in mode: text before the link. */
  newHere: string;
  /** Footer link to sign-up mode. */
  createAccount: string;
  /** Footer line in sign-up mode: text before the link. */
  haveAccount: string;
  /** Footer link to sign-in mode. */
  signIn: string;
  /** Footer line in forgot mode: text before the link. */
  remembered: string;
}
export const authFormsLabels: AuthFormsLabels = {
  name: "Name",
  email: "Email",
  forgotPassword: "Forgot password?",
  resetSent: (email) => <>If {email} has an account, a reset link is on its way. It works for 30 minutes.</>,
  backToSignIn: "Back to sign in",
  or: "or",
  newHere: "New here?",
  createAccount: "Create an account",
  haveAccount: "Already have an account?",
  signIn: "Sign in",
  remembered: "Remembered it?",
};

export interface AuthFormsIcons {
  /** Name field. */
  name: ReactNode;
  /** Email field. */
  email: ReactNode;
  /** Confirmation after a reset link is sent. */
  sent: ReactNode;
  /** Back-to-sign-in button. */
  back: ReactNode;
}
export const authFormsIcons: AuthFormsIcons = { name: <User />, email: <Mail />, sent: <MailCheck />, back: <ArrowLeft /> };

export type AuthValues = { name: string; email: string; password: string };

/** Text swaps hand over rather than overlap: the old words leave quickly, then the new ones arrive. */
const textSwap = (show: boolean) => (show ? { duration: 0.18, delay: 0.08, ease: easeOut } : { duration: 0.09, ease: easeOut });

const defaultCopy: AuthCopy = {
  "sign-in": { title: "Sign in", subtitle: "Welcome back.", submit: "Sign in" },
  "sign-up": { title: "Create an account", subtitle: "It takes under a minute.", submit: "Create account" },
  forgot: { title: "Reset your password", subtitle: "We'll email you a link to choose a new one.", submit: "Send reset link" },
};

/**
 * Sign in, sign up and forgot password as one card. Switching modes keeps the
 * card in place: shared fields stay put, new ones fade in, and the card's
 * height eases to fit.
 */
export function AuthForms({
  initialMode = "sign-in",
  onSubmit,
  providers = [],
  copy = defaultCopy,
  className,
  labels,
  icons,
}: {
  initialMode?: AuthMode;
  /** Resolve to finish, reject (with a message) to show an error. */
  onSubmit: (mode: AuthMode, values: AuthValues) => Promise<void>;
  /** Plain text buttons, e.g. [{ label: "Continue with GitHub", onClick }]. */
  providers?: { label: string; icon?: ReactNode; onClick: () => void }[];
  copy?: AuthCopy;
  className?: string;
  /** Override any UI text. Merged over `authFormsLabels`. */
  labels?: Partial<AuthFormsLabels>;
  /** Replace any built-in icon. Merged over `authFormsIcons`. */
  icons?: Partial<AuthFormsIcons>;
}) {
  const l = { ...authFormsLabels, ...labels };
  const ic = { ...authFormsIcons, ...icons };
  const id = useId();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [values, setValues] = useState<AuthValues>({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const go = (m: AuthMode) => { setMode(m); setError(null); setSentTo(null); };
  const set = (k: keyof AuthValues) => (v: string) => { setValues((s) => ({ ...s, [k]: v })); setError(null); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSubmit(mode, values);
      if (mode === "forgot") setSentTo(values.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  // The card animates its real height to its content's, so whatever sits below it on
  // the page moves smoothly too. The content is laid out at its final size from the
  // first frame, so nothing reflows while it eases.
  const inner = useRef<HTMLDivElement>(null);
  const height = useMotionValue<number | "auto">("auto");
  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    let first = true;
    const ro = new ResizeObserver(() => {
      const h = el.offsetHeight;
      if (first) { height.set(h); first = false; } else animate(height, h, springSoft);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [height]);

  // Items that stay glide to their new places; new ones fade in once the movers have
  // passed, and leaving ones fade out at once, so no two ever overlap.
  const item = { layout: "position" as const, transition: spring };
  const enter = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.22, delay: 0.16, ease: easeOut } }, exit: { opacity: 0, transition: { duration: 0.08 } } };

  return (
    <LayoutGroup id={id}>
      <motion.div
        className={cn("w-full max-w-sm overflow-hidden rounded-sheet bg-surface", className)}
        style={{ height }}
      >
      <div ref={inner} className="p-6 sm:p-8">
        <motion.div {...item} className="grid [&>*]:[grid-area:1/1]">
          {(Object.keys(copy) as AuthMode[]).map((m) => (
            <motion.div key={m} initial={false} animate={{ opacity: m === mode ? 1 : 0 }} transition={textSwap(m === mode)} aria-hidden={m !== mode} className={m === mode ? "" : "pointer-events-none"}>
              <h3 className="text-[22px] font-semibold leading-tight tracking-[-0.01em] text-ink">{copy[m].title}</h3>
              <p className="mt-1.5 text-sm text-muted">{copy[m].subtitle}</p>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence initial={false} mode="popLayout">
          {sentTo ? (
            <motion.div key="sent" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={spring} className="mt-6 flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-card bg-raised p-4">
                <span className="mt-0.5 inline-flex shrink-0 text-positive [&>svg]:size-5" aria-hidden>{ic.sent}</span>
                <p className="text-sm text-ink">
                  {l.resetSent(<span className="font-medium">{sentTo}</span>)}
                </p>
              </div>
              <Button variant="secondary" leading={ic.back} onClick={() => go("sign-in")}>{l.backToSignIn}</Button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} className="mt-6 flex flex-col gap-4" exit={{ opacity: 0 }} transition={fade} noValidate>
              <AnimatePresence initial={false} mode="popLayout">
                {mode === "sign-up" && (
                  <motion.div key="name" {...item} {...enter}>
                    <TextField label={l.name} leading={ic.name} autoComplete="name" value={values.name} onChange={(e) => set("name")(e.target.value)} required />
                  </motion.div>
                )}
                <motion.div key="email" {...item}>
                  <TextField label={l.email} type="email" leading={ic.email} autoComplete="email" value={values.email} onChange={(e) => set("email")(e.target.value)} required />
                </motion.div>
                {mode !== "forgot" && (
                  <motion.div key="password" {...item} {...enter}>
                    <PasswordField value={values.password} onValueChange={set("password")} meter={mode === "sign-up"} />
                  </motion.div>
                )}
                {mode === "sign-in" && (
                  <motion.div key="forgot-link" {...item} {...enter} className="-mt-1 flex justify-end">
                    <button type="button" onClick={() => go("forgot")} className="text-[13px] font-medium text-accent hover:underline">{l.forgotPassword}</button>
                  </motion.div>
                )}
                {error && (
                  <motion.p key="error" {...item} role="alert" {...enter} className="rounded-control bg-negative-soft px-3 py-2 text-[13px] text-negative">
                    {error}
                  </motion.p>
                )}
                <motion.div key="submit" {...item}>
                  <Button type="submit" loading={busy} className="w-full">
                    <span className="grid [&>*]:[grid-area:1/1]">
                      {(Object.keys(copy) as AuthMode[]).map((m) => (
                        <motion.span key={m} initial={false} animate={{ opacity: m === mode ? 1 : 0 }} transition={textSwap(m === mode)} aria-hidden={m !== mode}>{copy[m].submit}</motion.span>
                      ))}
                    </span>
                  </Button>
                </motion.div>
                {mode !== "forgot" && providers.length > 0 && (
                  <motion.div key="providers" {...item} {...enter} className="flex flex-col gap-3">
                    <p className="text-center text-[13px] text-faint">{l.or}</p>
                    {providers.map((p) => (
                      <Button key={p.label} type="button" variant="outline" leading={p.icon} onClick={p.onClick} className="w-full">{p.label}</Button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.p {...item} className="mt-6 text-center text-[13px] text-muted">
          <span className="grid [&>*]:[grid-area:1/1]">
            <ModeLine show={mode === "sign-in"}>{l.newHere} <SwitchLink onClick={() => go("sign-up")}>{l.createAccount}</SwitchLink></ModeLine>
            <ModeLine show={mode === "sign-up"}>{l.haveAccount} <SwitchLink onClick={() => go("sign-in")}>{l.signIn}</SwitchLink></ModeLine>
            <ModeLine show={mode === "forgot"}>{l.remembered} <SwitchLink onClick={() => go("sign-in")}>{l.backToSignIn}</SwitchLink></ModeLine>
          </span>
        </motion.p>
      </div>
      </motion.div>
    </LayoutGroup>
  );
}

function ModeLine({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <motion.span initial={false} animate={{ opacity: show ? 1 : 0 }} transition={textSwap(show)} aria-hidden={!show} inert={!show} className={show ? "" : "pointer-events-none"}>
      {children}
    </motion.span>
  );
}

function SwitchLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className="font-medium text-accent hover:underline">{children}</button>;
}
