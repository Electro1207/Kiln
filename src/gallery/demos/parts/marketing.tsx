import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from "motion/react";
import {
  Activity, Box, Building2, CalendarDays, Car, Database, FileText, Ghost, Globe, Home, Hotel, Landmark, Library, Mail, MapPin, Pencil, Phone, Plus, Zap,
} from "lucide-react";
import { Stage, Variant, Btn } from "../../ui";
import { springFirm, springSoft } from "../../../kiln/motion";
import { Avatar } from "../../../kiln/components/data-display/Avatar";
import { Breadcrumbs } from "../../../kiln/components/wayfinding/Breadcrumbs";
import { FlyoutNav, type FlyoutItem } from "../../../kiln/components/menus/FlyoutNav";
import { BentoGrid, BentoTile } from "../../../kiln/components/marketing/BentoGrid";
import { FeatureTabs } from "../../../kiln/components/marketing/FeatureTabs";
import { StatsSection } from "../../../kiln/components/marketing/StatsSection";
import { CTASection } from "../../../kiln/components/marketing/CTASection";
import { NewsletterSignup } from "../../../kiln/components/marketing/NewsletterSignup";
import { ContactSection } from "../../../kiln/components/marketing/ContactSection";
import { TeamGrid } from "../../../kiln/components/marketing/TeamGrid";
import { FAQSection } from "../../../kiln/components/marketing/FAQSection";
import { Testimonials } from "../../../kiln/components/marketing/Testimonials";
import { BlogList } from "../../../kiln/components/marketing/BlogList";
import { Changelog } from "../../../kiln/components/marketing/Changelog";
import { NotFound } from "../../../kiln/components/marketing/NotFound";
import { PageHeading, SectionHeading } from "../../../kiln/components/app-shells/PageHeading";


function Wordmark() {
  return (
    <span className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
      <span className="grid size-7 place-items-center rounded-[7px] bg-btn-primary text-btn-primary-ink">
        <Ghost className="size-4" />
      </span>
      Ecto
    </span>
  );
}

const navItems: FlyoutItem[] = [
  {
    kind: "mega",
    label: "Products",
    groups: [
      {
        title: "Capture",
        links: [
          { label: "Proton pack", href: "#proton", description: "Unlicensed nuclear accelerator, now with a safety catch.", icon: <Zap /> },
          { label: "Ghost trap", href: "#trap", description: "Opens on a foot pedal, shut in under a second.", icon: <Box /> },
          { label: "PKE meter", href: "#pke", description: "Psychokinetic energy readings, live on your phone.", icon: <Activity /> },
        ],
      },
      {
        title: "Run the business",
        links: [
          { label: "Containment", href: "#containment", description: "Laser-grid storage with a battery that outlasts the EPA.", icon: <Database /> },
          { label: "Ecto-1 dispatch", href: "#dispatch", description: "Routes the car to the nearest haunting, sirens on.", icon: <Car /> },
          { label: "Invoices", href: "#invoices", description: "Entrapment and storage on one bill.", icon: <FileText /> },
        ],
      },
    ],
    featured: (
      <a href="#/_/changelog" className="flex h-full flex-col justify-end gap-2 rounded-card bg-raised p-5 transition-colors duration-200 hover:bg-active">
        <span className="text-[13px] text-muted">New this month</span>
        <span className="text-lg font-semibold leading-snug tracking-[-0.01em] text-ink">Ecto-1A dispatch, with roof rack routing</span>
        <span className="text-sm text-ink">Read what changed under the hood →</span>
      </a>
    ),
  },
  {
    kind: "flyout",
    label: "Solutions",
    links: [
      { label: "Hotels", href: "#hotels", description: "Twelfth-floor vapours, handled quietly.", icon: <Hotel /> },
      { label: "Libraries", href: "#libraries", description: "Free-floating, full-torso apparitions.", icon: <Library /> },
      { label: "Homes", href: "#homes", description: "Refrigerators that talk back.", icon: <Home /> },
      { label: "City of New York", href: "#city", description: "Citywide surges and the mayor’s office.", icon: <Landmark /> },
    ],
    footer: <>A Class 7 on your roof? Call the emergency line on <span className="text-ink tabular">555-2368</span>.</>,
  },
  { kind: "link", label: "Pricing", href: "#pricing" },
  {
    kind: "flyout",
    label: "Company",
    links: [
      { label: "About the firehouse", href: "#about", icon: <Building2 /> },
      { label: "Careers", href: "#careers", description: "We’re hiring a fourth Ghostbuster.", icon: <Ghost /> },
    ],
  },
];

