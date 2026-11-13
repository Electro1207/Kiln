#!/usr/bin/env node
/* Generates the copy-in registry (shadcn registry-item schema, https://ui.shadcn.com/schema/registry-item.json):
     public/r/<entry-id>.json   one item per gallery entry, with its source files
     public/r/kiln-base.json    cn, motion, controllable, theme, tokens.css, kiln.css (+ CLAUDE.md)
     public/r/kiln-<helper>.json  shared helpers (Anchored, Field, useOverlay, useLoop, ...)
     public/r/registry.json     the index
     public/r/stats.json        the version and the number of components, for other sites to show
     public/kiln-add.mjs        the zero-dependency installer (copy of scripts/kiln-add.mjs)
   Entries come from src/gallery/demos/*.tsx; what each needs comes from the real relative imports of its files,
   so a component edited by anyone stays in sync. Files keep their src/kiln/... layout (target), so relative imports work.
   Re-runnable; wired into `npm run build` (and `npm run gen:registry`).
   Environment: KILN_OUT=<dir> writes <dir>/r/ instead of public/r/.
   Base URL: KILN_SITE from src/gallery/site.ts, or the KILN_SITE environment variable (e.g. http://localhost:4173). */
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, posix } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const KILN = join(SRC, "kiln");
const OUT = process.env.KILN_OUT ? join(process.env.KILN_OUT, "r") : join(ROOT, "public/r"); // KILN_OUT: write elsewhere (e.g. to test against a local server)
const SITE = (process.env.KILN_SITE || readFileSync(join(SRC, "gallery/site.ts"), "utf8").match(/KILN_SITE\s*=\s*"([^"]+)"/)?.[1] || "").replace(/\/$/, "");
if (!SITE) throw new Error("KILN_SITE not found in src/gallery/site.ts");

const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const NPM = ["motion", "lucide-react"]; // react and react-dom are assumed present
const npmSpec = (n) => `${n}@${rootPkg.dependencies[n]}`;

const rel = (abs) => relative(ROOT, abs).split("\\").join("/");
const url = (name) => `${SITE}/r/${name}.json`;
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2").toLowerCase();
const str = (lit) => { try { return JSON.parse(lit); } catch { return lit.slice(1, -1); } };

const entries = [];
for (const f of readdirSync(join(SRC, "gallery/demos")).filter((n) => n.endsWith(".tsx")).sort()) {
  const s = readFileSync(join(SRC, "gallery/demos", f), "utf8");
  const re = /id:\s*"([^"]+)",\s*name:\s*("(?:[^"\\]|\\.)*"),\s*summary:\s*("(?:[^"\\]|\\.)*"),\s*files:\s*\[([^\]]*)\]\s*,\s*Demo:/g;
  for (const m of s.matchAll(re))
    entries.push({ id: m[1], name: str(m[2]), summary: str(m[3]), files: [...m[4].matchAll(/"([^"]+)"/g)].map((x) => x[1]), demoFile: f });
}
const reg = readFileSync(join(SRC, "gallery/registry.ts"), "utf8");
const order = new Map();
{
  let section = "";
  let n = 0;
  for (const line of reg.split("\n")) {
    const sec = line.match(/^    id: "([^"]+)",$/);
    if (sec) section = sec[1];
    const g = line.match(/^\s*\{ id: "([^"]+)", name: "[^"]*", summary: "(?:[^"\\]|\\.)*", entries: \[([^\]]*)\] \}/);
    if (g) for (const e of g[2].matchAll(/"([^"]+)"/g)) order.set(e[1], { group: g[1], section, n: n++ });
  }
}
entries.sort((a, b) => (order.get(a.id)?.n ?? 1e6) - (order.get(b.id)?.n ?? 1e6) || a.id.localeCompare(b.id));
const ids = new Set();
for (const e of entries) { if (ids.has(e.id)) throw new Error(`duplicate entry id ${e.id}`); ids.add(e.id); }

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const GENERATED = (p) => p === join(KILN, "index.ts") || p.startsWith(join(KILN, "groups") + "/");
const all = walk(KILN).filter((p) => /\.(tsx?|css)$/.test(p) && !p.endsWith(".d.ts") && !GENERATED(p));
const known = new Set(all);
const text = new Map(all.map((p) => [p, readFileSync(p, "utf8")]));

