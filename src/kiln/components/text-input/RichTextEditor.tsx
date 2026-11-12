import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import { Bold, Code, Italic, Link2, List, ListOrdered, Quote, Strikethrough, Underline } from "lucide-react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { AnchoredLayer, panelClass } from "../shared/Anchored";
import { Button } from "../buttons/Button";

export type Cmd = "bold" | "italic" | "underline" | "strikeThrough" | "insertUnorderedList" | "insertOrderedList" | "quote" | "code" | "link";

/** Text used by RichTextEditor. Pass a partial via `labels` to translate or reword. */
export interface RichTextEditorLabels {
  /** Default field label (the `label` prop wins). */
  label: string;
  /** Default placeholder (the `placeholder` prop wins). */
  placeholder: string;
  /** aria-label of the formatting toolbar. */
  toolbar: string;
  /** Name of each toolbar button (also its tooltip). */
  tools: Record<Cmd, string>;
  /** aria-label of the link popover. */
  linkDialog: string;
  /** Label of the link address input. */
  linkAddress: string;
  /** Button that removes the link. */
  removeLink: string;
  /** Button that applies the link. */
  apply: string;
}
export const richTextEditorLabels: RichTextEditorLabels = {
  label: "Description",
  placeholder: "Write something…",
  toolbar: "Formatting",
  tools: {
    bold: "Bold", italic: "Italic", underline: "Underline", strikeThrough: "Strikethrough", code: "Inline code",
    link: "Link", insertUnorderedList: "Bulleted list", insertOrderedList: "Numbered list", quote: "Quote",
  },
  linkDialog: "Link",
  linkAddress: "Link address",
  removeLink: "Remove link",
  apply: "Apply",
};

const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
const mod = isMac ? "⌘" : "Ctrl+";

const TOOLS: { cmd: Cmd; label: string; icon: ReactNode; keys?: string }[] = [
  { cmd: "bold", label: "Bold", icon: <Bold />, keys: `${mod}B` },
  { cmd: "italic", label: "Italic", icon: <Italic />, keys: `${mod}I` },
  { cmd: "underline", label: "Underline", icon: <Underline />, keys: `${mod}U` },
  { cmd: "strikeThrough", label: "Strikethrough", icon: <Strikethrough />, keys: `${mod}Shift+X` },
  { cmd: "code", label: "Inline code", icon: <Code />, keys: `${mod}E` },
  { cmd: "link", label: "Link", icon: <Link2 />, keys: `${mod}K` },
  { cmd: "insertUnorderedList", label: "Bulleted list", icon: <List /> },
  { cmd: "insertOrderedList", label: "Numbered list", icon: <ListOrdered /> },
  { cmd: "quote", label: "Quote", icon: <Quote /> },
];

/** Strip what contentEditable leaves behind and return tidy HTML. */
function cleanHTML(root: HTMLElement) {
  const c = root.cloneNode(true) as HTMLElement;
  c.querySelectorAll("[style]").forEach((n) => n.removeAttribute("style"));
  c.querySelectorAll("b").forEach((n) => { const s = document.createElement("strong"); s.append(...n.childNodes); n.replaceWith(s); });
  c.querySelectorAll("i").forEach((n) => { const s = document.createElement("em"); s.append(...n.childNodes); n.replaceWith(s); });
  c.querySelectorAll("strike").forEach((n) => { const s = document.createElement("s"); s.append(...n.childNodes); n.replaceWith(s); });
  c.querySelectorAll("div").forEach((n) => { const p = document.createElement("p"); p.append(...n.childNodes); n.replaceWith(p); });
  c.querySelectorAll("code").forEach((n) => n.removeAttribute("class"));
  c.querySelectorAll("a").forEach((a) => { a.setAttribute("rel", "noopener noreferrer"); a.setAttribute("target", "_blank"); a.removeAttribute("class"); });
  [...c.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && n.textContent?.trim()) { const p = document.createElement("p"); n.replaceWith(p); p.append(n); }
    else if (n.nodeName === "BR") n.remove();
  });
  return c.innerHTML.replace(/\u200b/g, "").replace(/<p><br><\/p>/g, "").trim();
}

