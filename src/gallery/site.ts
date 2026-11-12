/* The one place the gallery names where Kiln is published. The scripts (scripts/gen-registry.mjs) read
   KILN_SITE from this file, and README.md uses the same values. */

/** Where the built gallery is deployed. It serves the shadcn registry at `${KILN_SITE}/r/<id>.json`. */
export const KILN_SITE = "https://usekiln.pages.dev";

/** The npm package name. */
export const KILN_PACKAGE = "@electro1207/kiln";

/** The source repository, and where people ask for things. */
export const KILN_REPO = "https://github.com/Electro1207/Kiln";
export const KILN_LINKS = {
  feature: `${KILN_REPO}/issues/new?template=feature_request.yml`,
  bug: `${KILN_REPO}/issues/new?template=bug_report.yml`,
  discussions: `${KILN_REPO}/discussions`,
};