export function FlyoutDemo() {
  const [last, setLast] = useState("Hover or tab to Products");
  return (
    <Stage align="start" className="p-0 sm:p-0">
      <div className="relative min-h-[520px] w-full rounded-card bg-surface">
        <FlyoutNav brand={<Wordmark />} items={navItems} onNavigate={(h) => setLast(`Went to ${h}`)} action={<Btn size="sm">Start free trial</Btn>} />
        <div className="px-6 pb-10 pt-16 sm:px-10">
          <p className="max-w-lg text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-ink">Who you gonna call?</p>
          <p className="mt-4 max-w-md text-[15px] text-ink">Ecto runs a paranormal elimination business: capture, containment, dispatch and billing.</p>
          <p className="mt-8 text-[13px] text-muted" aria-live="polite">{last}</p>
        </div>
      </div>
    </Stage>
  );
}

function useLive(ref: React.RefObject<HTMLElement | null>) {
  const inView = useInView(ref, { amount: 0.2 });
  const reduce = useReducedMotion();
  return inView && !reduce;
}

function PkeBars() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useLive(ref);
  const n = 28;
  const [vals, setVals] = useState(() => Array.from({ length: n }, (_, i) => 0.25 + 0.5 * Math.abs(Math.sin(i * 0.7))));
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => {
      setVals((v) => [...v.slice(1), Math.min(1, Math.max(0.12, v[v.length - 1] + (Math.random() - 0.45) * 0.45))]);
    }, 900);
    return () => window.clearInterval(t);
  }, [live]);
  const last = vals[vals.length - 1];
  return (
    <div ref={ref} className="absolute inset-0 flex flex-col p-5">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-muted">PKE, 55 Central Park West</span>
        <span className="text-sm font-medium text-ink tabular">{(last * 5).toFixed(1)} GeV</span>
      </div>
      <div className="mt-4 flex flex-1 items-end gap-1">
        {vals.map((v, i) => (
          <motion.span
            key={i}
            className={i === n - 1 ? "flex-1 origin-bottom rounded-t-[3px] bg-accent" : "flex-1 origin-bottom rounded-t-[3px] bg-line-strong"}
            style={{ height: "100%" }}
            initial={false}
            animate={{ scaleY: v }}
            transition={springFirm}
          />
        ))}
      </div>
    </div>
  );
}

const calls = [
  { where: "Sedgewick Hotel, 12th floor", what: "Class 5 vapour" },
  { where: "New York Public Library", what: "Full-torso apparition" },
  { where: "Fort Detmerring", what: "Pre-war spectre" },
  { where: "Columbia University", what: "Unexplained slime" },
  { where: "Rockefeller Center", what: "Gargoyle activity" },
];