/**
 * A light rich-text box: toolbar, keyboard shortcuts and markdown shortcuts
 * (**bold**, *italic*, `code`, ~~strike~~, "- " or "1. " lists, "> " quotes).
 * Pasted content arrives as plain text. `onChange` gets clean HTML.
 */
export function RichTextEditor({ defaultHTML = "", onChange, label: labelProp, placeholder: placeholderProp, minHeight = 160, className, labels }: {
  defaultHTML?: string;
  onChange?: (html: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  /** Override any UI text. Merged over `richTextEditorLabels`. */
  labels?: Partial<RichTextEditorLabels>;
}) {
  const l = { ...richTextEditorLabels, ...labels, tools: { ...richTextEditorLabels.tools, ...labels?.tools } };
  const label = labelProp ?? l.label;
  const placeholder = placeholderProp ?? l.placeholder;
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const linkBtn = useRef<HTMLButtonElement>(null);
  const saved = useRef<Range | null>(null);
  const [state, setState] = useState<Record<string, boolean>>({});
  const [empty, setEmpty] = useState(!defaultHTML);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (box.current && defaultHTML) box.current.innerHTML = defaultHTML;
    document.execCommand("defaultParagraphSeparator", false, "p");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inside = (n: Node | null, tag: string) => {
    for (let x: Node | null = n; x && x !== box.current; x = x.parentNode) if (x.nodeName === tag) return x as HTMLElement;
    return null;
  };

  const refresh = useCallback(() => {
    const sel = window.getSelection();
    if (!sel?.anchorNode || !box.current?.contains(sel.anchorNode)) return;
    const next: Record<string, boolean> = {};
    for (const c of ["bold", "italic", "underline", "strikeThrough", "insertUnorderedList", "insertOrderedList"]) next[c] = document.queryCommandState(c);
    next.quote = !!inside(sel.anchorNode, "BLOCKQUOTE");
    next.code = !!inside(sel.anchorNode, "CODE");
    next.link = !!inside(sel.anchorNode, "A");
    setState((s) => (Object.keys(next).some((k) => next[k] !== s[k]) ? next : s));
  }, []);

  useEffect(() => {
    document.addEventListener("selectionchange", refresh);
    return () => document.removeEventListener("selectionchange", refresh);
  }, [refresh]);

  const emit = () => {
    const el = box.current;
    if (!el) return;
    setEmpty(!el.textContent?.trim() && !el.querySelector("li,blockquote"));
    onChange?.(cleanHTML(el));
  };

  const toggleCode = () => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const code = inside(sel.anchorNode, "CODE");
    if (code) { code.replaceWith(...code.childNodes); return; }
    const r = sel.getRangeAt(0);
    const el = document.createElement("code");
    el.className = "rounded-[4px] bg-raised px-1 py-0.5 font-mono text-[0.9em]";
    if (r.collapsed) { el.textContent = "​"; r.insertNode(el); }
    else el.append(r.extractContents()), r.insertNode(el);
    const after = document.createRange();
    after.selectNodeContents(el);
    after.collapse(false);
    sel.removeAllRanges();
    sel.addRange(after);
  };

  const run = (cmd: Cmd) => {
    box.current?.focus();
    if (cmd === "link") {
      const sel = window.getSelection();
      saved.current = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
      setUrl(inside(sel?.anchorNode ?? null, "A")?.getAttribute("href") ?? "https://");
      setLinkOpen(true);
      return;
    }
    if (cmd === "quote") document.execCommand("formatBlock", false, state.quote ? "p" : "blockquote");
    else if (cmd === "code") toggleCode();
    else document.execCommand(cmd);
    refresh();
    emit();
  };

  const applyLink = () => {
    const sel = window.getSelection();
    box.current?.focus();
    if (saved.current) { sel?.removeAllRanges(); sel?.addRange(saved.current); }
    const href = url.trim();
    if (!href || href === "https://") document.execCommand("unlink");
    else if (saved.current?.collapsed) document.execCommand("insertHTML", false, `<a href="${href.replace(/"/g, "&quot;")}">${href.replace(/</g, "&lt;")}</a>`);
    else document.execCommand("createLink", false, href);
    setLinkOpen(false);
    emit();
  };

  /** Markdown shortcuts, checked after each keystroke against the text before the caret. */
  const markdown = () => {
    const sel = window.getSelection();
    const node = sel?.anchorNode;
    if (!sel || !node || node.nodeType !== Node.TEXT_NODE) return;
    const text = node.textContent ?? "";
    const before = text.slice(0, sel.anchorOffset);
    const block = node.parentElement?.closest("p,div,li,blockquote");
    const atStart = !!block && (block.textContent ?? "").startsWith(before);

    // Line starts: "- ", "* ", "1. ", "> "
    // A typed space can arrive as a non-breaking space, so accept both.
    const start = atStart ? before.replace(/\u00a0/g, " ").match(/^(\s*)(- |\* |1\. |> )$/) : null;
    if (start) {
      const r = document.createRange();
      r.setStart(node, 0); r.setEnd(node, sel.anchorOffset);
      r.deleteContents();
      // Replace the line with the new block ourselves (execCommand nests lists inside
      // paragraphs), then put the caret inside it.
      const mark = start[2];
      const made = mark === "> " ? document.createElement("blockquote") : document.createElement("li");
      if (block && block.textContent) made.append(...block.childNodes); else made.append(document.createElement("br"));
      let outer: HTMLElement = made;
      if (made.tagName === "LI") { outer = document.createElement(mark === "1. " ? "ol" : "ul"); outer.append(made); }
      if (block && block !== box.current && block.parentNode) block.replaceWith(outer);
      else box.current?.append(outer);
      const at = document.createRange();
      at.setStart(made, 0); at.collapse(true);
      sel.removeAllRanges(); sel.addRange(at);
      return;
    }
    // Inline pairs: **x**, ~~x~~, `x`, *x*, _x_
    // Each rule captures the whole token (1) and the text inside it (2).
    const rules: [RegExp, string][] = [
      [/(\*\*([^*]+)\*\*)$/, "strong"],
      [/(~~([^~]+)~~)$/, "s"],
      [/(`([^`]+)`)$/, "code"],
      [/(?<![*\w])(\*([^*\s][^*]*)\*)$/, "em"],
      [/(?<![_\w])(_([^_\s][^_]*)_)$/, "em"],
    ];
    for (const [re, tag] of rules) {
      const m = before.match(re);
      if (!m) continue;
      const full = m[1];
      const inner = m[2];
      const startAt = sel.anchorOffset - full.length;
      const r = document.createRange();
      r.setStart(node, startAt); r.setEnd(node, sel.anchorOffset);
      r.deleteContents();
      const el = document.createElement(tag);
      if (tag === "code") el.className = "rounded-[4px] bg-raised px-1 py-0.5 font-mono text-[0.9em]";
      el.textContent = inner;
      r.insertNode(el);
      const space = document.createTextNode("​");
      el.after(space);
      const after = document.createRange();
      after.setStart(space, 1); after.collapse(true);
      sel.removeAllRanges(); sel.addRange(after);
      return;
    }
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    // Enter at the end of a quote starts a new paragraph after it; Shift+Enter adds a line inside.
    if (e.key === "Enter" && !e.shiftKey) {
      const sel = window.getSelection();
      const q = inside(sel?.anchorNode ?? null, "BLOCKQUOTE");
      if (q && sel && sel.rangeCount) {
        const r = sel.getRangeAt(0);
        const tail = document.createRange();
        tail.setStart(r.endContainer, r.endOffset);
        tail.setEnd(q, q.childNodes.length);
        if (!tail.toString().replace(/[\u200b\u00a0\s]/g, "")) {
          e.preventDefault();
          while (q.lastChild && (q.lastChild.nodeName === "BR" || (q.lastChild.nodeType === Node.TEXT_NODE && !q.lastChild.textContent?.trim()))) q.lastChild.remove();
          const para = document.createElement("p");
          para.append(document.createElement("br"));
          q.after(para);
          const at = document.createRange();
          at.setStart(para, 0); at.collapse(true);
          sel.removeAllRanges(); sel.addRange(at);
          refresh(); emit();
          return;
        }
      }
    }
    if (e.key === "Enter" && e.shiftKey && inside(window.getSelection()?.anchorNode ?? null, "BLOCKQUOTE")) {
      e.preventDefault(); document.execCommand("insertLineBreak"); return;
    }
    const m = isMac ? e.metaKey : e.ctrlKey;
    if (!m) return;
    const k = e.key.toLowerCase();
    if (k === "k") { e.preventDefault(); run("link"); }
    else if (k === "e") { e.preventDefault(); run("code"); }
    else if (k === "x" && e.shiftKey) { e.preventDefault(); run("strikeThrough"); }
    else if (k === "b" || k === "i" || k === "u") { e.preventDefault(); run(k === "b" ? "bold" : k === "i" ? "italic" : "underline"); }
  };

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <span id={`${id}-l`} className="text-sm font-medium text-ink">{label}</span>
      <div className="overflow-hidden rounded-card border border-line-strong bg-surface transition-[border-color,box-shadow] duration-200 focus-within:border-accent focus-within:ring-[3px] focus-within:ring-accent/20">
        <div role="toolbar" aria-label={l.toolbar} aria-controls={id} className="flex gap-0.5 overflow-x-auto border-b border-line p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TOOLS.map((t, i) => {
            const on = !!state[t.cmd];
            return (
              <span key={t.cmd} className="contents">
                {(i === 5 || i === 6) && <span aria-hidden className="mx-1 my-1.5 w-px bg-line" />}
                <button
                  ref={t.cmd === "link" ? linkBtn : undefined}
                  type="button"
                  aria-label={l.tools[t.cmd]}
                  aria-pressed={t.cmd === "link" ? undefined : on}
                  title={t.keys ? `${l.tools[t.cmd]} (${t.keys})` : l.tools[t.cmd]}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => run(t.cmd)}
                  className={cn("relative grid size-8 shrink-0 place-items-center rounded-[7px] transition-colors duration-150 [&_svg]:size-4", on ? "text-ink" : "text-muted hover:bg-raised hover:text-ink")}
                >
                  {/* Each tool owns its pressed fill; it fades in place. */}
                  <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[7px] bg-btn-secondary" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade} />
                  <span className="relative z-[1] grid">{t.icon}</span>
                </button>
              </span>
            );
          })}
        </div>
        <div className="relative">
          <motion.span aria-hidden initial={false} animate={{ opacity: empty ? 1 : 0 }} transition={fade} className="pointer-events-none absolute left-4 top-3 text-sm text-faint">{placeholder}</motion.span>
          <div
            ref={box}
            id={id}
            role="textbox"
            aria-multiline="true"
            aria-labelledby={`${id}-l`}
            contentEditable
            suppressContentEditableWarning
            onInput={() => { markdown(); emit(); refresh(); }}
            onKeyDown={onKey}
            onPaste={(e) => { e.preventDefault(); document.execCommand("insertText", false, e.clipboardData.getData("text/plain")); }}
            className={cn(
              "px-4 py-3 text-sm leading-6 text-ink outline-none",
              "[&_p]:my-0 [&_p+p]:mt-2 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5",
              "[&_blockquote]:my-2 [&_blockquote]:border-l-[3px] [&_blockquote]:border-line-strong [&_blockquote]:pl-3 [&_blockquote]:text-muted",
              "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded-[4px] [&_code]:bg-raised [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]",
            )}
            style={{ minHeight }}
          />
        </div>
      </div>
      <AnchoredLayer open={linkOpen} onClose={() => setLinkOpen(false)} anchor={linkBtn} placement="bottom-start" role="dialog" aria-label={l.linkDialog} className={cn(panelClass, "w-72 p-3")}>
        <form className="flex flex-col gap-2.5" onSubmit={(e) => { e.preventDefault(); applyLink(); }}>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
            {l.linkAddress}
            <input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} type="url" spellCheck={false}
              className="h-9 rounded-control border border-line-strong bg-surface px-2.5 text-sm font-normal text-ink outline-none focus:border-accent focus:ring-[3px] focus:ring-accent/20" />
          </label>
          <div className="flex justify-end gap-2">
            {state.link && <Button size="sm" variant="ghost" type="button" onClick={() => { setUrl(""); requestAnimationFrame(applyLink); }}>{l.removeLink}</Button>}
            <Button size="sm" type="submit">{l.apply}</Button>
          </div>
        </form>
      </AnchoredLayer>
    </div>
  );
}
