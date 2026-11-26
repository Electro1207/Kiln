/* Gallery-only: what the "Accessibility view" shows for an entry. Not part of the library. */
import type { A11yFeatureKey } from "../../kiln/a11y";

export type A11yMeta = {
  /** Features from `A11yFeatures` this entry's component reacts to (beyond the page-wide CSS ones). */
  features: A11yFeatureKey[];
  /** The WAI-ARIA pattern it follows, e.g. "Listbox", "Dialog (modal)", "Toolbar". */
  pattern?: string;
  /** Keyboard map: [keys, what they do], e.g. ["← →", "Move between tabs"]. */
  keys?: [string, string][];
  /** Short plain sentences: what changes for people, e.g. "Pauses on hover and focus". */
  notes: string[];
};

/** Each package's file in this folder exports `meta`, keyed by gallery entry id. */
export type A11yMetaMap = Record<string, A11yMeta>;