function resolveImport(from, spec) {
  const base = join(dirname(from), spec);
  for (const c of [base, base + ".ts", base + ".tsx", base + ".css", join(base, "index.ts"), join(base, "index.tsx")])
    if (known.has(c)) return c;
  return null;
}
function importsOf(p) {
  const src = text.get(p);
  const rels = new Set();
  const pkgs = new Set();
  for (const m of src.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g)) {
    const spec = m[1];
    if (spec.startsWith(".")) {
      const r = resolveImport(p, spec);
      if (!r) throw new Error(`${rel(p)}: cannot resolve ${spec}`);
      rels.add(r);
    } else if (p.endsWith(".css")) continue;
    else pkgs.add(spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);
  }
  if (p.endsWith(".css")) for (const m of src.matchAll(/@import\s+"(\.[^"]+)"/g)) { const r = resolveImport(p, m[1]); if (r) rels.add(r); }
  return { rels, pkgs };
}

const BASE = ["cn.ts", "motion.ts", "controllable.ts", "theme.tsx", "glaze.ts", "tokens.css", "kiln.css"].map((n) => join(KILN, n));
for (const b of BASE) if (!known.has(b)) throw new Error(`missing base file ${rel(b)}`);
const isHelper = (p) => p.includes("/components/shared/") || (p.endsWith(".ts") && p.includes("/components/"));
const owner = new Map();
for (const b of BASE) owner.set(b, "kiln-base");
const abs = (repoPath) => join(ROOT, repoPath);
const listed = (e) => e.files.map(abs).filter((p) => known.has(p));
// A component file named like an entry (PromptInput.tsx -> prompt-input) belongs to that entry.
for (const e of entries) for (const p of listed(e)) if (!owner.has(p) && p.endsWith(".tsx") && !isHelper(p) && kebab(posix.basename(p, ".tsx")) === e.id) owner.set(p, e.id);
// Otherwise the first component of an entry belongs to that entry.
for (const e of entries) {
  const first = listed(e).find((p) => !owner.has(p) && !isHelper(p) && p.endsWith(".tsx"));
  if (first && !owner.has(first)) owner.set(first, e.id);
}
// Other component files an entry lists, and nobody owns yet, go with the first entry that lists them.
for (const e of entries) for (const p of listed(e)) if (!owner.has(p) && !isHelper(p) && p.endsWith(".tsx")) owner.set(p, e.id);
// Helpers and anything left over become their own items.
const taken = new Set([...ids, "kiln-base", "registry"]);
for (const p of all) {
  if (owner.has(p) || p.endsWith("CLAUDE.md")) continue;
  let name = `kiln-${kebab(posix.basename(rel(p)).replace(/\.\w+$/, ""))}`;
  if (!isHelper(p)) { const plain = kebab(posix.basename(rel(p)).replace(/\.\w+$/, "")); if (!taken.has(plain)) name = plain; }
  if (taken.has(name) && ![...owner.values()].includes(name)) throw new Error(`item name clash: ${name}`);
  taken.add(name);
  owner.set(p, name);
}

const items = new Map();
const item = (name) => items.get(name) ?? items.set(name, { name, files: [] }).get(name);
for (const [p, name] of owner) item(name).files.push(p);
for (const e of entries) Object.assign(item(e.id), { title: e.name, description: e.summary, entry: e });
const base = item("kiln-base");
Object.assign(base, { title: "Kiln base", description: "Kiln's shared code and styles: cn, motion presets, useControllable, ThemeProvider and glazes, tokens.css and kiln.css. Every other Kiln item depends on it." });
const guide = join(KILN, "CLAUDE.md");
if (existsSync(guide)) base.extraFiles = [guide];
for (const it of items.values()) if (!it.title) { it.title = it.name.replace(/^kiln-/, "Kiln ").replace(/-/g, " "); it.description ??= `Shared Kiln helper (${it.files.map((f) => posix.basename(rel(f))).join(", ")}).`; }

