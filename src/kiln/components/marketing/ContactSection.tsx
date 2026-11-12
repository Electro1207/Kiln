import { useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Mail, MapPin, Phone } from "lucide-react";
import { cn } from "../../cn";
import { easeOut, fade } from "../../motion";
import { Button } from "../buttons/Button";
import { Select } from "../pickers/Select";
import { TextField } from "../text-input/TextField";
import { Textarea } from "../text-input/Textarea";

/** Text used by ContactSection. Pass a partial via `labels` to translate or reword. */
export interface ContactSectionLabels {
  /** Name field label. */
  name: string;
  /** Email field label. */
  email: string;
  /** Topic select label. */
  topic: string;
  /** Topic select placeholder. */
  topicPlaceholder: string;
  /** Message field label. */
  message: string;
  /** Submit button. */
  send: string;
  /** Hint under the form. */
  hint: string;
  /** Error for an empty name. */
  nameError: string;
  /** Error for an invalid email. */
  emailError: string;
  /** Error for a short message. */
  messageError: string;
  /** Fallback when sending fails without a message. */
  failed: string;
  /** Success heading. */
  receivedTitle: string;
  /** Success body, given the first name and email. */
  receivedBody: (firstName: string, email: string) => string;
  /** Button that returns to the form. */
  sendAnother: string;
}
/** Icons used by ContactSection. Pass a partial via `icons` to swap any of them. */
export interface ContactSectionIcons {
  /** Beside an office address. */
  address: ReactNode;
  /** Beside an office phone number. */
  phone: ReactNode;
  /** Beside an office email. */
  email: ReactNode;
  /** The mark on the sent confirmation. */
  success: ReactNode;
}
export const contactSectionIcons: ContactSectionIcons = { address: <MapPin />, phone: <Phone />, email: <Mail />, success: <Check /> };
export const contactSectionLabels: ContactSectionLabels = {
  name: "Name",
  email: "Email",
  topic: "What is it about?",
  topicPlaceholder: "Choose a topic",
  message: "Message",
  send: "Send message",
  hint: "We reply within one working day.",
  nameError: "Tell us who you are",
  emailError: "Enter an email address we can reply to",
  messageError: "A sentence or two, please",
  failed: "Couldn’t send. Try again.",
  receivedTitle: "Message received",
  receivedBody: (n, e) => `Thanks, ${n}. Someone from the crew will reply to ${e} within one working day.`,
  sendAnother: "Send another",
};

export type Office = { city: string; address: string[]; phone?: string; email?: string };
export type ContactValues = { name: string; email: string; topic: string | null; message: string };

export type ContactSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  offices: Office[];
  topics: { value: string; label: string }[];
  /** Resolve when sent; reject with an Error to show its message. */
  onSend?: (v: ContactValues) => Promise<void>;
  /** Override any UI text. Merged over `contactSectionLabels`. */
  labels?: Partial<ContactSectionLabels>;
  /** Replace any built-in icon. Merged over `contactSectionIcons`. */
  icons?: Partial<ContactSectionIcons>;
  className?: string;
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Offices on one side, a short form on the other. Errors show once you try to send. */
export function ContactSection({ title, description, offices, topics, onSend = () => wait(1000), labels, icons, className }: ContactSectionProps) {
  const l = { ...contactSectionLabels, ...labels };
  const ic = { ...contactSectionIcons, ...icons };
  const [v, setV] = useState<ContactValues>({ name: "", email: "", topic: null, message: "" });
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [fail, setFail] = useState<string | null>(null);

  const errors = {
    name: !v.name.trim() ? l.nameError : null,
    email: !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim()) ? l.emailError : null,
    message: v.message.trim().length < 10 ? l.messageError : null,
  };
  const show = (k: keyof typeof errors) => (tried ? errors[k] : null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTried(true);
    setFail(null);
    if (Object.values(errors).some(Boolean)) return;
    setBusy(true);
    try {
      await onSend(v);
      setSent(true);
    } catch (err) {
      setFail(err instanceof Error ? err.message : l.failed);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={cn("@container w-full", className)}>
      <div className="grid gap-10 @4xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] @4xl:gap-12">
        <div>
          <h2 className="text-2xl font-semibold tracking-[-0.02em] text-ink text-balance @2xl:text-[1.75rem]">{title}</h2>
          {description && <p className="mt-3 text-[15px] leading-relaxed text-ink">{description}</p>}
          <ul className="mt-8 grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-1">
            {offices.map((o) => (
              <li key={o.city} className="rounded-card bg-surface p-5">
                <p className="text-[15px] font-medium text-ink">{o.city}</p>
                <p className="mt-2 flex gap-2 text-sm text-ink">
                  <span aria-hidden className="mt-0.5 grid shrink-0 self-start place-items-center text-muted [&>svg]:size-4">{ic.address}</span>
                  <span>{o.address.map((l) => <span key={l} className="block">{l}</span>)}</span>
                </p>
                {o.phone && (
                  <p className="mt-1.5 flex items-center gap-2 text-sm">
                    <span aria-hidden className="grid shrink-0 place-items-center text-muted [&>svg]:size-4">{ic.phone}</span>
                    <a href={`tel:${o.phone.replace(/[^+\d]/g, "")}`} className="text-ink tabular underline-offset-4 hover:underline">{o.phone}</a>
                  </p>
                )}
                {o.email && (
                  <p className="mt-1.5 flex items-center gap-2 text-sm">
                    <span aria-hidden className="grid shrink-0 place-items-center text-muted [&>svg]:size-4">{ic.email}</span>
                    <a href={`mailto:${o.email}`} className="text-accent underline-offset-4 hover:underline">{o.email}</a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid rounded-sheet bg-surface p-5 @2xl:p-8 [&>*]:[grid-area:1/1]">
          <AnimatePresence initial={false}>
            {sent ? (
              <motion.div
                key="sent"
                role="status"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { ...fade, delay: 0.14 } }}
                className="flex flex-col items-start justify-center gap-3"
              >
                <span className="grid size-10 place-items-center rounded-full bg-positive-soft text-positive [&>svg]:size-5 [&>svg]:[stroke-width:2.5]">
                  {ic.success}
                </span>
                <p className="text-lg font-semibold text-ink">{l.receivedTitle}</p>
                <p className="max-w-sm text-sm text-ink">{l.receivedBody(v.name.trim().split(" ")[0], v.email.trim())}</p>
                <Button variant="secondary" size="sm" onClick={() => { setSent(false); setTried(false); setV({ name: "", email: "", topic: null, message: "" }); }}>
                  {l.sendAnother}
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                noValidate
                onSubmit={submit}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.16, ease: easeOut } }}
                className="flex flex-col gap-5"
              >
                <div className="grid gap-5 @xl:grid-cols-2">
                  <TextField label={l.name} autoComplete="name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} error={show("name")} />
                  <TextField label={l.email} type="email" autoComplete="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} error={show("email")} />
                </div>
                <Select label={l.topic} placeholder={l.topicPlaceholder} options={topics} value={v.topic} onChange={(t) => setV({ ...v, topic: t })} />
                <Textarea label={l.message} value={v.message} onChange={(e) => setV({ ...v, message: e.target.value })} error={show("message")} minRows={4} maxLength={1000} showCount />
                <div className="flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between">
                  <p className="text-[13px] text-muted" role={fail ? "alert" : undefined}>
                    {fail ? <span className="text-negative">{fail}</span> : l.hint}
                  </p>
                  <Button type="submit" loading={busy}>{l.send}</Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
