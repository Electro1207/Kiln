/* Merges every `meta` export in this folder. Add a file, it shows up; no list to keep in step. */
import type { A11yMeta, A11yMetaMap } from "./types";

const files = import.meta.glob<{ meta?: A11yMetaMap }>(["./*.ts", "!./index.ts", "!./types.ts"], { eager: true });

export const A11Y_META: A11yMetaMap = Object.assign({}, ...Object.values(files).map((m) => m.meta ?? {}));

export function a11yMetaFor(entryId: string): A11yMeta | undefined {
  return A11Y_META[entryId];
}

export type { A11yMeta, A11yMetaMap };
