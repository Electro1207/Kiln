import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUp } from "lucide-react";
import { cn } from "../../cn";
import { useControllable } from "../../controllable";
import { easeOut, springSoft } from "../../motion";
import { useOnScreen, usePrefersReducedMotion } from "../shared/useLoop";

/** Icons used by PlaceholderInput. Pass a partial via `icons` to replace them. */
export interface PlaceholderInputIcons {
  /** Send button. */
  send: ReactNode;
}
export const placeholderInputIcons: PlaceholderInputIcons = { send: <ArrowUp /> };

/** Text used by PlaceholderInput. Pass a partial via `labels` to translate or reword. */
export interface PlaceholderInputLabels {
  /** aria-label of the send button. */
  send: string;
}
export const placeholderInputLabels: PlaceholderInputLabels = { send: "Send" };

export type PlaceholderInputProps = {
  /** Suggestions shown in turn while the field is empty. */
  placeholders: string[];
  /** Controlled text. Leave out to let the field keep its own; it clears after a send. */
  value?: string;
  /** Where uncontrolled text starts. Default empty. */
  defaultValue?: string;
  /** Called with the new text, controlled or not. */
  onChange?: (value: string) => void;
  onSubmit: (value: string) => void;
  label: string;
  /** ms each placeholder stays. */
  interval?: number;
  className?: string;
  /** Override any UI text. Merged over `placeholderInputLabels`. */
  labels?: Partial<PlaceholderInputLabels>;
  /** Replace any built-in icon. Merged over `placeholderInputIcons`. */
  icons?: Partial<PlaceholderInputIcons>;
};

type Dust = { id: number; chars: Array<{ c: string; dx: number; dy: number; r: number }> };

/**
 * A search-style field whose placeholder cycles through examples while it is
 * empty. Sending the text makes it drift up and dissolve, letter by letter,
 * as the field clears.
 */
export function PlaceholderInput({ placeholders, value: valueProp, defaultValue = "", onChange, onSubmit, label, interval = 3000, className, labels, icons }: PlaceholderInputProps) {
  const l = { ...placeholderInputLabels, ...labels };
  const ic = { ...placeholderInputIcons, ...icons };
  const [value, setValue] = useControllable(valueProp, defaultValue, onChange);
  const [i, setI] = useState(0);
  const [dust, setDust] = useState<Dust | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const onScreen = useOnScreen(form);
  const reduce = usePrefersReducedMotion();
  const id = useId();
  const empty = value === "" && !dust;

  useEffect(() => {
    if (!empty || !onScreen || reduce) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % placeholders.length), interval);
    return () => window.clearInterval(t);
  }, [empty, onScreen, reduce, interval, placeholders.length]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    onSubmit(text);
    if (!reduce) {
      setDust({
        id: Date.now(),
        chars: Array.from(value).map((c) => ({ c, dx: (Math.random() - 0.5) * 16, dy: -10 - Math.random() * 14, r: (Math.random() - 0.5) * 30 })),
      });
    }
    setValue("");
  };

  return (
    <form ref={form} onSubmit={submit} className={cn("relative w-full", className)}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <input
        id={id}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoComplete="off"
        className="h-12 w-full rounded-full border border-line-strong bg-surface pl-5 pr-14 text-[15px] text-ink outline-none transition-[border-color,box-shadow] focus:border-accent focus:ring-2 focus:ring-accent-soft"
      />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-5 right-14 grid items-center overflow-hidden text-[15px] text-faint [&>*]:[grid-area:1/1]">
        <AnimatePresence initial={false}>
          {empty && (
            <motion.span
              key={i}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0, transition: { duration: 0.25, ease: easeOut } }}
              transition={springSoft}
              className="truncate"
            >
              {placeholders[i]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-5 right-14 flex items-center overflow-visible whitespace-pre text-[15px] text-ink">
        {dust && (
          <span key={dust.id}>
            {dust.chars.map((d, k) => (
              <motion.span
                key={k}
                className="inline-block"
                initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
                animate={{ opacity: 0, x: d.dx, y: d.dy, rotate: d.r, scale: 0.7 }}
                transition={{ duration: 0.6, ease: easeOut, delay: k * 0.012 }}
                onAnimationComplete={k === dust.chars.length - 1 ? () => setDust(null) : undefined}
              >
                {d.c}
              </motion.span>
            ))}
          </span>
        )}
      </div>
      <motion.button
        type="submit"
        aria-label={l.send}
        disabled={!value.trim()}
        whileTap={{ scale: 0.9 }}
        transition={springSoft}
        className="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-full bg-btn-primary text-btn-primary-ink transition-[background-color,opacity] hover:bg-btn-primary-hover disabled:opacity-40 [&>svg]:size-4 [&>svg]:[stroke-width:2.25]"
      >
        {ic.send}
      </motion.button>
    </form>
  );
}
