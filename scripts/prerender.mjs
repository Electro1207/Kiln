#!/usr/bin/env node
/* Gives every gallery page its own static HTML after `vite build`, so search engines, link previews and
   AI crawlers that do not run JavaScript see the page's real title, description and content:
     dist/<group>.html, dist/<group>/<entry>.html, dist/about.html, ...   (served at /<group>/<entry>)
     dist/index.html                                                     (the overview, rewritten in place)
     dist/404.html                                                       (unknown addresses; the app still resolves old ones)
     dist/sitemap.xml, dist/robots.txt, dist/llms.txt, dist/llms-full.txt
   Each page is the built app shell with its own <head> (title, description, canonical, Open Graph, JSON-LD)
   and a plain, crawlable version of the page inside #root, which React replaces when it starts.
   Titles and descriptions follow src/gallery/seo.ts; keep the two in step.
   Reads: dist/index.html, dist/r/registry.json (from gen-registry), src/gallery/registry.ts (TAXONOMY),
   src/gallery/site.ts, packages/kiln/package.json, CHANGELOG.md, README.md, src/kiln/CLAUDE.md. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const siteTs = read("src/gallery/site.ts");
const SITE = (process.env.KILN_SITE || siteTs.match(/KILN_SITE\s*=\s*"([^"]+)"/)[1]).replace(/\/$/, "");
const REPO = siteTs.match(/KILN_REPO\s*=\s*"([^"]+)"/)[1];
const PKG = siteTs.match(/KILN_PACKAGE\s*=\s*"([^"]+)"/)[1];
const VERSION = JSON.parse(read("packages/kiln/package.json")).version;
const NPM = `https://www.npmjs.com/package/${PKG}`;
const TODAY = new Date().toISOString().slice(0, 10);

const template = readFileSync(join(DIST, "index.html"), "utf8");
if (!template.includes('<div id="root"></div>')) throw new Error("prerender: dist/index.html has no empty #root; run vite build first");
const registry = JSON.parse(readFileSync(join(DIST, "r/registry.json"), "utf8"));
const items = new Map(registry.items.map((it) => [it.name, it]));
const exportNames = new Set([...read("src/kiln/index.ts").matchAll(/\b([A-Z][A-Za-z0-9]+)\b(?=\s*[,}])/g)].map((m) => m[1]));

/* TAXONOMY: sections, their groups and the entries in order. */
const sections = [];
for (const line of read("src/gallery/registry.ts").split("\n")) {
  const sec = line.match(/^    id: "([^"]+)",$/);
  if (sec) sections.push({ id: sec[1], name: "", groups: [] });
  const name = line.match(/^    name: "([^"]+)",$/);
  if (name && sections.length) sections.at(-1).name = name[1];
  const g = line.match(/^\s*\{ id: "([^"]+)", name: "([^"]*)", summary: "((?:[^"\\]|\\.)*)", entries: \[([^\]]*)\] \}/);
  if (g) sections.at(-1).groups.push({
    id: g[1], name: g[2], summary: JSON.parse(`"${g[3]}"`),
    entries: [...g[4].matchAll(/"([^"]+)"/g)].map((m) => items.get(m[1])).filter(Boolean),
  });
}
const groups = sections.flatMap((s) => s.groups);
const total = groups.reduce((n, g) => n + g.entries.length, 0);

/* Copy shared with src/gallery/seo.ts. */
const SITE_DESCRIPTION = "200+ animated React components for Tailwind CSS v4 and Motion: light and dark, 60fps, keyboard-ready. Use the npm package or copy any one in with the shadcn CLI.";
const entryMeta = (e) => ({ title: `${e.title} — Animated React Component | Kiln`, description: `${e.description} A free React component for Tailwind CSS v4 and Motion, in light and dark.` });
const groupMeta = (g) => ({ title: `${g.name} — Animated React Components | Kiln`, description: `${g.summary} ${g.entries.length} free React components for Tailwind CSS v4 and Motion.` });

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u.replace(/^(PRIVACY|TERMS)\.md$/, (m) => "/" + m.slice(0, -3).toLowerCase())}">${t}</a>`);
const pascal = (s) => s.replace(/(^|[\s-])(\w)/g, (_, __, c) => c.toUpperCase()).replace(/[^A-Za-z0-9]/g, "");
const exportFor = (e) => {
  const byName = pascal(e.title);
  if (exportNames.has(byName)) return byName;
  const base = e.files[0]?.path.split("/").pop().replace(/\.tsx?$/, "");
  return base && exportNames.has(base) ? base : null;
};

