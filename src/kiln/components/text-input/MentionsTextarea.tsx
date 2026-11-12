import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { AnchoredLayer, RowHighlight, optionClass, panelClass } from "../shared/Anchored";
import { Avatar } from "../data-display/Avatar";
import { useControllable } from "../../controllable";

export type Mentionable = { id: string; name: string; handle?: string; avatar?: string; detail?: string };

/** Turn the editor's content into text with mentions written as @[Name](id). */
function serialize(root: HTMLElement) {
  let out = "";
  const ids: string[] = [];
  const walk = (n: Node, top: boolean) => {
    if (n.nodeType === Node.TEXT_NODE) { out += (n.textContent ?? "").replace(/ /g, " "); return; }
    const el = n as HTMLElement;
    if (el.dataset?.mention) { out += `@[${el.dataset.name}](${el.dataset.mention})`; ids.push(el.dataset.mention); return; }
    if (el.tagName === "BR") { out += "\n"; return; }
    if (!top && (el.tagName === "DIV" || el.tagName === "P") && out && !out.endsWith("\n")) out += "\n";
    el.childNodes.forEach((c) => walk(c, false));
  };
  root.childNodes.forEach((c) => walk(c, true));
  return { text: out.replace(/\n$/, ""), mentions: [...new Set(ids)] };
}

const TOKEN = /@\[([^\]]*)\]\(([^)]*)\)/g;

function makeToken(id: string, name: string) {
  const token = document.createElement("span");
  token.contentEditable = "false";
  token.dataset.mention = id;
  token.dataset.name = name;
  token.className = "mx-px inline-block rounded-[5px] bg-btn-secondary px-1 font-medium text-btn-secondary-ink";
  token.textContent = `@${name}`;
  return token;
}

/** Rebuild the editor from serialised text: the inverse of `serialize`. */
function render(root: HTMLElement, text: string) {
  const nodes: Node[] = [];
  const plain = (t: string) => t.split("\n").forEach((line, i) => {
    if (i) nodes.push(document.createElement("br"));
    if (line) nodes.push(document.createTextNode(line));
  });
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    plain(text.slice(last, m.index));
    nodes.push(makeToken(m[2], m[1]));
    last = m.index + m[0].length;
  }
  plain(text.slice(last));
  root.replaceChildren(...nodes);
}

/**
 * A text box where typing @ suggests people. Arrow keys move, Enter or Tab
 * picks, Escape closes. A picked person becomes a token that deletes as one.
 */
/** Text used by MentionsTextarea. Pass a partial via `labels` to translate or reword. */
export interface MentionsTextareaLabels {
  /** Default field label (the `label` prop wins). */
  label: string;
  /** Default placeholder (the `placeholder` prop wins). */
  placeholder: string;
  /** aria-label of the suggestion list. */
  people: string;
}
export const mentionsTextareaLabels: MentionsTextareaLabels = {
  label: "Message",
  placeholder: "Write something. Type @ to mention someone.",
  people: "People",
};

