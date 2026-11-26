import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../cn";
import { fade, springFirm } from "../../motion";
import { useA11yProps, type AccessibilityFeaturesProp } from "../../a11y";

export type NumberTickerProps = {
  value: number;
  /** Intl options, e.g. { style: "currency", currency: "EUR" }. */
  format?: Intl.NumberFormatOptions;
  locale?: string;
  className?: string;
  /** Accessibility features to add here. `calm`, `reduceMotion` and `noFlashing` swap the roll for the plain number. Screen readers get only the final value either way. Adds to the person's own settings, never removes them. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

/** New characters fade in where they land; old ones fade where they were. */
const enter = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: fade } };

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/** A number whose digits roll to their new value, like a departure board. */
export function NumberTicker({ value, format, locale = "en-GB", className, accessibilityFeatures }: NumberTickerProps) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  const plain = a11y.reduceMotion || a11y.calm || a11y.noFlashing;
  const text = new Intl.NumberFormat(locale, format).format(value);
  const chars = text.split("");
  // Characters only need layout measuring when the count of characters changes
  // (a digit appears or goes). A plain roll measures nothing, so it costs only transforms.
  const [seen, setSeen] = useState({ text, len: chars.length, reflow: false });
  if (seen.text !== text) setSeen({ text, len: chars.length, reflow: seen.len !== chars.length });
  const reflow = seen.reflow;
  const layout = reflow ? ("position" as const) : false;
  if (plain) return <span {...rootProps} className={cn("tabular inline-flex leading-none", className)}>{text}</span>;
  return (
    <span {...rootProps} className={cn("tabular inline-flex overflow-hidden leading-none", className)}>
      <span className="sr-only">{text}</span>
      <AnimatePresence initial={false} mode="popLayout">
      {chars.map((ch, i) => {
        // Key from the right so a digit keeps its column when the length changes.
        const key = chars.length - i;
        if (!/\d/.test(ch)) {
          return (
            <motion.span key={`s${key}${ch}`} aria-hidden className="inline-block" layout={layout} transition={springFirm} {...enter}>
              {ch}
            </motion.span>
          );
        }
        const d = Number(ch);
        return (
          <motion.span key={`d${key}`} aria-hidden className="relative inline-block h-[1em] overflow-hidden" layout={layout} transition={springFirm} {...enter}>
            <span className="invisible">0</span>
            <motion.span
              className="absolute inset-x-0 top-0 flex flex-col"
              initial={false}
              animate={{ y: `${-d * 10}%` }}
              transition={springFirm}
            >
              {DIGITS.map((n) => (
                <span key={n} className="block h-[1em] text-center">
                  {n}
                </span>
              ))}
            </motion.span>
          </motion.span>
        );
      })}
      </AnimatePresence>
    </span>
  );
}
