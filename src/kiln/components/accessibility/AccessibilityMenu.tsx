import { isValidElement, useId, useRef, type ReactNode, type RefObject } from "react";
import { motion } from "motion/react";
import { Accessibility, Brain, Check, EarOff, Eye, Focus, Hand, Monitor, Orbit, Palette, RotateCcw, Speech, Type, Zap } from "lucide-react";
import { cn } from "../../cn";
import { fade } from "../../motion";
import { useControllable, type Size } from "../../controllable";
import {
  A11Y_BOOLEAN_KEYS, A11Y_PROFILES, A11Y_TEXT_SCALES, resolveSettings, useA11yProps, useA11ySettings,
  type A11yBooleanKey, type A11yFeatureKey, type A11yProfile, type AccessibilityFeaturesProp,
} from "../../a11y";
import { Button } from "../buttons/Button";
import { IconButton } from "../buttons/IconButton";
import { SegmentedControl } from "../buttons/SegmentedControl";
import { Switch } from "../choice-controls/Switch";
import { Popover } from "../overlays/Popover";
import type { Align, Side } from "../shared/useOverlay";
import { announce } from "./announce";

type Entry = { name: string; hint: string };

/** Text used by AccessibilityMenu. Pass a partial via `labels` to translate or reword. */
export interface AccessibilityMenuLabels {
  /** Accessible name of the trigger button. */
  trigger: string;
  /** Added to the trigger's name while anything is on. */
  triggerOn: string;
  title: string;
  description: string;
  profilesHeading: string;
  featuresHeading: string;
  textSize: string;
  reset: string;
  /** Announced after Reset. */
  resetDone: string;
  /** Lead-in of the note listing what the device has turned on. */
  system: string;
  /** Added to a feature's description while the device holds it on. */
  systemTag: string;
  profiles: Record<A11yProfile, Entry>;
  features: Record<A11yBooleanKey, Entry>;
}
export const accessibilityMenuLabels: AccessibilityMenuLabels = {
  trigger: "Accessibility settings",
  triggerOn: "some on",
  title: "Accessibility",
  description: "Saved on this device. Your system settings are followed too.",
  profilesHeading: "Profiles",
  featuresHeading: "Fine-tune",
  textSize: "Text size",
  reset: "Reset",
  resetDone: "Accessibility settings reset",
  system: "Turned on by your device:",
  systemTag: "Your device keeps this on.",
  profiles: {
    "low-vision": { name: "Low vision", hint: "Bigger text, firmer contrast and focus, larger targets." },
    "colour-blind": { name: "Colour blindness", hint: "Never colour alone: patterns, shapes, a safe palette." },
    "screen-reader": { name: "Screen reader", hint: "Fuller descriptions and data tables for charts." },
    vestibular: { name: "Motion sensitivity", hint: "No parallax, tilt or drifting." },
    photosensitive: { name: "Photosensitivity", hint: "No flashing, and no motion." },
    motor: { name: "Motor", hint: "Larger targets and more time." },
    adhd: { name: "ADHD", hint: "Nothing moves on its own. A calmer page." },
    dyslexia: { name: "Dyslexia", hint: "A readable font and looser spacing." },
    cognitive: { name: "Cognitive", hint: "Calmer page, more time, looser spacing." },
    deaf: { name: "Deaf or hard of hearing", hint: "Captions on by default." },
  },
  features: {
    reduceMotion: { name: "Reduce motion", hint: "No parallax, tilt or drift; animations settle." },
    noFlashing: { name: "No flashing", hint: "Nothing flickers or scrambles; final text shows." },
    calm: { name: "Calm page", hint: "Nothing moves on its own: no autoplay, loops or pulses." },
    highContrast: { name: "High contrast", hint: "Muted text becomes full ink; firmer lines." },
    strongFocus: { name: "Strong focus ring", hint: "A thick, solid outline on the focused control." },
    readableFont: { name: "Readable font", hint: "A typeface designed to be told apart letter by letter." },
    textSpacing: { name: "Text spacing", hint: "Looser lines, letters, words and paragraphs." },
    largeTargets: { name: "Large targets", hint: "Every control is at least 44px to hit." },
    colourSafe: { name: "Never colour alone", hint: "Patterns, shapes and icons beside every colour." },
    extendedTime: { name: "More time", hint: "Nothing closes by itself; timers run three times as long." },
    screenReaderHints: { name: "Screen reader hints", hint: "Extra descriptions, chart tables and fuller announcements." },
    captions: { name: "Captions", hint: "Video and audio start with captions on." },
  },
};

