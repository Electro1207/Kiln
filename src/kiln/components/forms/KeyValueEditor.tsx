import { useId, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Eye, EyeOff, LockOpen, Plus, X } from "lucide-react";
import { cn } from "../../cn";
import { spring, springSnappy } from "../../motion";
import { Button } from "../buttons/Button";
import { useControllable } from "../../controllable";

export type KeyValueRow = { id: string; key: string; value: string; secret: boolean; revealed?: boolean };

let seq = 0;
export const newRow = (key = "", value = "", secret = false): KeyValueRow => ({ id: `kv-${Date.now().toString(36)}-${seq++}`, key, value, secret });

/** Text used by KeyValueEditor. Pass a partial via `labels` to translate or reword. */
export interface KeyValueEditorLabels {
  /** Column heading and input label prefix for keys (the `keyLabel` prop wins). */
  key: string;
  /** Column heading and input label prefix for values (the `valueLabel` prop wins). */
  value: string;
  /** Text of the add button (the `addLabel` prop wins). */
  add: string;
  /** Placeholder of a key input. */
  keyPlaceholder: string;
  /** Placeholder of a value input. */
  valuePlaceholder: string;
  /** Error for an invalid key. */
  badKey: string;
  /** Error for a repeated key. */
  duplicateKey: string;
  /** Names used when a row has no key. */
  fallbackValue: string;
  fallbackRow: string;
  /** aria-label and tooltip of the per-row buttons, given the row name. */
  hide: (name: string) => string;
  reveal: (name: string) => string;
  markSecret: (name: string) => string;
  remove: (name: string) => string;
}
export const keyValueEditorLabels: KeyValueEditorLabels = {
  key: "Key",
  value: "Value",
  add: "Add variable",
  keyPlaceholder: "NAME",
  valuePlaceholder: "value",
  badKey: "Letters, digits and _ only, not starting with a digit",
  duplicateKey: "This key is used twice",
  fallbackValue: "value",
  fallbackRow: "row",
  hide: (n) => `Hide ${n}`,
  reveal: (n) => `Reveal ${n}`,
  markSecret: (n) => `Mark ${n} as secret`,
  remove: (n) => `Remove ${n}`,
};

const KEY_RE = /^[A-Z_][A-Z0-9_]*$/;

/**
 * Environment-variable style rows. Keys are upper-cased as typed and checked
 * for duplicates; secret values are masked until revealed.
 * Controlled with `rows` + `onChange`, or uncontrolled with `defaultRows`.
 */
export interface KeyValueEditorIcons {
  /** Marks a plain row as secret. */
  markSecret: ReactNode;
  /** Shows a masked secret. */
  reveal: ReactNode;
  /** Masks a revealed secret. */
  hide: ReactNode;
  /** Removes a row. */
  remove: ReactNode;
  /** Add-row button. */
  add: ReactNode;
}
export const keyValueEditorIcons: KeyValueEditorIcons = { markSecret: <LockOpen />, reveal: <Eye />, hide: <EyeOff />, remove: <X />, add: <Plus /> };