const APP = {
  "@type": "SoftwareApplication",
  "@id": `${SITE}/#kiln`,
  name: "Kiln",
  description: SITE_DESCRIPTION,
  url: `${SITE}/`,
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "React component library",
  operatingSystem: "Any (web browser)",
  softwareVersion: VERSION,
  license: "https://opensource.org/licenses/MIT",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  downloadUrl: NPM,
  installUrl: NPM,
  softwareRequirements: "React 19, Tailwind CSS v4, Motion",
  screenshot: `${SITE}/og.png`,
  sameAs: [REPO, NPM],
};
const crumbs = (list) => ({
  "@type": "BreadcrumbList",
  itemListElement: list.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: SITE + path })),
});

function page({ path, title, description, body, ld, robots }) {
  const url = SITE + path;
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": ld }).replace(/</g, "\\u003c");
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*"/, `$1${esc(description)}"`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${url}"`)
    .replace(/(<meta property="og:title" content=")[^"]*"/, `$1${esc(title)}"`)
    .replace(/(<meta property="og:description" content=")[^"]*"/, `$1${esc(description)}"`)
    .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${url}"`)
    .replace("</head>", `${robots ? `    <meta name="robots" content="${robots}" />\n` : ""}    <script type="application/ld+json">${json}</script>\n    <style>${STYLE}</style>\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root"><div class="k-static">${nav()}<main>${body}</main>${footer()}</div></div>`);
  return html;
}

const STYLE = ".k-static{max-width:72rem;margin:0 auto;padding:2rem 1.5rem 4rem;font:16px/1.6 'IBM Plex Sans',system-ui,sans-serif;color:var(--k-ink);background:var(--k-ground)}.k-static a{color:var(--k-accent)}.k-static h1{font-size:2rem;line-height:1.15;margin:1.5rem 0 .75rem}.k-static h2{font-size:1.25rem;margin:2rem 0 .5rem}.k-static pre,.k-static code{font-family:'IBM Plex Mono',monospace;font-size:.9em}.k-static pre{overflow:auto;padding:.75rem 1rem;border-radius:12px;background:var(--k-raised)}.k-static nav,.k-static footer{font-size:.875rem;display:flex;flex-wrap:wrap;gap:.25rem 1rem}.k-static footer{margin-top:3rem}.k-static p,.k-static ul{margin:.5rem 0}.k-static ul{padding-left:1.25rem;list-style:disc}";

const nav = () => `<nav aria-label="Kiln"><a href="/"><strong>Kiln</strong></a><a href="/whats-new">What's new</a><a href="/about">About</a><a href="/studio">Theme studio</a><a href="${REPO}">GitHub</a><a href="${NPM}">npm</a></nav>`;
const footer = () => `<footer><span>Kiln ${esc(VERSION)} · MIT licence</span><a href="${REPO}">Source on GitHub</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/sitemap.xml">Sitemap</a></footer>`;

const install = (id, name) => `<h2>Install</h2>
<p>Copy it into your project with the shadcn CLI (it brings the files it depends on):</p>
<pre><code>npx shadcn@latest add ${SITE}/r/${id}.json</code></pre>
<p>Or install the whole library from npm${name ? " and import it" : ""}:</p>
<pre><code>npm i ${PKG} motion lucide-react${name ? `\n\nimport { ${name} } from "${PKG}";` : ""}</code></pre>`;

const groupList = (g) => `<ul>${g.entries.map((e) => `<li><a href="/${g.id}/${e.name}">${esc(e.title)}</a>: ${esc(e.description)}</li>`).join("")}</ul>`;

const pages = [];
const sitemap = [];
const add = (p) => { pages.push(p); if (!p.robots) sitemap.push(p.path); };

/* Overview */
add({
  path: "/",
  file: "index.html",
  title: "Kiln — Animated React Components",
  description: SITE_DESCRIPTION,
  ld: [APP, { "@type": "WebSite", "@id": `${SITE}/#site`, name: "Kiln", url: `${SITE}/`, about: { "@id": `${SITE}/#kiln` } }],
  body: `<h1>Kiln — Animated React Components</h1>
<p>${esc(SITE_DESCRIPTION)} Free and open source under the MIT licence; the source is on <a href="${REPO}">GitHub</a>.</p>
<p>${total} components for React 19, Tailwind CSS v4 and Motion, in light and dark, each with a live demo, its source and its install command. Every component takes its text from props, works from the keyboard, and animates only transform and opacity.</p>
<h2>Install</h2>
<pre><code>npm i ${PKG} motion lucide-react</code></pre>
<p>Or copy single components in with the shadcn CLI: <code>npx shadcn@latest add ${SITE}/r/&lt;component&gt;.json</code>. The registry index is at <a href="/r/registry.json">/r/registry.json</a>.</p>
${sections.map((s) => `<h2>${esc(s.name)}</h2>${s.groups.map((g) => `<h3><a href="/${g.id}">${esc(g.name)}</a></h3><p>${esc(g.summary)}</p>${groupList(g)}`).join("")}`).join("\n")}`,
});