type EntryPartial = Partial<Entry>;
export type AccessibilityMenuLabelsInput = Partial<Omit<AccessibilityMenuLabels, "profiles" | "features">> & {
  profiles?: Partial<Record<A11yProfile, EntryPartial>>;
  features?: Partial<Record<A11yBooleanKey, EntryPartial>>;
};

/** Icons used by AccessibilityMenu. Pass a partial via `icons` to replace any. */
export interface AccessibilityMenuIcons {
  trigger: ReactNode;
  reset: ReactNode;
  /** Beside the note about what the device has turned on. */
  system: ReactNode;
  /** The tick on a chosen profile. */
  check: ReactNode;
  profiles: Record<A11yProfile, ReactNode>;
}
export const accessibilityMenuIcons: AccessibilityMenuIcons = {
  trigger: <Accessibility />,
  reset: <RotateCcw />,
  system: <Monitor />,
  check: <Check />,
  profiles: {
    "low-vision": <Eye />,
    "colour-blind": <Palette />,
    "screen-reader": <Speech />,
    vestibular: <Orbit />,
    photosensitive: <Zap />,
    motor: <Hand />,
    adhd: <Focus />,
    dyslexia: <Type />,
    cognitive: <Brain />,
    deaf: <EarOff />,
  },
};

export type AccessibilityMenuProps = {
  /** "popover": a button that opens the menu. "panel": the menu itself, in the page. Default popover. */
  variant?: "popover" | "panel";
  /** Controlled open state (popover only). Leave out to let the menu keep its own. */
  open?: boolean;
  /** Whether the uncontrolled popover starts open. Default false. */
  defaultOpen?: boolean;
  /** Called when the popover opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Which side of the trigger the popover opens on. */
  side?: Side;
  align?: Align;
  /** Which profiles to offer. Default all. */
  profiles?: A11yProfile[];
  /** Which fine-tune controls to offer. Default all (`textScale` is the text size control). */
  features?: A11yFeatureKey[];
  /** Show the fine-tune section. Default true. */
  showFeatures?: boolean;
  /** Replace the trigger button. A button or any element that takes a ref; text gets wrapped in a Button. */
  trigger?: ReactNode;
  /** Size of the trigger and the buttons. Default md. */
  size?: Size;
  /** Override any UI text. Merged over `accessibilityMenuLabels`. */
  labels?: AccessibilityMenuLabelsInput;
  /** Replace any built-in icon. Merged over `accessibilityMenuIcons`. */
  icons?: Partial<Omit<AccessibilityMenuIcons, "profiles">> & { profiles?: Partial<AccessibilityMenuIcons["profiles"]> };
  /** Classes for the menu's panel (the popover's content, or the panel itself). */
  className?: string;
  /** Turn features on for the menu itself. */
  accessibilityFeatures?: AccessibilityFeaturesProp;
};

function mergeLabels(over?: AccessibilityMenuLabelsInput): AccessibilityMenuLabels {
  const base = accessibilityMenuLabels;
  if (!over) return base;
  const profiles = { ...base.profiles };
  for (const p of A11Y_PROFILES) profiles[p] = { ...base.profiles[p], ...over.profiles?.[p] };
  const features = { ...base.features };
  for (const k of A11Y_BOOLEAN_KEYS) features[k] = { ...base.features[k], ...over.features?.[k] };
  return { ...base, ...over, profiles, features };
}

/**
 * The person's accessibility settings: profiles to start from, and a switch for every feature.
 * Saved on the device and applied to the whole page. Needs an AccessibilityProvider above it.
 */
