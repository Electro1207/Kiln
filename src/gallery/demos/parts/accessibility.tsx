import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Accessibility, Heart, Megaphone, Rocket, Siren } from "lucide-react";
import { Stage, Variant, Btn, IBtn } from "../../ui";
import { Button } from "../../../kiln/components/buttons/Button";
import { Switch } from "../../../kiln/components/choice-controls/Switch";
import { TextField } from "../../../kiln/components/text-input/TextField";
import { StatusDot } from "../../../kiln/components/status/StatusDot";
import { WordRotate } from "../../../kiln/components/text-effects/WordRotate";
import { Marquee } from "../../../kiln/components/media/Marquee";
import { useToast } from "../../../kiln/components/notices/Toast";
import { AccessibilityMenu } from "../../../kiln/components/accessibility/AccessibilityMenu";
import { SkipLink } from "../../../kiln/components/accessibility/SkipLink";
import { VisuallyHidden } from "../../../kiln/components/accessibility/VisuallyHidden";
import { announce, type Politeness } from "../../../kiln/components/accessibility/announce";
import { AccessibilityScope, useA11yProps, type AccessibilityFeaturesProp } from "../../../kiln/a11y";

/** A small page to try the settings on: type, buttons, a form control, something that pulses and something that moves. */
function TestSheet() {
  return (
    <div className="w-full max-w-xl rounded-card border border-line bg-surface p-5">
      <h3 className="text-base font-semibold text-ink">Mos Eisley Cantina</h3>
      <p className="mt-2 text-sm text-ink">
        You will never find a more wretched hive of scum and villainy. We must be cautious.
        Every drink here is poured twice, and nobody asks where the ship came from.
      </p>
      <p className="mt-3 text-sm text-muted">Docking bay 94 is open until the second sun sets.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Btn size="sm" leading={<Rocket />}>Book a passage</Btn>
        <Btn size="sm" variant="outline">Ask for Han</Btn>
        <IBtn aria-label="Favourite" icon={<Heart />} size="sm" variant="outline" />
        <Switch size="sm" label="Droids welcome" defaultChecked />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink">
        <span className="inline-flex items-center gap-2"><StatusDot status="online" pulse /> Cantina band is live</span>
        <span>
          Now boarding: <WordRotate words={["Tatooine", "Alderaan", "Endor", "Hoth"]} className="font-medium text-accent" />
        </span>
      </div>
    </div>
  );
}

export function AccessibilityMenuDemo() {
  return (
    <Stage align="start" className="flex-col gap-8">
      <Variant label="Popover: one button. Everything you change is saved on this device and applied to the page.">
        <AccessibilityMenu />
        <AccessibilityMenu
          trigger={<Button variant="outline" leading={<Accessibility />}>Adjust the Holodeck</Button>}
          align="start"
        />
      </Variant>
      <Variant label="Try the settings here, or on any other demo">
        <TestSheet />
      </Variant>
      <Variant label="Panel in the page: a few profiles, a few controls" className="w-full">
        <div className="w-full max-w-3xl">
          <AccessibilityMenu
            variant="panel"
            profiles={["low-vision", "vestibular", "dyslexia", "adhd"]}
            features={["textScale", "reduceMotion", "calm", "highContrast", "largeTargets", "strongFocus"]}
          />
        </div>
      </Variant>
    </Stage>
  );
}