export function KeyValueEditor({ rows: rowsProp, defaultRows = [], onChange: onChangeProp, keyLabel, valueLabel, addLabel, className, labels, icons }: {
  /** Replace any built-in icon. Merged over `keyValueEditorIcons`. */
  icons?: Partial<KeyValueEditorIcons>;
  /** The rows; leave out to let the component keep them. */
  rows?: KeyValueRow[];
  /** Starting rows when uncontrolled. */
  defaultRows?: KeyValueRow[];
  onChange?: (rows: KeyValueRow[]) => void;
  keyLabel?: string;
  valueLabel?: string;
  addLabel?: string;
  className?: string;
  /** Override any UI text. Merged over `keyValueEditorLabels`. */
  labels?: Partial<KeyValueEditorLabels>;
}) {
  const l = { ...keyValueEditorLabels, ...labels };
  const ic = { ...keyValueEditorIcons, ...icons };
  keyLabel ??= l.key;
  valueLabel ??= l.value;
  addLabel ??= l.add;
  const id = useId();
  const [rows, onChange] = useControllable<KeyValueRow[]>(rowsProp, defaultRows, onChangeProp);
  const keyInputs = useRef(new Map<string, HTMLInputElement>());
  const counts = rows.reduce<Record<string, number>>((m, r) => { if (r.key) m[r.key] = (m[r.key] ?? 0) + 1; return m; }, {});

  const patch = (rid: string, p: Partial<KeyValueRow>) => onChange(rows.map((r) => (r.id === rid ? { ...r, ...p } : r)));
  const add = () => {
    const r = newRow();
    onChange([...rows, r]);
    requestAnimationFrame(() => keyInputs.current.get(r.id)?.focus());
  };
  const remove = (rid: string) => {
    const i = rows.findIndex((r) => r.id === rid);
    const next = rows.filter((r) => r.id !== rid);
    onChange(next);
    const focusTo = next[Math.min(i, next.length - 1)];
    requestAnimationFrame(() => (focusTo ? keyInputs.current.get(focusTo.id)?.focus() : undefined));
  };

  const cell = "h-9 w-full min-w-0 rounded-control border bg-surface px-2.5 text-[13px] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-faint focus:border-accent focus:ring-[3px] focus:ring-accent/20";

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,3fr)_76px] gap-2 px-0.5 text-[13px] font-medium text-muted sm:grid" aria-hidden>
        <span>{keyLabel}</span><span>{valueLabel}</span><span />
      </div>
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((r, i) => {
            const bad = r.key !== "" && !KEY_RE.test(r.key);
            const dup = r.key !== "" && counts[r.key] > 1;
            const err = bad ? l.badKey : dup ? l.duplicateKey : null;
            const masked = r.secret && !r.revealed;
            return (
              <motion.li
                key={r.id}
                layout="position"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={spring}
                className="grid grid-cols-[minmax(0,1fr)_76px] gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_76px]"
              >
                <div className="col-span-2 flex flex-col gap-1 sm:col-span-1">
                  <input
                    ref={(el) => { if (el) keyInputs.current.set(r.id, el); else keyInputs.current.delete(r.id); }}
                    aria-label={`${keyLabel} ${i + 1}`}
                    aria-invalid={!!err || undefined}
                    aria-describedby={err ? `${id}-${r.id}-e` : undefined}
                    value={r.key}
                    placeholder={l.keyPlaceholder}
                    spellCheck={false}
                    autoCapitalize="characters"
                    onChange={(e) => patch(r.id, { key: e.target.value.toUpperCase().replace(/[\s-]/g, "_") })}
                    className={cn(cell, "font-mono", err ? "border-negative" : "border-line-strong")}
                  />
                  {err && <span id={`${id}-${r.id}-e`} className="text-xs text-negative">{err}</span>}
                </div>
                <input
                  aria-label={`${valueLabel} ${i + 1}`}
                  value={r.value}
                  type={masked ? "password" : "text"}
                  placeholder={l.valuePlaceholder}
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(e) => patch(r.id, { value: e.target.value })}
                  className={cn(cell, "border-line-strong font-mono")}
                />
                <div className="flex items-start gap-1">
                  <RowIcon
                    label={r.secret ? (r.revealed ? l.hide(r.key || l.fallbackValue) : l.reveal(r.key || l.fallbackValue)) : l.markSecret(r.key || l.fallbackValue)}
                    onClick={() => (r.secret ? patch(r.id, { revealed: !r.revealed }) : patch(r.id, { secret: true, revealed: false }))}
                    a={r.secret ? ic.reveal : ic.markSecret}
                    b={ic.hide}
                    showB={r.secret ? !!r.revealed : false}
                    active={r.secret}
                  />
                  <RowIcon label={l.remove(r.key || l.fallbackRow)} onClick={() => remove(r.id)} a={ic.remove} danger />
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
      <motion.div layout="position" transition={spring}>
        <Button size="sm" variant="ghost" leading={ic.add} onClick={add}>{addLabel}</Button>
      </motion.div>
    </div>
  );
}

function RowIcon({ label, onClick, a, b, showB = false, danger, active }: {
  label: string; onClick: () => void; a: React.ReactNode; b?: React.ReactNode; showB?: boolean; danger?: boolean; active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-control transition-colors duration-200 [&>*]:[grid-area:1/1] [&_svg]:size-4",
        danger ? "text-muted hover:bg-negative-soft hover:text-negative" : active ? "text-accent hover:bg-raised" : "text-muted hover:bg-raised hover:text-ink",
      )}
    >
      <motion.span className="grid" initial={false} animate={{ opacity: showB ? 0 : 1 }} transition={springSnappy}>{a}</motion.span>
      {b && <motion.span className="grid" initial={false} animate={{ opacity: showB ? 1 : 0 }} transition={springSnappy}>{b}</motion.span>}
    </button>
  );
}
