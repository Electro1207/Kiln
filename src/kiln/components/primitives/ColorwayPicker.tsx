import { useId, useRef, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade, press, springSoft } from "../../motion";
import { useTheme } from "../../theme";
import { colorwayColors, colorwaySwatch, type ColorwayTheme } from "../../colorway";

/** Text used by ColorwayPicker. Pass a partial via `labels` to translate or reword. */
export interface ColorwayPickerLabels {
  /** Visible label, and the radiogroup's name. */
  label: string;
}
export const colorwayPickerLabels: ColorwayPickerLabels = { label: "Colorway" };

export type ColorwayPickerProps = {
  /** The colorways to offer. Defaults to the ones passed to ThemeProvider. */
  colorways?: ColorwayTheme[];
  /** Id of the chosen colorway. Defaults to ThemeProvider's colorway. */
  value?: string;
  /** Called with the chosen id and the swatch pressed. Defaults to ThemeProvider's `setColorway`, which recolours the page. */
  onChange?: (id: string, origin: HTMLElement) => void;
  /** Show the label and the chosen colorway's name above the swatches. Default true. */
  showLabel?: boolean;
  /** Swatch size in px. Default 28. */
  size?: number;
  className?: string;
  /** Override any UI text. Merged over `colorwayPickerLabels`. */
  labels?: Partial<ColorwayPickerLabels>;
};

/**
 * Swatches that recolour the page: each shows its colorway's ground as a ring around its accent, and
 * picking one opens the new colours as a circle from it. Arrow keys move between them, as in any
 * radio group. Works with the colorways given to ThemeProvider, or with your own list and handler.
 * The ring around the chosen swatch takes the text colour, so it reads on any background.
 */
export function ColorwayPicker({ colorways: colorwaysProp, value, onChange, showLabel = true, size = 28, className, labels }: ColorwayPickerProps) {
  const l = { ...colorwayPickerLabels, ...labels };
  const theme = useTheme();
  const colorways = colorwaysProp ?? theme.colorways;
  const current = value ?? theme.colorway;
  const pick = onChange ?? ((id: string, origin: HTMLElement) => theme.setColorway(id, origin));
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, colorways.findIndex((g) => g.id === current));

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    const to = e.key === "Home" ? 0 : e.key === "End" ? colorways.length - 1 : step ? (index + step + colorways.length) % colorways.length : -1;
    if (to < 0) return;
    e.preventDefault();
    const el = refs.current[to];
    if (!el) return;
    el.focus();
    pick(colorways[to].id, el);
  };

  if (!colorways.length) return null;
  const chosen = colorways[index];
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {showLabel && (
        <p id={`${id}-label`} className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">{l.label}</span>
          <span className="text-muted">{chosen?.name}</span>
        </p>
      )}
      <div role="radiogroup" aria-labelledby={showLabel ? `${id}-label` : undefined} aria-label={showLabel ? undefined : l.label} onKeyDown={onKey} className="flex flex-wrap gap-1.5">
        {colorways.map((g, i) => {
          const on = g.id === current;
          const c = colorwayColors(g, theme.resolved);
          return (
            <motion.button
              key={g.id}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={g.name}
              title={g.name}
              tabIndex={i === index ? 0 : -1}
              whileTap={press}
              transition={springSoft}
              onClick={(e) => !on && pick(g.id, e.currentTarget)}
              className="relative grid shrink-0 place-items-center rounded-full outline-offset-2"
              style={{ width: size + 10, height: size + 10 }}
            >
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-full border-2 border-current"
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={fade}
              />
              <span
                aria-hidden
                className="rounded-full border border-line-strong"
                style={{ width: size, height: size, background: colorwaySwatch(g, theme.resolved), boxShadow: `inset 0 0 0 ${Math.round(size * 0.22)}px ${c.ground}` }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
