import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "../../cn";
import { Dialog } from "../overlays/Dialog";

export type Shortcut = { keys: string[]; label: string; /** Keys pressed one after another rather than together. */ sequence?: boolean };
export type ShortcutGroup = { title: string; shortcuts: Shortcut[] };

/** Text used by KeyboardShortcutsSheet. Pass a partial via `labels` to translate or reword. */
export interface KeyboardShortcutsSheetLabels {
  /** Filter input placeholder and screen-reader label. */
  filter: string;
  /** Empty state when the filter matches nothing. */
  noMatch: (query: string) => string;
  /** Joins keys pressed one after another. */
  then: string;
}
export const keyboardShortcutsSheetLabels: KeyboardShortcutsSheetLabels = {
  filter: "Filter shortcuts",
  noMatch: (q) => `No shortcut matches “${q}”.`,
  then: "then",
};

export interface KeyboardShortcutsSheetIcons {
  /** Filter field. */
  search: ReactNode;
}
export const keyboardShortcutsSheetIcons: KeyboardShortcutsSheetIcons = { search: <Search /> };

export type KeyboardShortcutsSheetProps = {
  groups: ShortcutGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Open on "?" anywhere outside a text field. Default true. */
  listen?: boolean;
  title?: string;
  /** Override any UI text. Merged over `keyboardShortcutsSheetLabels`. */
  labels?: Partial<KeyboardShortcutsSheetLabels>;
  /** Replace any built-in icon. Merged over `keyboardShortcutsSheetIcons`. */
  icons?: Partial<KeyboardShortcutsSheetIcons>;
};

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
};

function Key({ k }: { k: string }) {
  return (
    <kbd className="inline-grid h-6 min-w-6 place-items-center rounded-[5px] bg-active px-1.5 font-sans text-xs font-medium text-ink">
      {k}
    </kbd>
  );
}

/** The list of keyboard shortcuts, in groups, with a filter. "?" opens it. */
export function KeyboardShortcutsSheet({ groups, open, onOpenChange, listen = true, title = "Keyboard shortcuts", labels, icons }: KeyboardShortcutsSheetProps) {
  const l = { ...keyboardShortcutsSheetLabels, ...labels };
  const ic = { ...keyboardShortcutsSheetIcons, ...icons };
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!listen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listen, onOpenChange]);

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setQ("");
  }

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return groups;
    return groups
      .map((g) => ({ ...g, shortcuts: g.shortcuts.filter((s) => s.label.toLowerCase().includes(term) || s.keys.join(" ").toLowerCase().includes(term)) }))
      .filter((g) => g.shortcuts.length);
  }, [groups, q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={title} size="lg">
      <label className="mb-4 flex h-9 items-center gap-2 rounded-control bg-raised px-3 focus-within:ring-2 focus-within:ring-accent">
        <span className="inline-flex text-muted [&>svg]:size-4" aria-hidden>{ic.search}</span>
        <span className="sr-only">{l.filter}</span>
        <input
          data-autofocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={l.filter}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </label>
      <div className="max-h-[55vh] overflow-y-auto pr-1">
        {shown.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted">{l.noMatch(q)}</p>
        ) : (
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {shown.map((g) => (
              <section key={g.title}>
                <h3 className="mb-2 text-[13px] font-medium text-muted">{g.title}</h3>
                <dl className="flex flex-col">
                  {g.shortcuts.map((s) => (
                    <div key={s.label} className="flex items-center justify-between gap-4 py-1.5">
                      <dt className="min-w-0 text-sm text-ink">{s.label}</dt>
                      <dd className={cn("flex shrink-0 items-center gap-1 text-xs text-muted")}>
                        {s.keys.map((k, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {i > 0 && <span aria-hidden>{s.sequence ? l.then : "+"}</span>}
                            <Key k={k} />
                          </span>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
