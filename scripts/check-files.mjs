// Checks every gallery entry's `files` list (the Code tab) against the real dependencies of its
// primary file: the transitive local imports (recipe: src/kiln/CLAUDE.md section 3).
// Reports missing and extra files. `--fix` rewrites each list: primary first, then the entry's
// existing order for files that are still needed, then missing ones in discovery order.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve, relative } from "node:path";

const root = resolve(import.meta.dirname, "..");
const fix = process.argv.includes("--fix");

const importsOf = new Map();
function localImports(abs) {
  if (importsOf.has(abs)) return importsOf.get(abs);
  const src = readFileSync(abs, "utf8");
  const out = [];
  for (const m of src.matchAll(/(?:from\s+|import\s*\(\s*|import\s+)"(\.[^"]*)"/g)) {
    const p = resolve(dirname(abs), m[1]);
    const hit = [".tsx", ".ts", ""].map((e) => p + e).find((f) => existsSync(f) && /\.(tsx?)$/.test(f));
    if (hit) out.push(hit);
  }
  importsOf.set(abs, out);
  return out;
}
function deps(abs) {
  const seen = new Set();
  const walk = (f) => { for (const d of localImports(f)) if (!seen.has(d) && d !== abs) { seen.add(d); walk(d); } };
  walk(abs);
  return [...seen].map((f) => relative(root, f));
}

const dirs = ["src/gallery/demos", "src/gallery/demos/parts"].map((d) => join(root, d));
let bad = 0, total = 0, fixed = 0;
for (const dir of dirs) {
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".tsx"))) {
    const file = join(dir, name);
    let text = readFileSync(file, "utf8");
    let changed = false;
    const re = /files:\s*\[([^\]]*)\]/g;
    const edits = [];
    for (const m of text.matchAll(re)) {
      const list = [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
      const before = text.slice(0, m.index);
      const id = [...before.matchAll(/\bid:\s*"([^"]+)"/g)].pop()?.[1] ?? "?";
      if (!list.length) continue; // not a gallery entry (e.g. a chat message's attachments)
      total++;
      const primary = resolve(root, list[0]);
      if (!existsSync(primary)) { console.log(`${relative(root, file)} [${id}]: primary file not found: ${list[0]}`); bad++; continue; }
      const want = deps(primary);
      const have = list.slice(1);
      const missing = want.filter((f) => !have.includes(f));
      const extra = have.filter((f) => !want.includes(f));
      const dup = have.length !== new Set(have).size;
      if (missing.length || extra.length || dup) {
        console.log(`${relative(root, file)} [${id}]${missing.length ? ` missing: ${missing.join(", ")}` : ""}${extra.length ? ` extra: ${extra.join(", ")}` : ""}${dup ? " duplicates" : ""}`);
        if (fix) {
          const next = [list[0], ...have.filter((f) => want.includes(f)).filter((f, i, a) => a.indexOf(f) === i), ...missing];
          edits.push([m.index, m[0].length, `files: [${next.map((f) => JSON.stringify(f)).join(", ")}]`]);
          fixed++;
        } else bad++;
      }
    }
    for (const [i, len, rep] of edits.reverse()) { text = text.slice(0, i) + rep + text.slice(i + len); changed = true; }
    if (changed) writeFileSync(file, text);
  }
}
console.log(fix ? `check-files: fixed ${fixed} of ${total} entries` : bad ? `check-files: ${bad} of ${total} entries differ (run with --fix)` : `check-files: all ${total} entries match`);
process.exit(!fix && bad ? 1 : 0);
