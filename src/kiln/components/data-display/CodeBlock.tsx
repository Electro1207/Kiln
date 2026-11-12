import type { ReactNode } from "react";
import { cn } from "../../cn";
import { CopyButton } from "../buttons/CopyButton";

/** Text used by CodeBlock. Pass a partial via `labels` to translate or reword. */
export interface CodeBlockLabels {
  /** Header text when there is no filename or language. */
  code: string;
  /** Label of the copy button. */
  copy: string;
}
export const codeBlockLabels: CodeBlockLabels = { code: "Code", copy: "Copy code" };

export type CodeBlockProps = {
  code: string;
  filename?: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
  /** Override any UI text. Merged over `codeBlockLabels`. */
  labels?: Partial<CodeBlockLabels>;
};

const KEYWORDS = new Set(
  "import export from const let var function return if else for while switch case break default new class extends type interface async await of in as true false null undefined try catch throw".split(" "),
);
const TOKEN = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(<\/?[A-Za-z][\w.]*)|(\b[A-Za-z_$][\w$]*\b)/g;

/** A deliberately small highlighter for JS/TS/JSX/CSS-ish code. */
function highlight(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    if (m.index > last) out.push(line.slice(last, m.index));
    const [t, comment, str, num, tag, word] = m;
    const k = out.length;
    if (comment) out.push(<span key={k} className="text-muted italic">{t}</span>);
    else if (str) out.push(<span key={k} className="text-positive">{t}</span>);
    else if (num) out.push(<span key={k} className="text-warning">{t}</span>);
    else if (tag) out.push(<span key={k} className="text-info">{t}</span>);
    else if (word && KEYWORDS.has(word)) out.push(<span key={k} className="text-accent">{t}</span>);
    else if (word && /^[A-Z]/.test(word)) out.push(<span key={k} className="text-info">{t}</span>);
    else out.push(t);
    last = m.index + t.length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}

/** A code listing with a filename bar, line numbers and a copy button. */
export function CodeBlock({ code, filename, language, showLineNumbers = true, className, labels }: CodeBlockProps) {
  const l = { ...codeBlockLabels, ...labels };
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <div className={cn("w-full overflow-hidden rounded-card border border-line bg-surface", className)}>
      <div className="flex h-11 items-center justify-between gap-3 border-b border-line pl-4 pr-1.5">
        <span className="truncate text-[13px] text-muted">
          {filename ?? language ?? l.code}
        </span>
        <CopyButton value={code} label={l.copy} />
      </div>
      <pre className="overflow-x-auto py-3 font-mono text-[13px] leading-6">
        <code>
          {lines.map((line, i) => (
            <span key={i} className="flex px-4">
              {showLineNumbers && (
                <span aria-hidden className="tabular mr-4 inline-block w-6 shrink-0 select-none text-right text-faint">
                  {i + 1}
                </span>
              )}
              <span className="whitespace-pre text-ink">{highlight(line)}</span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