export function MentionsTextarea({ people, value, defaultValue, onValueChange, onChange, label: labelProp, placeholder: placeholderProp, minRows = 3, className, labels }: {
  people: Mentionable[];
  /** Controlled text, mentions written as `@[Name](id)`. Leave out and use `defaultValue` to let the box keep its own. */
  value?: string;
  /** Starting text when uncontrolled, in the same `@[Name](id)` form. */
  defaultValue?: string;
  /** Fires with the serialised text on every edit, controlled or not. */
  onValueChange?: (text: string) => void;
  /** Fires on every edit with the text and the ids mentioned in it. */
  onChange?: (value: { text: string; mentions: string[] }) => void;
  label?: string;
  placeholder?: string;
  minRows?: number;
  className?: string;
  /** Override any UI text. Merged over `mentionsTextareaLabels`. */
  labels?: Partial<MentionsTextareaLabels>;
}) {
  const l = { ...mentionsTextareaLabels, ...labels };
  const label = labelProp ?? l.label;
  const placeholder = placeholderProp ?? l.placeholder;
  const id = useId();
  const listId = useId();
  const box = useRef<HTMLDivElement>(null);
  const range = useRef<Range | null>(null);
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(0);
  const [empty, setEmpty] = useState(true);
  const [text, setText] = useControllable(value, defaultValue ?? "", onValueChange);
  const composing = useRef(false);

  // The DOM is the source of truth while typing: rewrite it only when the incoming text differs from
  // what it already serialises to, so the caret stays put.
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || composing.current || text.replace(/\n$/, "") === serialize(el).text) return;
    render(el, text);
    setEmpty(!text.trim());
    if (document.activeElement === el) {
      const end = document.createRange();
      end.selectNodeContents(el);
      end.collapse(false);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(end);
    }
  }, [text]);

  const matches = query == null ? [] : people
    .filter((p) => (p.name + " " + (p.handle ?? "")).toLowerCase().includes(query.toLowerCase()))
    .slice(0, 6);

  const detect = () => {
    const sel = window.getSelection();
    const node = sel?.anchorNode;
    if (!sel || !sel.isCollapsed || !node || node.nodeType !== Node.TEXT_NODE || !box.current?.contains(node)) { setQuery(null); return; }
    const before = (node.textContent ?? "").slice(0, sel.anchorOffset);
    const m = before.match(/(^|[\s (])@([\p{L}\p{N}_.-]{0,24})$/u);
    if (!m) { setQuery(null); return; }
    const r = document.createRange();
    r.setStart(node, sel.anchorOffset - m[2].length - 1);
    r.setEnd(node, sel.anchorOffset);
    range.current = r;
    setQuery((q) => { if (q !== m[2]) setActive(0); return m[2]; });
  };

  const emit = () => {
    const el = box.current;
    if (!el) return;
    const v = serialize(el);
    setEmpty(!v.text.trim() && !v.mentions.length);
    onChange?.(v);
    setText(v.text);
  };

  const pick = (p: Mentionable) => {
    const r = range.current;
    if (!r) return;
    const token = makeToken(p.id, p.name);
    r.deleteContents();
    r.insertNode(token);
    const space = document.createTextNode(" ");
    token.after(space);
    const sel = window.getSelection();
    const after = document.createRange();
    after.setStart(space, 1);
    after.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(after);
    setQuery(null);
    emit();
    box.current?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (query != null && matches.length) {
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % matches.length); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + matches.length) % matches.length); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); pick(matches[active]); return; }
    }
    if (e.key === "Escape" && query != null) { e.preventDefault(); setQuery(null); return; }
    if (e.key === "Enter") { e.preventDefault(); document.execCommand("insertLineBreak"); }
  };

  useEffect(() => {
    const onSel = () => { if (document.activeElement === box.current) detect(); };
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, []);

  const open = query != null && matches.length > 0;

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <span id={`${id}-l`} className="text-sm font-medium text-ink">{label}</span>
      <div className="relative">
        <motion.span aria-hidden initial={false} animate={{ opacity: empty ? 1 : 0 }} transition={fade}
          className="pointer-events-none absolute left-3 top-2.5 text-sm text-faint">{placeholder}</motion.span>
        <div
          ref={box}
          role="textbox"
          aria-multiline="true"
          aria-labelledby={`${id}-l`}
          aria-autocomplete="list"
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open ? `${listId}-${matches[active]?.id}` : undefined}
          contentEditable
          suppressContentEditableWarning
          onInput={() => { detect(); emit(); }}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={() => { composing.current = false; emit(); }}
          onKeyDown={onKey}
          onBlur={() => window.setTimeout(() => setQuery(null), 120)}
          onPaste={(e) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); }}
          className="w-full whitespace-pre-wrap break-words rounded-control border border-line-strong bg-surface px-3 py-2.5 text-sm leading-6 text-ink outline-none transition-[border-color,box-shadow] duration-200 hover:border-faint focus:border-accent focus:ring-[3px] focus:ring-accent/20"
          style={{ minHeight: minRows * 24 + 22 }}
        />
      </div>
      <AnchoredLayer
        open={open}
        onClose={() => setQuery(null)}
        anchor={() => range.current?.getBoundingClientRect() ?? box.current!.getBoundingClientRect()}
        placement="bottom-start"
        restoreFocus={false}
        className={cn(panelClass, "w-64")}
        id={listId}
        role="listbox"
        aria-label={l.people}
      >
        {matches.map((p, i) => (
          <div
            key={p.id}
            id={`${listId}-${p.id}`}
            role="option"
            aria-selected={i === active}
            onPointerMove={() => active !== i && setActive(i)}
            onMouseDown={(e) => { e.preventDefault(); pick(p); }}
            className={optionClass}
          >
            <RowHighlight on={i === active} />
            <Avatar name={p.name} src={p.avatar} size="sm" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium text-ink">{p.name}</span>
              {(p.handle || p.detail) && <span className="truncate text-xs text-muted">{[p.handle && `@${p.handle}`, p.detail].filter(Boolean).join(" · ")}</span>}
            </span>
          </div>
        ))}
      </AnchoredLayer>
    </div>
  );
}