/* Groups and entries */
for (const s of sections) for (const g of s.groups) {
  const gm = groupMeta(g);
  add({
    path: `/${g.id}`,
    ...gm,
    ld: [
      { "@type": "CollectionPage", name: gm.title, description: gm.description, url: `${SITE}/${g.id}`, isPartOf: { "@id": `${SITE}/#site` }, about: { "@id": `${SITE}/#kiln` } },
      crumbs([["Kiln", "/"], [g.name, `/${g.id}`]]),
    ],
    body: `<p><a href="/">Kiln</a> › ${esc(s.name)}</p><h1>${esc(g.name)}</h1><p>${esc(g.summary)}</p>${groupList(g)}`,
  });
  for (const e of g.entries) {
    const em = entryMeta(e);
    const name = exportFor(e);
    const siblings = g.entries.filter((x) => x !== e);
    add({
      path: `/${g.id}/${e.name}`,
      ...em,
      ld: [
        {
          "@type": "SoftwareSourceCode",
          name: `${e.title} (Kiln)`,
          description: e.description,
          url: `${SITE}/${g.id}/${e.name}`,
          codeRepository: REPO,
          programmingLanguage: ["TypeScript", "React"],
          runtimePlatform: "React 19",
          license: "https://opensource.org/licenses/MIT",
          isPartOf: { "@id": `${SITE}/#kiln` },
        },
        crumbs([["Kiln", "/"], [g.name, `/${g.id}`], [e.title, `/${g.id}/${e.name}`]]),
      ],
      body: `<p><a href="/">Kiln</a> › <a href="/${g.id}">${esc(g.name)}</a></p>
<h1>${esc(e.title)}${name ? ` <code>&lt;${name} /&gt;</code>` : ""}</h1>
<p>${esc(e.description)}</p>
<p>An animated React component for Tailwind CSS v4 and Motion, in light and dark. Its text comes from props, it works from the keyboard, and it ships in the free, MIT-licensed Kiln library.</p>
${install(e.name, name)}
<h2>Files</h2>
<p>The copy-in version is these files, kept in Kiln's folder layout:</p>
<ul>${e.files.map((f) => `<li><a href="${REPO}/blob/main/${f.path}"><code>${esc(f.path)}</code></a></li>`).join("")}</ul>
${siblings.length ? `<h2>More in ${esc(g.name)}</h2><ul>${siblings.map((x) => `<li><a href="/${g.id}/${x.name}">${esc(x.title)}</a></li>`).join("")}</ul>` : ""}`,
    });
  }
}

/* Plain pages */
const readme = read("README.md");
const section = (md, heading) => (md.split(`\n## ${heading}\n`)[1] ?? "").split("\n## ")[0].trim();
const paras = (md) => md.split(/\n{2,}/).filter((b) => b.trim() && !b.startsWith("```") && !b.startsWith("|")).map((b) =>
  b.startsWith("#") ? `<h2>${inline(b.replace(/^#+\s*/, ""))}</h2>`
  : b.trim().startsWith("- ") ? `<ul>${b.trim().split("\n").map((l) => `<li>${inline(l.replace(/^-\s*/, ""))}</li>`).join("")}</ul>`
  : `<p>${inline(b.replace(/\n/g, " "))}</p>`).join("\n");

add({
  path: "/about",
  title: "About Kiln — Animated React Components",
  description: "Why Kiln exists, how it is built, and how to use it: npm package or copy-in components for React 19, Tailwind CSS v4 and Motion.",
  ld: [{ "@type": "AboutPage", url: `${SITE}/about`, about: { "@id": `${SITE}/#kiln` } }, APP],
  body: `<h1>About Kiln</h1>${paras(readme.split("\n## ")[0].replace(/^# .*\n/, ""))}<h2>Why Kiln</h2>${paras(section(readme, "Why Kiln"))}<h2>About</h2>${paras(section(readme, "About"))}<h2>Requests, bugs and questions</h2>${paras(section(readme, "Requests, bugs and questions"))}`,
});

