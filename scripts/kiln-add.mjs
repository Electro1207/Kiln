#!/usr/bin/env node
/* Zero-dependency installer for Kiln's copy-in registry. No shadcn, no npm install needed.
     node scripts/kiln-add.mjs alert dialog tabs
     curl -fsSL https://usekiln.pages.dev/kiln-add.mjs | node - alert dialog
   Fetches <site>/r/<name>.json (and everything it depends on), writes each file to its
   target path under the current directory, and prints the npm packages to install.
   Options: --site <url> (or env KILN_SITE), --dir <path>, --overwrite, --list. */
import { closeSync, constants, existsSync, mkdirSync, openSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";

const DEFAULT_SITE = "https://usekiln.pages.dev"; // keep in step with KILN_SITE in src/gallery/site.ts
const args = process.argv.slice(2);
const flag = (n) => { const i = args.indexOf(n); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const bool = (n) => { const i = args.indexOf(n); if (i < 0) return false; args.splice(i, 1); return true; };
const site = (flag("--site") || process.env.KILN_SITE || DEFAULT_SITE).replace(/\/$/, "");
const dir = resolve(flag("--dir") || ".");
const overwrite = bool("--overwrite");
const list = bool("--list");

/* Only Kiln's own registry is trusted: items are fetched from the site's /r/ folder (or a local
   .json file the user names), never from a URL that came out of a downloaded item. */
const siteOrigin = new URL(site).origin;
const NAME = /^[a-z0-9][a-z0-9-]*$/;
function sourceOf(ref, fromUser) {
  if (/^https?:\/\//.test(ref)) {
    const u = new URL(ref);
    if (!fromUser && u.origin !== siteOrigin) throw new Error(`refusing to fetch from another site: ${ref}`);
    return u.href;
  }
  if (fromUser && /\.json$/.test(ref) && existsSync(ref)) return null;
  if (!NAME.test(ref)) throw new Error(`not a registry item name: ${ref}`);
  return `${site}/r/${ref}.json`;
}
async function getJson(ref, fromUser = false) {
  const src = sourceOf(ref, fromUser);
  if (src === null) return JSON.parse(readFileSync(ref, "utf8"));
  const res = await fetch(src);
  if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
  return res.json();
}

if (list) {
  const idx = await getJson(`${site}/r/registry.json`);
  for (const i of idx.items) console.log(i.name.padEnd(28), i.title);
  process.exit(0);
}
if (!args.length) {
  console.error("usage: kiln-add <name|url> [...]   (names: alert, dialog, tabs, ...; --list shows all)\n       options: --site <url>  --dir <path>  --overwrite");
  process.exit(1);
}

const seen = new Set();
const npm = new Set();
const written = [];
const skipped = [];
const docs = [];
/* Every file goes under src/kiln/, with a plain relative path and a source-file extension. */
const TARGET = /^src\/kiln\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:tsx?|css|md)$/;
const PKG = /^(?:@[a-z0-9][a-z0-9._-]*\/)?[a-z0-9][a-z0-9._-]*(?:@[\w.^~<>=|* -]+)?$/;
const root = (mkdirSync(dir, { recursive: true }), realpathSync(dir));
function safeOut(target) {
  if (typeof target !== "string" || !TARGET.test(target) || target.split("/").includes("..")) throw new Error(`refusing an unexpected file path: ${target}`);
  const out = resolve(root, target);
  if (!out.startsWith(root + sep)) throw new Error(`refusing to write outside ${root}: ${target}`);
  mkdirSync(dirname(out), { recursive: true });
  const parent = realpathSync(dirname(out)); // a symlinked folder must not lead out of the project
  if (parent !== root && !parent.startsWith(root + sep)) throw new Error(`refusing to write through a link: ${target}`);
  return out;
}
async function add(ref, fromUser = false) {
  const key = sourceOf(ref, fromUser) ?? resolve(ref);
  if (seen.has(key)) return;
  seen.add(key);
  const it = await getJson(ref, fromUser);
  for (const d of it.registryDependencies ?? []) await add(d);
  for (const d of it.dependencies ?? []) {
    if (typeof d !== "string" || !PKG.test(d)) throw new Error(`refusing an unexpected package name: ${d}`);
    npm.add(d);
  }
  for (const f of it.files ?? []) {
    const target = f.target || f.path;
    const out = safeOut(target);
    if (typeof f.content !== "string") throw new Error(`no content for ${target}`);
    const { O_WRONLY, O_RDONLY, O_CREAT, O_EXCL, O_TRUNC, O_NOFOLLOW } = constants;
    let fd;
    try {
      fd = openSync(out, O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW, 0o644);
    } catch (e) {
      if (e.code !== "EEXIST") throw e;
      if (!overwrite) {
        const rd = openSync(out, O_RDONLY | O_NOFOLLOW);
        try { if (readFileSync(rd, "utf8") !== f.content) skipped.push(target); } finally { closeSync(rd); }
        continue;
      }
      fd = openSync(out, O_WRONLY | O_TRUNC | O_NOFOLLOW);
    }
    try { writeFileSync(fd, f.content); } finally { closeSync(fd); }
    written.push(target);
  }
  if (it.docs) docs.push(it.docs);
}
for (const a of args) await add(a, true);

console.log(`Wrote ${written.length} file${written.length === 1 ? "" : "s"}${written.length ? ":" : "."}`);
for (const w of written) console.log("  " + w);
if (skipped.length) console.log(`Kept ${skipped.length} existing file(s) that differ (use --overwrite to replace):\n  ` + skipped.join("\n  "));
if (npm.size) console.log(`\nInstall the packages they use:\n  npm i ${[...npm].join(" ")}`);
if (written.some((w) => w.endsWith("kiln.css"))) console.log("\n" + docs.join("\n"));
