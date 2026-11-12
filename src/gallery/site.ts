/* The one place the gallery names where Kiln is published. The scripts (scripts/gen-registry.mjs) read
   KILN_SITE from this file, and README.md uses the same values. */

/** Where the built gallery is deployed. It serves the shadcn registry at `${KILN_SITE}/r/<id>.json`. */
export const KILN_SITE = "https://usekiln.pages.dev";

/** The npm package name. */
export const KILN_PACKAGE = "@electro1207/kiln";