const changelog = read("CHANGELOG.md");
add({
  path: "/whats-new",
  title: "What's New in Kiln — Changelog",
  description: "Every Kiln release, newest first: new components, new props, changes and fixes, for the npm package and the copy-in registry alike.",
  ld: [{ "@type": "WebPage", name: "What's new in Kiln", url: `${SITE}/whats-new`, about: { "@id": `${SITE}/#kiln` } }],
  body: `<h1>What's new in Kiln</h1>${paras(changelog.replace(/^# .*\n/, "").replace(/^\[[^\]]+\]:.*$/gm, "").replace(/^## \[([^\]]+)\](?: - (\S+))?/gm, (_, v, d) => `## ${v === "Unreleased" ? "Next release" : v}${d ? ` (${d})` : ""}`).replace(/^### /gm, "## "))}`,
});
add({
  path: "/studio",
  title: "Theme Studio — Kiln",
  description: "Make a Kiln theme: set the colours for light and dark, watch every component update, and download the tokens.css.",
  ld: [{ "@type": "WebPage", name: "Kiln theme studio", url: `${SITE}/studio`, isPartOf: { "@id": `${SITE}/#site` } }],
  body: `<h1>Theme studio</h1><p>Pick a preset or set each colour for light and dark, watch every Kiln component update, then download a <code>tokens.css</code> to drop into your project. It needs JavaScript.</p>`,
});
for (const [doc, title, description] of [
  ["privacy", "Privacy Policy — Kiln", "Kiln collects no personal information: no accounts, cookies, analytics or tracking."],
  ["terms", "Terms of Use — Kiln", "The terms for using the Kiln website, the npm package and the copy-in registry."],
]) add({ path: `/${doc}`, title, description, ld: [{ "@type": "WebPage", name: title, url: `${SITE}/${doc}` }], body: paras(read(`${doc.toUpperCase()}.md`).replace(/^# (.*)$/m, "## $1")).replace("<h2>", "<h1>").replace("</h2>", "</h1>") });

add({
  path: "/404",
  file: "404.html",
  robots: "noindex",
  title: "Page not found — Kiln",
  description: SITE_DESCRIPTION,
  ld: [],
  body: `<h1>Page not found</h1><p>Try the <a href="/">overview</a>, which lists every component.</p>`,
});

for (const p of pages) {
  const file = join(DIST, p.file ?? `${p.path.slice(1)}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page(p));
}

writeFileSync(join(DIST, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((p) => `  <url><loc>${SITE}${p}</loc><lastmod>${TODAY}</lastmod></url>`).join("\n")}
</urlset>
`);
writeFileSync(join(DIST, "robots.txt"), `# Every page is open to search engines and AI crawlers.
User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`);

/* llms.txt (https://llmstxt.org): what Kiln is and where everything is, for AI search and agents. */
const llms = `# Kiln

> ${SITE_DESCRIPTION}

Kiln is a free, open-source (MIT) library of ${total} animated React components. It targets React 19, Tailwind CSS v4 and Motion (the animation library formerly called Framer Motion), with lucide-react icons. Every component works in light and dark mode, takes its text from props, works from the keyboard, and animates only transform and opacity so it holds 60fps. Colours come from design tokens, and colorways derive a whole theme from a ground, an ink and an accent colour.

Two ways to use it, which ship the same code from the same release:

- npm: \`npm i ${PKG} motion lucide-react\`, then \`@import "${PKG}/styles.css";\` after \`@import "tailwindcss";\`, wrap the app in \`ThemeProvider\`, and \`import { Button } from "${PKG}"\`.
- Copy in: \`npx shadcn@latest add ${SITE}/r/<component>.json\` (shadcn registry; index at ${SITE}/r/registry.json), or \`curl -fsSL ${SITE}/kiln-add.mjs | node - <component>\` without shadcn.

The current version is ${VERSION}. Source: ${REPO}. Package: ${NPM}.

## Docs

- [README](${REPO}#readme): install, theming, sizing, controlled and uncontrolled state
- [Guide for AI agents building UI with Kiln](${REPO}/blob/main/src/kiln/CLAUDE.md): setup, the full component catalogue, usage and motion rules (also in the npm package as \`${PKG}/CLAUDE.md\`)
- [Props reference](${REPO}/blob/main/docs/API.md)
- [What's new](${SITE}/whats-new): every release ([CHANGELOG.md](${REPO}/blob/main/CHANGELOG.md))
- [Theme studio](${SITE}/studio)

${sections.map((s) => `## ${s.name}\n\n${s.groups.map((g) => g.entries.map((e) => `- [${e.title}](${SITE}/${g.id}/${e.name}): ${e.description}`).join("\n")).join("\n")}`).join("\n\n")}

## Optional

- [Full guide in one file](${SITE}/llms-full.txt)
- [Privacy](${SITE}/privacy) and [terms](${SITE}/terms)
`;
writeFileSync(join(DIST, "llms.txt"), llms);
writeFileSync(join(DIST, "llms-full.txt"), `${llms}\n---\n\n${read("src/kiln/CLAUDE.md")}`);

console.log(`prerender: ${pages.length} pages, ${sitemap.length} in the sitemap, llms.txt with ${total} components -> dist/`);
