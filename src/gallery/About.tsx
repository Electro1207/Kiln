import type { ReactNode } from "react";
import { Bug, Lightbulb, MessagesSquare, ShieldAlert } from "lucide-react";
import { GitHubMark } from "./GitHubMark";
import { KILN_LINKS, KILN_REPO } from "./site";

const ASKS: { href: string; icon: ReactNode; title: string; line: string }[] = [
  { href: KILN_LINKS.feature, icon: <Lightbulb />, title: "Request a feature", line: "A component you need, or a change to one that's here." },
  { href: KILN_LINKS.bug, icon: <Bug />, title: "Report a bug", line: "Something looks or behaves wrong. A snippet or a screenshot helps most." },
  { href: KILN_LINKS.discussions, icon: <MessagesSquare />, title: "Questions and ideas", line: "Not sure yet? Talk it through before it becomes a request." },
  { href: `${KILN_REPO}/security/advisories/new`, icon: <ShieldAlert />, title: "Report a security problem", line: "Sent privately, so it isn't public until it's fixed." },
];

export function About() {
  return (
    <div className="space-y-14">
      <header className="max-w-2xl space-y-3">
        <h1 className="text-[22px] font-semibold tracking-[-0.01em]">About Kiln</h1>
        <p className="text-[17px] leading-relaxed text-ink">
          Kiln is a free, open-source library of animated React components, in light and dark. Take the npm package or copy in only the pieces you want.
        </p>
      </header>

      <section aria-labelledby="why" className="grid gap-6 md:grid-cols-[200px_1fr]">
        <h2 id="why" className="text-base font-semibold">Why Kiln</h2>
        <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink">
          <p>
            I started Kiln while using AI to build full-stack apps faster. The code came together quickly, but the interface didn't: good UI and UX was always the slow part. There are other component libraries, but many of them keep their best pieces behind a paywall.
          </p>
          <p>
            Kiln is free, all of it. It's a passion project, made so anyone can ship a product that looks and feels good without paying for the parts that make it so.
          </p>
        </div>
      </section>

      <section aria-labelledby="who" className="grid gap-6 md:grid-cols-[200px_1fr]">
        <h2 id="who" className="text-base font-semibold">Who makes it</h2>
        <div className="max-w-2xl space-y-4 text-[15px] leading-relaxed text-ink">
          <p>
            Kiln is built and maintained by one person, and it isn't for sale. If you need a feature, ask for it and I'll try to add it as soon as I can.
          </p>
          <p>
            The code is MIT licensed, so you can use it in anything, including paid products.{" "}
            <a href={KILN_REPO} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-accent underline-offset-4 hover:underline">
              <GitHubMark className="size-4" />
              Kiln on GitHub
            </a>
          </p>
        </div>
      </section>

      <section aria-labelledby="ask" className="grid gap-6 md:grid-cols-[200px_1fr]">
        <div className="space-y-1">
          <h2 id="ask" className="text-base font-semibold">Get in touch</h2>
          <p className="text-[13px] text-muted">Free, with a GitHub account.</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ASKS.map((a) => (
            <li key={a.title}>
              <a
                href={a.href}
                target="_blank"
                rel="noreferrer"
                className="flex h-full gap-3 rounded-card bg-raised p-4 transition-colors duration-200 hover:bg-active"
              >
                <span className="mt-0.5 text-accent [&>svg]:size-[18px]">{a.icon}</span>
                <span className="space-y-1">
                  <span className="block font-medium text-ink">{a.title}</span>
                  <span className="block text-[13px] text-muted">{a.line}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
