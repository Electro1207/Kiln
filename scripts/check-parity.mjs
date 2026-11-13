#!/usr/bin/env node
/* npm and the copy-in registry must ship the same library. Fails when a file under src/kiln/ is missing
   from the registry (public/r/), or when an export of the npm entry point comes from a file that no
   registry item carries. Run after `npm run gen:registry` (it is part of `npm run build`). */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KILN = join(ROOT, "src/kiln");
const rel = (p) => relative(ROOT, p).split("\\").join("/");
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const generated = (p) => p === join(KILN, "index.ts") || p.startsWith(join(KILN, "groups") + "/");
const library = walk(KILN).filter((p) => /\.(tsx?|css)$/.test(p) && !p.endsWith(".d.ts") && !generated(p)).map(rel);

const index = JSON.parse(readFileSync(join(ROOT, "public/r/registry.json"), "utf8"));
const shipped = new Set();
for (const it of index.items) {
  const item = JSON.parse(readFileSync(join(ROOT, "public/r", `${it.name}.json`), "utf8"));
  for (const f of item.files ?? []) shipped.add(f.target ?? f.path);
}
const has = (f) => shipped.has(f) || shipped.has(f.replace(/^src\//, ""));
const missing = library.filter((f) => !has(f));

const exportsFrom = [...readFileSync(join(KILN, "index.ts"), "utf8").matchAll(/from "\.\/([^"]+)"/g)].map((m) => m[1]);
const unshippedExports = exportsFrom.filter((spec) => !["", ".ts", ".tsx"].some((ext) => has(`src/kiln/${spec}${ext}`)));

if (missing.length || unshippedExports.length) {
  if (missing.length) console.error(`In the npm package but not the registry:\n  ${missing.join("\n  ")}`);
  if (unshippedExports.length) console.error(`Exported on npm but carried by no registry item:\n  ${unshippedExports.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-parity: all ${library.length} library files and ${exportsFrom.length} export sources are in the registry`);