function DispatchFeed() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useLive(ref);
  const [head, setHead] = useState(0);
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => setHead((h) => h + 1), 2600);
    return () => window.clearInterval(t);
  }, [live]);
  const shown = [0, 1, 2].map((k) => ({ ...calls[(head + k) % calls.length], key: head + k }));
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden p-4">
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {shown.map((c, i) => (
            <motion.li
              key={c.key}
              layout="position"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: i === 2 ? 0.45 : 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={springSoft}
              className="flex items-center gap-3 rounded-card bg-surface px-3 py-2.5"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-btn-primary text-btn-primary-ink">
                <Car className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[13px] font-medium text-ink">{c.where}</span>
                <span className="block truncate text-xs text-muted">{c.what}</span>
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function CrewBoard() {
  const crew = ["Peter Venkman", "Ray Stantz", "Egon Spengler", "Winston Zeddemore"];
  const ref = useRef<HTMLDivElement>(null);
  const live = useLive(ref);
  const [busy, setBusy] = useState(1);
  useEffect(() => {
    if (!live) return;
    const t = window.setInterval(() => setBusy((b) => (b + 1) % crew.length), 2200);
    return () => window.clearInterval(t);
  }, [live, crew.length]);
  return (
    <div ref={ref} className="absolute inset-0 flex flex-col justify-center gap-2 p-5">
      {crew.map((n, i) => (
        <div key={n} className="flex items-center gap-3">
          <Avatar name={n} size="sm" />
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{n}</span>
          <span className="relative grid h-5 w-[4.5rem] text-right text-xs [&>*]:[grid-area:1/1]">
            <motion.span initial={false} animate={{ opacity: i === busy ? 1 : 0 }} transition={{ duration: 0.25 }} className="text-warning">On a call</motion.span>
            <motion.span initial={false} animate={{ opacity: i === busy ? 0 : 1 }} transition={{ duration: 0.25 }} className="text-positive">Free</motion.span>
          </span>
        </div>
      ))}
    </div>
  );
}

function ContainmentMeter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const fill = useMotionValue(0);
  useEffect(() => {
    if (inView) animate(fill, 0.62, { duration: 1.4, ease: [0.22, 1, 0.36, 1] });
  }, [inView, fill]);
  return (
    <div ref={ref} className="absolute inset-0 flex flex-col justify-center gap-3 p-5">
      <span className="text-3xl font-semibold tracking-[-0.03em] text-ink tabular">62%</span>
      <span className="block h-2 overflow-hidden rounded-full bg-active">
        <motion.span className="block h-full origin-left rounded-full bg-accent" style={{ scaleX: fill }} />
      </span>
      <span className="text-xs text-muted">412 of 664 cells in use · grid power normal</span>
    </div>
  );
}

function KeysVisual() {
  const ref = useRef<HTMLDivElement>(null);
  const live = useLive(ref);
  const [down, setDown] = useState<number | null>(null);
  useEffect(() => {
    if (!live) return;
    let k = 0;
    const t = window.setInterval(() => {
      setDown(k % 2);
      window.setTimeout(() => setDown(null), 180);
      k++;
    }, 900);
    return () => window.clearInterval(t);
  }, [live]);
  return (
    <div ref={ref} className="absolute inset-0 grid place-items-center">
      <div className="flex items-center gap-2 text-sm text-muted">
        {["G", "T"].map((key, i) => (
          <motion.kbd
            key={key}
            animate={{ y: down === i ? 2 : 0, scale: down === i ? 0.96 : 1 }}
            transition={springFirm}
            className="grid size-12 place-items-center rounded-control bg-surface font-sans text-lg font-medium text-ink"
          >
            {key}
          </motion.kbd>
        ))}
        <span className="ml-2">Go to the trap</span>
      </div>
    </div>
  );
}

export function BentoDemo() {
  return (
    <Stage align="start">
      <BentoGrid>
        <BentoTile span="@2xl:col-span-2 @4xl:col-span-4 @4xl:row-span-2" title="Live PKE readings" body="Every meter in the field streams to the firehouse. Spikes flag themselves before the slime does." visual={<PkeBars />} />
        <BentoTile span="@4xl:col-span-2" title="Dispatch in one tap" body="New calls land at the top; the nearest free crew gets the job." visual={<DispatchFeed />} />
        <BentoTile span="@4xl:col-span-2" title="The whole crew on one screen" body="Who is on a call and who can roll." visual={<CrewBoard />} />
        <BentoTile span="@4xl:col-span-3" title="Containment you can trust" body="Watch the grid fill. We alert you long before anyone from the EPA can shut it off." visual={<ContainmentMeter />} />
        <BentoTile span="@4xl:col-span-3" title="Keyboard first" body="Every screen has a two-key shortcut, so nobody fumbles with the trap." visual={<KeysVisual />} />
      </BentoGrid>
    </Stage>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-72 flex-col gap-4 p-5 sm:p-6">
      <p className="text-[13px] text-muted">{title}</p>
      {children}
    </div>
  );
}

const hauntings = [
  ["Sedgewick Hotel", "Class 5", "Trapped"],
  ["Public Library", "Class 4", "Trapped"],
  ["55 Central Park West", "Deity", "Active"],
  ["Firehouse basement", "Unknown", "Watching"],
];

function featureList() {
  return [
    {
      id: "track",
      title: "Track every haunting",
      body: "One list of every sighting in the city, sorted by class and how close it is to the firehouse.",
      media: (
        <Panel title="Hauntings this week">
          <ul className="flex flex-col gap-1.5">
            {hauntings.map(([w, c, s]) => (
              <li key={w} className="flex items-center gap-3 rounded-control bg-raised px-3 py-2.5 text-sm">
                <span className="min-w-0 flex-1 truncate text-ink">{w}</span>
                <span className="text-muted">{c}</span>
                <span className={s === "Active" ? "w-16 text-right text-negative" : s === "Trapped" ? "w-16 text-right text-positive" : "w-16 text-right text-muted"}>{s}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ),
    },
    {
      id: "dispatch",
      title: "Send Ecto-1",
      body: "Routes the car around traffic and the occasional marshmallow giant. The client sees the ETA.",
      media: (
        <Panel title="Dispatch">
          <div className="rounded-card bg-raised p-4">
            <p className="text-lg font-semibold text-ink">Ecto-1 → 55 Central Park West</p>
            <p className="mt-1 text-sm text-muted">Via Broadway and Columbus Avenue</p>
            <div className="mt-5 flex items-end justify-between">
              <span className="text-4xl font-semibold tracking-[-0.03em] text-ink tabular">11 min</span>
              <span className="text-sm text-ink">Crew of four, packs charged</span>
            </div>
          </div>
        </Panel>
      ),
    },
    {
      id: "bill",
      title: "Bill the client",
      body: "Entrapment, storage and a parking ticket, on one invoice the hotel manager will actually pay.",
      media: (
        <Panel title="Invoice 1984-012 · Sedgewick Hotel">
          <dl className="flex flex-col gap-2 text-sm">
            {[["Entrapment", "$4,000.00"], ["Storage", "$1,000.00"], ["Damage to ballroom", "$0.00"]].map(([k, v]) => (
              <div key={k} className="flex justify-between rounded-control bg-raised px-3 py-2.5">
                <dt className="text-ink">{k}</dt>
                <dd className="text-ink tabular">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between px-3 pt-2 text-base font-semibold">
              <dt className="text-ink">Total</dt>
              <dd className="text-ink tabular">$5,000.00</dd>
            </div>
          </dl>
        </Panel>
      ),
    },
    {
      id: "contain",
      title: "Keep the grid healthy",
      body: "Power, capacity and who touched the shut-off switch, with an alarm long before it matters.",
      media: (
        <Panel title="Containment unit">
          {[["Grid power", 0.96, "Normal"], ["Capacity", 0.62, "412 of 664 cells"], ["Backup battery", 0.88, "31 hours"]].map(([k, v, note]) => (
            <div key={k as string} className="rounded-control bg-raised px-3 py-3">
              <div className="flex justify-between text-sm">
                <span className="text-ink">{k as string}</span>
                <span className="text-muted">{note as string}</span>
              </div>
              <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-active">
                <span className="block h-full origin-left rounded-full bg-accent" style={{ transform: `scaleX(${v})` }} />
              </span>
            </div>
          ))}
        </Panel>
      ),
    },
  ];
}

export function FeatureTabsDemo() {
  const features = useMemo(() => featureList(), []);
  return (
    <Stage align="start">
      <FeatureTabs features={features} interval={6} />
    </Stage>
  );
}

export function StatsDemo() {
  return (
    <Stage align="start">
      <StatsSection
        title="Busting makes us feel good"
        description="Numbers from the firehouse, updated every Friday."
        stats={[
          { label: "Ghosts in containment", value: 1984, note: "Up 312 since the Gozer incident" },
          { label: "Average time to the door", value: 11, suffix: " min", note: "Manhattan, weekdays" },
          { label: "Repeat hauntings", value: 0.4, suffix: "%", format: { maximumFractionDigits: 1, minimumFractionDigits: 1 }, note: "Within a year of capture" },
          { label: "Clients in the five boroughs", value: 312, note: "Including the mayor" },
        ]}
      />
    </Stage>
  );
}

export function CTADemo() {
  return (
    <Stage align="start" className="flex-col">
      <Variant label="Field of colour" className="w-full">
        <CTASection
          title="Who you gonna call?"
          body="Start a free 30-day trial. No proton pack required to sign up."
          primary={{ label: "Start free trial", href: "#/_/pricing" }}
          secondary={{ label: "Talk to Ray", href: "#/_/contact-section" }}
        />
      </Variant>
      <Variant label="Split" className="w-full">
        <CTASection
          variant="split"
          title="Put a containment unit in your building"
          body="We install, wire and monitor it. You keep the basement."
          primary={{ label: "Book a survey", href: "#/_/faq-section" }}
          secondary={{ label: "See pricing", href: "#/_/pricing" }}
          aside={
            <div className="flex aspect-[10/7] w-full flex-col justify-between rounded-card bg-raised p-5">
              <span className="text-[13px] text-muted">Containment unit · your basement</span>
              <div className="grid grid-cols-8 gap-1.5" aria-hidden>
                {Array.from({ length: 32 }, (_, i) => (
                  <span key={i} className={i % 5 === 0 || i % 7 === 0 ? "aspect-square rounded-[4px] bg-accent" : "aspect-square rounded-[4px] bg-active"} />
                ))}
              </div>
              <span className="text-sm text-ink">11 of 32 cells in use · grid power normal</span>
            </div>
          }
        />
      </Variant>
    </Stage>
  );
}

export function NewsletterDemo() {
  return (
    <Stage align="start" className="flex-col">
      <Variant label="Inline" className="w-full">
        <NewsletterSignup
          title="Spook Central weekly"
          description="One email on Fridays: new equipment, the week’s sightings and the occasional Twinkie."
          fineprint="No spam. Unsubscribe with one click."
        />
      </Variant>
      <Variant label="Card, with a server error for “gozer@”" className="w-full max-w-md">
        <NewsletterSignup
          variant="card"
          title="Get the field guide"
          description="Class 1 to Class 7, with pictures."
          onSubscribe={async (email) => {
            await new Promise((r) => setTimeout(r, 700));
            if (email.startsWith("gozer@")) throw new Error("Gozer is already subscribed. Choose and perish.");
          }}
        />
      </Variant>
    </Stage>
  );
}

export function ContactDemo() {
  return (
    <Stage align="start">
      <ContactSection
        title="Talk to the firehouse"
        description="Something strange in your neighbourhood? Tell us what you saw and where. For anything glowing, call."
        topics={[
          { value: "sighting", label: "Report a sighting" },
          { value: "quote", label: "Get a quote" },
          { value: "install", label: "Containment install" },
          { value: "press", label: "Press" },
        ]}
        offices={[
          { city: "Firehouse, Tribeca", address: ["14 North Moore Street", "New York, NY 10013"], phone: "(212) 555-2368", email: "crew@ecto.example" },
          { city: "Spook Central", address: ["55 Central Park West", "New York, NY 10023"], email: "uptown@ecto.example" },
        ]}
      />
    </Stage>
  );
}

const linkSet = (n: string) => [
  { label: "Email", href: `mailto:${n.split(" ")[0].toLowerCase()}@ecto.example`, icon: <Mail /> },
  { label: "Website", href: "#/_/testimonials", icon: <Globe /> },
  { label: "Phone", href: "tel:2125552368", icon: <Phone /> },
];

export function TeamDemo() {
  const people = [
    { name: "Peter Venkman", role: "Client relations", bio: "Two PhDs, in psychology and parapsychology. Handles the mayor." },
    { name: "Raymond Stantz", role: "Equipment", bio: "Built the trap and the car. Still believes in the Stay Puft man." },
    { name: "Egon Spengler", role: "Research", bio: "Collects spores, moulds and fungus. Wrote the rule about the streams." },
    { name: "Winston Zeddemore", role: "Field operations", bio: "Joined for the steady paycheck. Has seen things." },
    { name: "Janine Melnitz", role: "Office manager", bio: "Answers the phone. Is usually the first to say “We got one!”" },
    { name: "Louis Tully", role: "Accounts", bio: "Does the taxes. Was briefly the Keymaster." },
    { name: "Dana Barrett", role: "Client advocate", bio: "Cellist. Former client, after the incident with her refrigerator." },
    { name: "Slimer", role: "Mascot", bio: "Lives on the twelfth floor of the Sedgewick. Eats everything." },
  ].map((p) => ({ ...p, links: linkSet(p.name) }));
  return (
    <Stage align="start">
      <TeamGrid title="The crew" description="Seven people, one ghost, one firehouse, and a containment unit in the basement." people={people} />
    </Stage>
  );
}

export function FAQDemo() {
  return (
    <Stage align="start">
      <FAQSection
        title="Questions before you call"
        description="What clients ask us most, answered by the people who do the work."
        footer={<>Still unsure? Email <a href="mailto:crew@ecto.example" className="text-accent underline-offset-4 hover:underline">crew@ecto.example</a> or call 555-2368.</>}
        items={[
          { id: "streams", title: "Is it dangerous?", content: "Mostly to the furniture. The one rule is the one Egon gave us on day one: “Don’t cross the streams.”" },
          { id: "price", title: "How much does a capture cost?", content: "It depends on the class. The Sedgewick job was $4,000 for the entrapment and $1,000 for storage. Most homes come in under $1,200." },
          { id: "where", title: "Where do the ghosts go?", content: "Into the containment unit in our basement. It runs on its own grid with a 31-hour battery, and we monitor it around the clock." },
          { id: "night", title: "Do you come out at night?", content: "Yes. Hauntings don’t keep office hours, so neither do we. Night calls carry a 20% surcharge." },
          { id: "proof", title: "Can I watch?", content: "From behind the tape, yes. Inside the room, no. Trust us on this one." },
        ]}
      />
    </Stage>
  );
}

export function TestimonialsDemo() {
  return (
    <Stage align="start">
      <Testimonials
        title="Heard around the galaxy"
        description="Real lines from people who have seen strange things."
        items={[
          { quote: "She may not look like much, but she’s got it where it counts, kid.", name: "Han Solo", role: "Captain, Millennium Falcon" },
          { quote: "Spared no expense.", name: "John Hammond", role: "Founder, InGen" },
          { quote: "If there’s a steady paycheck in it, I’ll believe anything you say.", name: "Winston Zeddemore", role: "Field operations" },
          { quote: "Roads? Where we’re going, we don’t need roads.", name: "Emmett Brown", role: "Inventor, Hill Valley" },
          { quote: "There is a difference between knowing the path and walking the path.", name: "Morpheus", role: "Captain, Nebuchadnezzar" },
          { quote: "All we have to decide is what to do with the time that is given us.", name: "Gandalf", role: "Wizard" },
          { quote: "I’ve worked in the private sector. They expect results.", name: "Raymond Stantz", role: "Equipment" },
        ]}
      />
    </Stage>
  );
}

export function BlogDemo() {
  const posts = [
    { id: "1", title: "Why you should never cross the streams", excerpt: "Egon’s one rule, explained with diagrams, a toaster and a strongly worded memo to new hires.", category: "Field notes", date: "4 Nov 2026", readMinutes: 6, author: "Egon Spengler", icon: <Zap /> },
    { id: "2", title: "Inside the containment unit retrofit", excerpt: "Four months, one new laser grid, and a basement that finally stays dry.", category: "Engineering", date: "28 Oct 2026", readMinutes: 9, author: "Raymond Stantz", icon: <Database /> },
    { id: "3", title: "Pricing a capture without scaring the client", excerpt: "How we went from guessing to a rate card that hotel managers actually sign.", category: "Business", date: "17 Oct 2026", readMinutes: 5, author: "Peter Venkman", icon: <FileText /> },
  ].map(({ icon, ...p }) => ({
    ...p,
    href: "#/_/changelog",
    art: <div className="grid size-full place-items-center bg-accent-soft text-accent [&>svg]:size-12 [&>svg]:stroke-[1.4]">{icon}</div>,
  }));
  return (
    <Stage align="start">
      <BlogList title="From the firehouse" description="Notes on equipment, the business and the occasional Class 7." posts={posts} />
    </Stage>
  );
}

export function ChangelogDemo() {
  return (
    <Stage align="start">
      <Changelog
        title="Changelog"
        description="What changed in Ecto, newest first."
        filter
        markLatest
        initialCount={3}
        releases={[
          {
            version: "Unreleased", title: "Proton pack, mark II",
            changes: [
              { kind: "new", text: "A `stream-cross` warning before two streams meet." },
              { kind: "deprecated", text: "The **Mark I** wand. It still fires, but not for long." },
            ],
          },
          {
            version: "2.4.0", date: "10 Nov 2026", title: "Ecto-1A dispatch",
            body: "The car now picks its own route and tells the client when it will arrive.",
            changes: [
              { kind: "new", text: "Live ETA links you can text to the client." },
              { kind: "improved", text: "PKE readings reach the firehouse in under a second." },
              { kind: "fixed", text: "The trap pedal no longer fires twice when stepped on hard." },
            ],
          },
          {
            version: "2.3.1", date: "29 Oct 2026", title: "Containment hotfix",
            changes: [
              { kind: "fixed", text: "The grid no longer shuts down when someone from the EPA flips the main switch." },
              { kind: "improved", text: "Backup battery runs for 31 hours instead of 9." },
            ],
          },
          {
            version: "2.3.0", date: "14 Oct 2026", title: "Mood slime detection",
            changes: [
              { kind: "new", text: "Flags rising slime levels under the city before the river turns pink." },
              { kind: "improved", text: "Faster search across 1,984 containment records." },
            ],
          },
          {
            version: "2.2.0", date: "2 Oct 2026", title: "Library edition",
            changes: [
              { kind: "removed", text: "The card catalogue sync. The librarian asked us to stop." },
              { kind: "fixed", text: "Floating books no longer count as Class 4 sightings." },
            ],
          },
        ]}
      />
    </Stage>
  );
}

export function NotFoundDemo() {
  return (
    <Stage align="start">
      <NotFound
        title="This isn’t the page you’re looking for"
        body="It may have moved along, or the link is wrong. Try one of these instead."
        actions={
          <>
            <Btn>Back to home</Btn>
            <Btn variant="secondary">Contact the crew</Btn>
          </>
        }
        suggestions={[
          { label: "Pricing", description: "Captures, storage and night rates", href: "#/_/pricing" },
          { label: "Field guide", description: "Class 1 to Class 7, with pictures", href: "#/_/faq-section" },
          { label: "System status", description: "Containment grid: all normal", href: "#/_/changelog" },
          { label: "Contact", description: "555-2368, day and night", href: "#/_/contact-section" },
        ]}
      />
    </Stage>
  );
}

export function HeadingsDemo() {
  const [tab, setTab] = useState("overview");
  const [range, setRange] = useState("month");
  return (
    <Stage align="start" className="flex-col gap-8">
      <Variant label="Page heading" className="w-full">
        <div className="w-full rounded-card bg-surface p-5 sm:p-6">
          <PageHeading
            above={<Breadcrumbs items={[{ label: "Clients", href: "#/_/table" }, { label: "Hotels", href: "#/_/list" }, { label: "Sedgewick Hotel" }]} />}
            leading={<Avatar name="Sedgewick Hotel" size="lg" />}
            title="Sedgewick Hotel"
            meta={[
              { icon: <MapPin />, label: "Manhattan, NY" },
              { icon: <CalendarDays />, label: "Client since 1984" },
              { icon: <Ghost />, label: "12 captures" },
            ]}
            actions={
              <>
                <Btn variant="secondary" leading={<Pencil />}>Edit</Btn>
                <Btn leading={<Plus />}>New capture</Btn>
              </>
            }
            tabs={{
              label: "Client sections",
              value: tab,
              onChange: setTab,
              items: [{ id: "overview", label: "Overview" }, { id: "captures", label: "Captures", count: 12 }, { id: "invoices", label: "Invoices", count: 3 }, { id: "notes", label: "Notes" }],
            }}
          />
        </div>
      </Variant>
      <Variant label="Section heading with actions" className="w-full">
        <SectionHeading title="Captures this month" description="Every entrapment, with the class and who was on the call." actions={<Btn variant="secondary" size="sm">Export</Btn>} />
      </Variant>
      <Variant label="Section heading with tabs" className="w-full">
        <SectionHeading
          title="Sightings"
          tabs={{ label: "Range", value: range, onChange: setRange, items: [{ id: "week", label: "This week" }, { id: "month", label: "This month" }, { id: "year", label: "This year" }] }}
        />
      </Variant>
      <Variant label="Centred, large" className="w-full">
        <SectionHeading align="center" size="lg" title="We came, we saw, we kicked its ass" description="The line Peter Venkman said at the Sedgewick, now our company motto." />
      </Variant>
    </Stage>
  );
}
