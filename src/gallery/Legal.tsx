import type { ReactNode } from "react";
import privacy from "../../PRIVACY.md?raw";
import terms from "../../TERMS.md?raw";
import { KILN_REPO } from "./site";

const DOCS = { privacy, terms } as const;

// Repo-relative links in the Markdown point at the site's own pages or at the file on GitHub.
function target(href: string) {
  if (href === "PRIVACY.md") return "#/privacy";
  if (href === "TERMS.md") return "#/terms";
  if (!/^[a-z]+:/i.test(href)) return `${KILN_REPO}/blob/main/${href}`;
  return href;
}

// Just enough Markdown for these two documents: headings, paragraphs, lists, links, bold and code.
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    if (m.index! > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      const href = target(m[2]);
      const external = href.startsWith("http");
      out.push(<a key={m.index} href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent">{m[1]}</a>);
    } else if (m[3]) out.push(<strong key={m.index} className="font-semibold">{m[3]}</strong>);
    else out.push(<code key={m.index} className="rounded-[4px] bg-raised px-1 py-0.5 font-mono text-[0.9em]">{m[4]}</code>);
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Legal({ doc }: { doc: keyof typeof DOCS }) {
  const blocks = DOCS[doc].trim().split(/\n{2,}/);
  return (
    <article className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink">
      {blocks.map((b, i) => {
        if (b.startsWith("# ")) return <h1 key={i} className="text-[22px] font-semibold tracking-[-0.01em]">{b.slice(2)}</h1>;
        if (b.startsWith("## ")) return <h2 key={i} className="pt-6 text-base font-semibold">{b.slice(3)}</h2>;
        if (b.startsWith("- "))
          return (
            <ul key={i} className="list-disc space-y-2 pl-5 marker:text-faint">
              {b.split(/\n(?=- )/).map((li, j) => <li key={j}>{inline(li.replace(/^- /, "").replace(/\n\s*/g, " "))}</li>)}
            </ul>
          );
        return <p key={i} className={i === 1 ? "text-muted" : undefined}>{inline(b.replace(/\n/g, " "))}</p>;
      })}
    </article>
  );
}
