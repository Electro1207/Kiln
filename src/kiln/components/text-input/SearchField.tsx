import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { cn } from "../../cn";
import { fade, springSnappy } from "../../motion";
import { useControllable, type Size } from "../../controllable";

const searchSizes: Record<Size, string> = {
  sm: "k-ctl-sm px-3",
  md: "k-ctl-md px-3.5",
  lg: "k-ctl-lg px-4",
};

/** Text used by SearchField. Pass a partial via `labels` to translate or reword. */
export interface SearchFieldLabels {
  /** Default placeholder (the `placeholder` prop wins). */
  placeholder: string;
  /** aria-label of the clear button. */
  clear: string;
}
export const searchFieldLabels: SearchFieldLabels = { placeholder: "Search", clear: "Clear search" };

/** A rounded search box. Shows a shortcut hint at rest, a clear button once typed in. */
export const SearchField = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange" | "size"> & {
  /** Controlled text. Leave out and use `defaultValue` to let the field keep its own. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  /** A key hint shown at rest, e.g. "/" or "Ctrl K". */
  shortcut?: string;
  /** Swap the magnifier for a spinner while results load. */
  loading?: boolean;
  size?: Size;
  /** Override any UI text. Merged over `searchFieldLabels`. */
  labels?: Partial<SearchFieldLabels>;
}>(function SearchField({ value: valueProp, defaultValue = "", onValueChange: onValueProp, shortcut, loading, size = "md", className, placeholder: placeholderProp, labels, ...rest }, ref) {
  const l = { ...searchFieldLabels, ...labels };
  const placeholder = placeholderProp ?? l.placeholder;
  const [value, onValueChange] = useControllable(valueProp, defaultValue, onValueProp);
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={cn(
        "k-fill relative flex items-center gap-2 rounded-full border border-line-strong bg-surface transition-[border-color,box-shadow] duration-200 ease-out-soft",
        "hover:border-faint focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20",
        searchSizes[size],
        className,
      )}
    >
      <span className={cn("grid shrink-0 transition-colors duration-200", focused ? "text-accent" : "text-faint")}>
        {loading ? (
          <svg viewBox="0 0 16 16" className="size-4 animate-spin" aria-hidden>
            <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
            <path d="M14 8a6 6 0 0 0-6-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : <Search className="size-4" />}
      </span>
      <input
        ref={ref}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => { if (e.key === "Escape" && value) { e.stopPropagation(); onValueChange(""); } }}
        className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden"
        {...rest}
      />
      <span className="grid shrink-0 place-items-center [&>*]:[grid-area:1/1]">
        {shortcut && (
          <motion.kbd aria-hidden initial={false} animate={{ opacity: value ? 0 : 1 }} transition={fade}
            className="rounded-md bg-raised px-1.5 py-0.5 font-sans text-xs leading-4 text-muted">
            {shortcut}
          </motion.kbd>
        )}
        <AnimatePresence initial={false}>
          {value && (
            <motion.button key="x" type="button" aria-label={l.clear} onClick={() => onValueChange("")}
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={springSnappy}
              className="grid size-5 place-items-center rounded-full bg-active text-muted hover:text-ink">
              <X className="size-3" strokeWidth={2.5} />
            </motion.button>
          )}
        </AnimatePresence>
      </span>
    </div>
  );
});
