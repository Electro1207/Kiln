/* Gallery-only: the "Accessibility view". A header toggle (saved, or `?a11y=1`), a marker in the
   sidebar, and an Accessibility tab on every entry that has notes in `a11y-meta/`. */
import { Fragment, useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { ScanEye } from "lucide-react";
import type { A11yMeta } from "./a11y-meta";
import { setA11yView, useA11yView } from "./a11yViewStore";
import type { Entry } from "./types";
import { AccessibilityScope, resolveA11y, type A11yProfile, type A11yFeatureKey, type AccessibilityFeaturesProp, A11Y_PROFILES, type A11yBooleanKey } from "../kiln/a11y";
import { accessibilityMenuLabels } from "../kiln/components/accessibility/AccessibilityMenu";
import { ToggleButton } from "../kiln/components/buttons/ToggleButton";
import { ChipFilter } from "../kiln/components/pickers/ChipFilter";
import { Tooltip } from "../kiln/components/overlays/Tooltip";
import { Kbd } from "../kiln/components/data-display/Kbd";
import { ToastProvider } from "../kiln/components/notices/Toast";
import { easeOut } from "../kiln/motion";

/* ---------- header toggle ---------- */
export function A11yViewToggle() {
  const on = useA11yView();
  return (
    <Tooltip content="Show what each component does for accessibility" side="bottom">
      <span className="inline-flex">
        <ToggleButton size="sm" pressed={on} onPressedChange={setA11yView} icon={<ScanEye />} aria-label="A11y view" className="min-w-9 max-sm:px-0">
          <span className="max-sm:hidden">A11y view</span>
        </ToggleButton>
      </span>
    </Tooltip>
  );
}

/* ---------- the tab ---------- */
const NOTE_PLAIN = "Uses the page-wide settings (text size, spacing, focus, contrast, targets).";
export function A11yPlainNote() {
  return <p className="mb-4 text-[13px] text-muted">{NOTE_PLAIN}</p>;
}

const profileNames = accessibilityMenuLabels.profiles;
const chipOptions = [
  { value: "none", label: "None" },
  ...A11Y_PROFILES.map((p) => ({ value: p, label: profileNames[p].name })),
  { value: "all", label: "All" },
];

const WORDS = new Set(["or", "and", "then", "+"]);
/** "Space or Enter" -> two keys; "← →" -> two keys; "Ctrl + K" -> a combo; anything longer stays one cap. */
function Keys({ text }: { text: string }) {
  const parts = text.split(/\s+(or|then)\s+/);
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {parts.map((p, i) =>
        WORDS.has(p) ? <span key={i} className="text-[13px] text-muted">{p}</span> : (
          <Fragment key={i}>
            {p.split(/\s+\+\s+/).map((combo, j) => {
              const caps = combo.split(" ").every((w) => [...w].length <= 5) ? combo.split(" ") : [combo];
              return (
                <Fragment key={j}>
                  {j > 0 && <span className="text-[13px] text-muted">+</span>}
                  <span className="inline-flex gap-1">{caps.map((c, k) => <Kbd key={k} size="sm">{c}</Kbd>)}</span>
                </Fragment>
              );
            })}
          </Fragment>
        ),
      )}
    </span>
  );
}

const featureCopy = (k: A11yFeatureKey) =>
  k === "textScale" ? { name: "Text size", hint: "Text grows to 112, 125 or 150% of its size." } : accessibilityMenuLabels.features[k as A11yBooleanKey];

function Heading({ children }: { children: string }) {
  return <h3 className="mb-2 text-sm font-semibold">{children}</h3>;
}

export function A11yTab({ entry, meta }: { entry: Entry; meta: A11yMeta }) {
  const [choice, setChoice] = useState<string>("none");
  const features: AccessibilityFeaturesProp = choice === "none" || choice === "all" ? choice : (choice as A11yProfile);
  const active = resolveA11y(features);
  const stage = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  /* Changing the scope changes the demo in place (no remount). A short dip hides the reflow. */
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (stage.current) animate(stage.current, { opacity: [0.3, 1] }, { duration: 0.32, ease: easeOut });
  }, [choice]);
  const on = (k: A11yFeatureKey) => (k === "textScale" ? active.textScale > 1 : !!active[k as A11yBooleanKey]);
  return (
    <div>
      <ChipFilter
        multiple={false}
        label={`Preview ${entry.name} with a profile`}
        options={chipOptions}
        value={choice}
        onChange={(v) => setChoice(v ?? "none")}
        className="mb-4"
      />
      <div ref={stage}>
        <AccessibilityScope features={features}>
          <ToastProvider><entry.Demo /></ToastProvider>
        </AccessibilityScope>
      </div>
      <div className="mt-6 grid gap-x-10 gap-y-6 md:grid-cols-2">
        <section aria-label="What changes">
          <Heading>What changes</Heading>
          {meta.features.length ? (
            <ul className="space-y-2.5">
              {meta.features.map((k) => {
                const c = featureCopy(k);
                return (
                  <li key={k} className="flex items-baseline gap-3 text-[14px]">
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted"> {c.hint}</span>
                    </span>
                    {on(k) && <span className="shrink-0 text-xs font-medium text-accent">On</span>}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[14px] text-muted">{NOTE_PLAIN}</p>
          )}
        </section>
        {meta.keys && meta.keys.length > 0 && (
          <section aria-label="Keyboard">
            <Heading>Keyboard</Heading>
            <table className="w-full text-[14px]">
              <thead className="sr-only"><tr><th scope="col">Keys</th><th scope="col">Does</th></tr></thead>
              <tbody className="divide-y divide-line">
                {meta.keys.map(([keys, does]) => (
                  <tr key={keys + does} className="align-top">
                    <th scope="row" className="w-[42%] py-2 pr-3 text-left font-normal"><Keys text={keys} /></th>
                    <td className="py-2 text-muted">{does}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {(meta.pattern || meta.notes.length > 0) && (
          <section aria-label="Pattern and notes" className="md:col-span-2">
            {meta.pattern && (
              <p className="mb-3 text-[14px]"><span className="font-medium">ARIA pattern</span> <span className="text-muted">{meta.pattern}</span></p>
            )}
            {meta.notes.length > 0 && (
              <ul className="max-w-[75ch] list-disc space-y-1.5 pl-5 text-[14px] text-muted marker:text-faint">
                {meta.notes.map((n) => <li key={n}>{n}</li>)}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
