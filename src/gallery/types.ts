import type { ComponentType } from "react";

export type Entry = {
  /** kebab-case, unique across the gallery; becomes the anchor id. */
  id: string;
  name: string;
  /** One sentence: what it is for. */
  summary: string;
  /** Paths from the project root of the files to copy, e.g. "src/kiln/components/buttons/Button.tsx". */
  files: string[];
  Demo: ComponentType;
};

export type Category = {
  id: string;
  name: string;
  summary: string;
  entries: Entry[];
};
