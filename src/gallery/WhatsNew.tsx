import changelog from "../../CHANGELOG.md?raw";
import pkg from "../../packages/kiln/package.json";
import { Changelog, parseChangelog } from "../kiln/components/marketing/Changelog";
import { KILN_PACKAGE, KILN_REPO } from "./site";

// An empty Unreleased section (right after a release) is left out.
const releases = parseChangelog(changelog).filter((r) => r.changes.length || r.body);
const date = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** CHANGELOG.md, as the gallery's What's new page. */
export function WhatsNew() {
  return (
    <Changelog
      title="What's new in Kiln"
      description={
        <>
          Every release, newest first. The npm package {KILN_PACKAGE} and the copy-in registry ship from the same release, so this is true for both. The current version is {pkg.version};{" "}
          <a href={`${KILN_REPO}/blob/main/CHANGELOG.md`} target="_blank" rel="noreferrer" className="text-accent underline decoration-current/40 underline-offset-2 hover:decoration-current">CHANGELOG.md</a> holds the same list.
        </>
      }
      releases={releases}
      filter
      markLatest
      initialCount={6}
      idPrefix="v"
      formatDate={date}
      cardClassName="bg-raised!"
    />
  );
}