for (const it of items.values()) {
  it.files.sort();
  const deps = new Set();
  const pkgs = new Set();
  for (const p of it.files) {
    const { rels, pkgs: ps } = importsOf(p);
    for (const r of rels) { const o = owner.get(r); if (o && o !== it.name) deps.add(o); }
    for (const x of ps) if (NPM.includes(x)) pkgs.add(x);
  }
  it.deps = deps;
  it.pkgs = [...pkgs].sort();
}
// A demo may list files it shows but does not import (a composite like "conversation"): depend on their owners too, unless that would make a cycle.
const reaches = (from, to, seen = new Set()) => from === to || (!seen.has(from) && (seen.add(from), [...items.get(from).deps].some((d) => reaches(d, to, seen))));
for (const it of items.values()) if (it.entry) for (const p of listed(it.entry)) {
  const o = owner.get(p);
  if (o && o !== it.name && !it.deps.has(o) && !reaches(o, it.name)) it.deps.add(o);
}
for (const it of items.values()) {
  if (it.name !== "kiln-base") it.deps.add("kiln-base");
  it.deps = [...it.deps].sort();
}
// cycle check: a registry cannot resolve a cycle.
{
  const state = new Map();
  const visit = (n, trail) => {
    if (state.get(n) === 2) return;
    if (state.get(n) === 1) throw new Error(`registry dependency cycle: ${[...trail, n].join(" -> ")}`);
    state.set(n, 1);
    for (const d of items.get(n).deps) visit(d, [...trail, n]);
    state.set(n, 2);
  };
  for (const n of items.keys()) visit(n, []);
}

const BASE_DOCS = [
  "Kiln base installed. Wire it up once:",
  '1. In your main CSS, after Tailwind: @import "tailwindcss"; @import "./kiln/kiln.css";  (path relative to that CSS file; src/index.css -> "./kiln/kiln.css")',
  "2. Wrap your app: <ThemeProvider><MotionConfig reducedMotion=\"user\"><App /></MotionConfig></ThemeProvider> (ThemeProvider from src/kiln/theme, MotionConfig from motion/react).",
  "3. Load the IBM Plex Sans font if you want the default type.",
  "Tailwind v4 is required (@tailwindcss/vite or the PostCSS plugin). Full guide: src/kiln/CLAUDE.md.",
].join("\n");

function fileEntry(p, withContent) {
  const path = rel(p);
  const f = { path, type: "registry:file", target: path };
  if (withContent) f.content = readFileSync(p, "utf8");
  return f;
}
function build(it, withContent) {
  const o = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: it.name,
    type: it.name === "kiln-base" || !it.entry ? "registry:lib" : "registry:component",
    title: it.title,
    description: it.description,
    author: "Electro1207 <https://github.com/Electro1207>",
  };
  if (it.pkgs.length) o.dependencies = it.pkgs.map(npmSpec);
  if (it.deps.length) o.registryDependencies = it.deps.map(url);
  o.files = [...it.files, ...(it.extraFiles ?? [])].map((p) => fileEntry(p, withContent));
  const group = it.entry && order.get(it.entry.id);
  if (group) {
    o.categories = [group.section, group.group];
    o.docs = `Live demo, props and examples: ${SITE}/${group.group}/${it.entry.id}`;
  }
  if (it.name === "kiln-base") o.docs = BASE_DOCS;
  return o;
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const sorted = [...items.values()].sort((a, b) => (a.name === "kiln-base" ? -1 : b.name === "kiln-base" ? 1 : a.name.localeCompare(b.name)));
for (const it of sorted) writeFileSync(join(OUT, `${it.name}.json`), JSON.stringify(build(it, true), null, 2) + "\n");
writeFileSync(join(OUT, "registry.json"), JSON.stringify({
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "kiln",
  homepage: SITE,
  items: sorted.map((it) => { const { $schema: _schema, ...rest } = build(it, false); return rest; }),
}, null, 2) + "\n");
// A few figures other sites can show without loading the whole index (served with CORS like the rest of /r/).
const version = JSON.parse(readFileSync(join(ROOT, "packages/kiln/package.json"), "utf8")).version;
writeFileSync(join(OUT, "stats.json"), JSON.stringify({ version, components: entries.length, items: items.size }) + "\n");
copyFileSync(join(ROOT, "scripts/kiln-add.mjs"), join(dirname(OUT), "kiln-add.mjs"));
console.log(`gen-registry: ${entries.length} entries, ${items.size} items (${items.size - entries.length} helpers/base) -> ${rel(OUT)}/*.json, base ${SITE}`);