export function AccessibilityMenu({
  variant = "popover", open, defaultOpen, onOpenChange, side = "bottom", align = "end",
  profiles = [...A11Y_PROFILES], features, showFeatures = true, trigger, size = "md", labels, icons, className, accessibilityFeatures,
}: AccessibilityMenuProps) {
  const l = mergeLabels(labels);
  const ic: AccessibilityMenuIcons = { ...accessibilityMenuIcons, ...icons, profiles: { ...accessibilityMenuIcons.profiles, ...icons?.profiles } };
  const { settings } = useA11ySettings();
  const panel = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useControllable(open, defaultOpen ?? false, onOpenChange);
  // Popover closes on Esc and outside clicks without moving focus; put it back on the trigger unless focus went somewhere real.
  const onPopoverChange = (next: boolean) => {
    if (!next) {
      const id = panel.current?.closest("[role=dialog]")?.id;
      const active = document.activeElement;
      const trig = id ? document.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(id)}"]`) : null;
      if (trig && (!active || active === document.body || panel.current?.contains(active))) requestAnimationFrame(() => trig.focus());
    }
    setOpen(next);
  };
  const { rootProps } = useA11yProps(accessibilityFeatures);

  const person = resolveSettings(settings);
  const anyOn = A11Y_BOOLEAN_KEYS.some((k) => person[k]) || person.textScale !== 1;

  const body = (
    <MenuBody
      l={l} ic={ic} size={size} profiles={profiles} features={features} showFeatures={showFeatures}
      popover={variant === "popover"} className={className} rootProps={rootProps} panelRef={panel}
    />
  );
  if (variant === "panel") return body;

  const triggerEl = isValidElement(trigger) ? trigger : trigger != null ? (
    <Button variant="outline" size={size}>{trigger}</Button>
  ) : (
    <IconButton
      variant="ghost"
      size={size}
      aria-label={anyOn ? `${l.trigger}, ${l.triggerOn}` : l.trigger}
      icon={
        <span className="relative grid place-items-center">
          {ic.trigger}
          <motion.span
            aria-hidden
            className="pointer-events-none absolute -right-1 -top-1 size-2 rounded-full bg-accent"
            initial={false}
            animate={{ opacity: anyOn ? 1 : 0 }}
            transition={fade}
          />
        </span>
      }
    />
  );

  return (
    <Popover trigger={triggerEl} side={side} align={align} open={isOpen} onOpenChange={onPopoverChange} label={l.title} bare>
      {body}
    </Popover>
  );
}

type BodyProps = {
  l: AccessibilityMenuLabels;
  ic: AccessibilityMenuIcons;
  size: Size;
  profiles: A11yProfile[];
  features?: A11yFeatureKey[];
  showFeatures: boolean;
  popover: boolean;
  className?: string;
  rootProps: ReturnType<typeof useA11yProps>["rootProps"];
  panelRef: RefObject<HTMLDivElement | null>;
};

