import { useId, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { press, spring, springSnappy, fade } from "../../motion";
import { useTheme, type ThemeMode } from "../../theme";

/** Text used by ThemeToggle. Pass a partial via `labels` to translate or reword. */
export interface ThemeToggleLabels {
  /** aria-label while the theme is dark. */
  toLight: string;
  /** aria-label while the theme is light. */
  toDark: string;
}
export const themeToggleLabels: ThemeToggleLabels = { toLight: "Switch to light mode", toDark: "Switch to dark mode" };

/** Icon button: the sun's core swells into a moon as the rays tuck away.
    The new theme opens as a circle from the button (View Transitions). */
export function ThemeToggle({ className, labels }: {
  className?: string;
  /** Override any UI text. Merged over `themeToggleLabels`. */
  labels?: Partial<ThemeToggleLabels>;
}) {
  const l = { ...themeToggleLabels, ...labels };
  const { resolved, toggle } = useTheme();
  const ref = useRef<HTMLButtonElement>(null);
  const maskId = useId();
  const dark = resolved === "dark";
  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={() => toggle(ref.current)}
      whileTap={press}
      aria-label={dark ? l.toLight : l.toDark}
      className={cn(
        "inline-grid size-9 place-items-center rounded-full text-ink transition-colors duration-200 hover:bg-raised",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <motion.circle
            r="9"
            fill="black"
            initial={false}
            animate={dark ? { cx: 17, cy: 7 } : { cx: 30, cy: -6 }}
            transition={spring}
          />
        </mask>
        <motion.circle
          cx="12"
          cy="12"
          fill="currentColor"
          mask={`url(#${maskId})`}
          initial={false}
          animate={{ r: dark ? 9 : 4.5 }}
          transition={spring}
        />
        <motion.g
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={false}
          animate={dark ? { opacity: 0, rotate: -45, scale: 0.6 } : { opacity: 1, rotate: 0, scale: 1 }}
          transition={springSnappy}
          style={{ originX: "12px", originY: "12px" }}
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="12" y1="2.5" x2="12" y2="4.5" transform={`rotate(${a} 12 12)`} />
          ))}
        </motion.g>
      </svg>
    </motion.button>
  );
}

const MODES: ThemeMode[] = ["light", "dark", "system"];

/** Text used by ThemeSwitcher. Pass a partial via `labels` to translate or reword. */
export interface ThemeSwitcherLabels {
  /** aria-label of the radio group. */
  group: string;
  /** Light option. */
  light: string;
  /** Dark option. */
  dark: string;
  /** Follow-the-system option. */
  system: string;
}
export const themeSwitcherLabels: ThemeSwitcherLabels = { group: "Colour mode", light: "Light", dark: "Dark", system: "System" };

/** Three-way switch: light, dark, or follow the system. */
export function ThemeSwitcher({ className, labels }: {
  className?: string;
  /** Override any UI text. Merged over `themeSwitcherLabels`. */
  labels?: Partial<ThemeSwitcherLabels>;
}) {
  const { mode, setMode } = useTheme();
  const l = { ...themeSwitcherLabels, ...labels };
  return (
    <div role="radiogroup" aria-label={l.group} className={cn("inline-flex rounded-full bg-raised p-1", className)}>
      {MODES.map((m) => {
        const on = mode === m;
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={(e) => setMode(m, e.currentTarget)}
            className={cn(
              "relative h-8 rounded-full px-4 text-[13px] font-medium transition-colors duration-200",
              on ? "text-ink" : "text-muted hover:text-ink",
            )}
          >
            <motion.span aria-hidden initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade}
                className="pointer-events-none absolute inset-0 bg-elevated"
                style={{ borderRadius: 999 }}
              />
            <span className="relative z-[1]">{l[m]}</span>
          </button>
        );
      })}
    </div>
  );
}