/** Shows how a component reads the features itself: a pulse that stops under calm, a slide that stops under reduceMotion. */
function Beacon({ accessibilityFeatures }: { accessibilityFeatures?: AccessibilityFeaturesProp }) {
  const { a11y, rootProps } = useA11yProps(accessibilityFeatures);
  return (
    <div {...rootProps} className="flex items-center gap-3 rounded-control bg-raised p-3 text-sm text-ink" style={rootProps.style}>
      <span className="relative grid size-3 place-items-center">
        <span className={a11y.calm ? "size-2 rounded-full bg-accent" : "size-2 animate-ping rounded-full bg-accent"} />
        <span className="absolute size-2 rounded-full bg-accent" />
      </span>
      <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-active">
        <motion.span
          className="absolute inset-y-0 left-0 w-8 rounded-full bg-accent"
          animate={a11y.reduceMotion ? { x: 0 } : { x: [0, 64, 0] }}
          transition={a11y.reduceMotion ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <span className="text-[0.8125rem] text-muted">{a11y.calm ? "Calm" : a11y.reduceMotion ? "Still" : "Moving"}</span>
    </div>
  );
}

const SCOPES: { id: string; features: AccessibilityFeaturesProp; code: string }[] = [
  { id: "none", features: "none", code: `"none"` },
  { id: "adhd", features: "adhd", code: `"adhd"` },
  { id: "all", features: "all", code: `"all"` },
];

export function AccessibilityScopeDemo() {
  return (
    <Stage align="start" className="flex-col items-stretch gap-8">
      <Variant label="Scope: wrap anything, and everything inside follows" className="w-full">
        <div className="grid w-full gap-4 md:grid-cols-3">
          {SCOPES.map((s) => (
            <div key={s.id} className="min-w-0 rounded-card border border-line bg-surface p-4">
              <code className="text-xs text-muted">{`<AccessibilityScope features=${s.code}>`}</code>
              <AccessibilityScope features={s.features}>
                <div className="mt-3 space-y-3 text-sm text-ink">
                  <p>
                    Rendezvous at <WordRotate words={["Endor", "Hoth", "Yavin 4"]} className="font-medium text-accent" />
                  </p>
                  <Marquee speed={36} gap={24} label="Ships in the fleet">
                    {["Millennium Falcon", "Nebuchadnezzar", "DeLorean", "Ecto-1", "Optimus Prime"].map((n) => (
                      <span key={n} className="rounded-control bg-raised px-3 py-1 text-[0.8125rem]">{n}</span>
                    ))}
                  </Marquee>
                  <div className="flex flex-wrap gap-2">
                    <Btn size="sm">Engage</Btn>
                    <Btn size="sm" variant="outline">Abort</Btn>
                  </div>
                </div>
              </AccessibilityScope>
            </div>
          ))}
        </div>
      </Variant>
      <Variant label="Prop: one component, same words. Components read it with useA11yProps" className="w-full">
        <div className="grid w-full gap-4 md:grid-cols-3">
          {SCOPES.map((s) => (
            <div key={s.id} className="min-w-0 space-y-2">
              <code className="text-xs text-muted">{`accessibilityFeatures=${s.code}`}</code>
              <Beacon accessibilityFeatures={s.features} />
            </div>
          ))}
        </div>
      </Variant>
    </Stage>
  );
}

const SKIP_TARGET = "skip-demo-main";

export function SkipLinkDemo() {
  const link = useRef<HTMLAnchorElement>(null);
  return (
    <Stage align="start" className="flex-col items-stretch gap-6">
      <Variant label="Press Tab inside the box, or use the button. The link fades in; Enter jumps past the navigation.">
        <Button variant="outline" leading={<Megaphone />} onClick={() => link.current?.focus()}>Start from the top of the page</Button>
      </Variant>
      <div className="relative min-h-56 overflow-hidden rounded-card border border-line bg-surface">
        <SkipLink ref={link} href={`#${SKIP_TARGET}`} className="absolute!" />
        <nav aria-label="Rebel alliance" className="flex flex-wrap items-center gap-1 border-b border-line p-3">
          <span className="mr-2 text-sm font-semibold text-ink">Rebel Alliance</span>
          {["Fleet", "Bases", "Droids", "Intel", "Recruit"].map((n) => (
            <Btn key={n} variant="ghost" size="sm" say={`${n} (skipped)`}>{n}</Btn>
          ))}
        </nav>
        <main id={SKIP_TARGET} className="p-5 outline-offset-[-4px]">
          <h3 className="text-base font-semibold text-ink">Mission briefing</h3>
          <p className="mt-2 text-sm text-ink">
            The Death Star plans are in the astromech. Focus landed here, past five links, in one key press.
          </p>
        </main>
      </div>
    </Stage>
  );
}

export function VisuallyHiddenDemo() {
  const [show, setShow] = useState(false);
  const { toast } = useToast();
  const hidden = show ? "not-sr-only ml-2 rounded-control bg-accent-soft px-2 py-0.5 text-xs text-ink" : undefined;
  return (
    <Stage align="start" className="flex-col gap-8">
      <Variant label="Icon-only controls still need a name for screen readers">
        <Switch label="Show what a screen reader hears" checked={show} onCheckedChange={setShow} />
      </Variant>
      <Variant label="Hidden text beside the icon">
        <Button variant="outline" leading={<Heart />} onClick={() => toast({ title: "Added", description: "Baby Yoda is on your list." })}>
          <VisuallyHidden className={hidden}>Add Baby Yoda to favourites</VisuallyHidden>
        </Button>
        <Button variant="outline" leading={<Siren />} onClick={() => toast({ title: "Alarm sent", description: "Ghostbusters are on their way." })}>
          <VisuallyHidden className={hidden}>Call the Ghostbusters</VisuallyHidden>
        </Button>
      </Variant>
      <Variant label="Focusable: hidden until Tab reaches it">
        <span className="rounded-control border border-dashed border-line-strong p-3">
          <VisuallyHidden
            as="button"
            focusable
            className="rounded-control bg-btn-primary px-3 py-1.5 text-sm font-medium text-btn-primary-ink"
            onClick={() => toast({ title: "Shortcut", description: "Straight to the escape pod." })}
          >
            Skip to the escape pod
          </VisuallyHidden>
          <span className="text-sm text-muted">Tab into this box to reveal a shortcut.</span>
        </span>
      </Variant>
    </Stage>
  );
}

type Spoken = { id: number; text: string; politeness: Politeness; at: string };

export function LiveAnnouncerDemo() {
  const [text, setText] = useState("The Death Star plans have been transmitted.");
  const [log, setLog] = useState<Spoken[]>([]);
  const say = (politeness: Politeness) => {
    if (!text.trim()) return;
    announce(text, politeness);
    setLog((l) => [{ id: Date.now(), text, politeness, at: new Date().toLocaleTimeString() }, ...l].slice(0, 5));
  };
  return (
    <Stage align="start" className="flex-col items-stretch gap-6">
      <div className="w-full max-w-xl space-y-3">
        <TextField label="Message" value={text} onValueChange={setText} />
        <div className="flex flex-wrap gap-3">
          <Button leading={<Megaphone />} onClick={() => say("polite")}>Say it politely</Button>
          <Button variant="outline" leading={<Siren />} onClick={() => say("assertive")}>Interrupt</Button>
        </div>
        <p className="text-[0.8125rem] text-muted">With a screen reader on, you hear each message without focus moving. Below is what was sent.</p>
      </div>
      <ul className="w-full max-w-xl space-y-2" aria-label="Sent to screen readers">
        {log.length === 0 && <li className="text-sm text-muted">Nothing sent yet.</li>}
        {log.map((m) => (
          <li key={m.id} className="flex items-baseline gap-3 rounded-control bg-surface px-3 py-2 text-sm text-ink">
            <span className="shrink-0 text-xs text-muted tabular">{m.at}</span>
            <span className="shrink-0 rounded-full bg-raised px-2 py-0.5 text-xs text-muted">{m.politeness}</span>
            <span className="min-w-0">{m.text}</span>
          </li>
        ))}
      </ul>
    </Stage>
  );
}