function MenuBody({ l, ic, size, profiles, features, showFeatures, popover, className, rootProps, panelRef }: BodyProps) {
  const { settings, effective, system, toggleProfile, setFeature, reset } = useA11ySettings();
  const uid = useId();
  const shown = (k: A11yFeatureKey) => !features || features.includes(k);
  const switches = A11Y_BOOLEAN_KEYS.filter(shown);
  const forced = switches.filter((k) => system[k]);
  const customised = settings.profiles.length > 0 || Object.keys(settings.features).length > 0;
  const scaleOptions = A11Y_TEXT_SCALES.map((s) => ({ value: String(s), label: `${Math.round(s * 100)}%` }));

  return (
    <div
      {...rootProps}
      ref={panelRef}
      className={cn(
        "flex min-w-0 flex-col bg-surface text-ink",
        popover ? "h-[min(640px,calc(100dvh-96px))] w-[min(448px,calc(100vw-16px))]" : "rounded-card border border-line",
        className,
      )}
      style={rootProps.style}
    >
      <div className="shrink-0 px-5 pb-3 pt-5">
        <h2 className="text-base font-semibold text-ink">{l.title}</h2>
        <p className="mt-1 text-[0.8125rem] text-muted">{l.description}</p>
      </div>

      <div className={cn("min-h-0 flex-1 space-y-6 px-5 pb-5", popover && "overflow-y-auto")}>
        {profiles.length > 0 && (
          <section aria-labelledby={`${uid}-p`}>
            <h3 id={`${uid}-p`} className="mb-2 text-[0.8125rem] font-medium text-muted">{l.profilesHeading}</h3>
            <div className={cn("grid gap-2", popover ? "grid-cols-1 min-[420px]:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3")}>
              {profiles.map((p, i) => {
                const on = settings.profiles.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={on}
                    data-autofocus={i === 0 ? "" : undefined}
                    onClick={() => toggleProfile(p)}
                    className="relative flex min-w-0 items-start gap-3 rounded-control border border-line-strong p-3 text-left transition-colors duration-200 hover:bg-raised"
                  >
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-control bg-accent-soft ring-2 ring-inset ring-accent"
                      initial={false}
                      animate={{ opacity: on ? 1 : 0 }}
                      transition={fade}
                    />
                    <span className="relative z-[1] mt-0.5 shrink-0 text-muted [&_svg]:size-[1.125rem]">{ic.profiles[p]}</span>
                    <span className="relative z-[1] min-w-0 flex-1">
                      <span className="block text-sm font-medium text-ink">{l.profiles[p].name}</span>
                      <span className="mt-0.5 block text-[0.8125rem] leading-snug text-muted">{l.profiles[p].hint}</span>
                    </span>
                    <motion.span
                      aria-hidden
                      className="relative z-[1] mt-0.5 shrink-0 text-accent [&_svg]:size-4"
                      initial={false}
                      animate={{ opacity: on ? 1 : 0 }}
                      transition={fade}
                    >
                      {ic.check}
                    </motion.span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {showFeatures && (switches.length > 0 || shown("textScale")) && (
          <section aria-labelledby={`${uid}-f`}>
            <h3 id={`${uid}-f`} className="mb-3 text-[0.8125rem] font-medium text-muted">{l.featuresHeading}</h3>
            {forced.length > 0 && (
              <p className="mb-4 flex items-start gap-2 rounded-control bg-raised px-3 py-2 text-[0.8125rem] text-ink">
                <span className="mt-0.5 shrink-0 text-muted [&_svg]:size-4">{ic.system}</span>
                <span>{l.system} {forced.map((k) => l.features[k].name.toLowerCase()).join(", ")}.</span>
              </p>
            )}
            <div className={cn("grid gap-x-8 gap-y-4", !popover && "md:grid-cols-2")}>
              {shown("textScale") && (
                <div className={cn("flex flex-wrap items-center justify-between gap-3", !popover && "md:col-span-2")}>
                  <span id={`${uid}-t`} className="text-sm font-medium text-ink">{l.textSize}</span>
                  <SegmentedControl
                    size="sm"
                    label={l.textSize}
                    options={scaleOptions}
                    value={String(effective.textScale)}
                    onChange={(v) => setFeature("textScale", Number(v))}
                  />
                </div>
              )}
              {switches.map((k) => (
                <Switch
                  key={k}
                  size="sm"
                  labelFirst
                  label={l.features[k].name}
                  description={system[k] ? `${l.features[k].hint} ${l.systemTag}` : l.features[k].hint}
                  checked={effective[k]}
                  disabled={!!system[k]}
                  onCheckedChange={(v) => setFeature(k, v)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <div className="flex shrink-0 justify-end border-t border-line px-5 py-3">
        <Button
          variant="ghost"
          size={size === "lg" ? "md" : "sm"}
          leading={ic.reset}
          disabled={!customised}
          onClick={() => { reset(); announce(l.resetDone); }}
        >
          {l.reset}
        </Button>
      </div>
    </div>
  );
}
