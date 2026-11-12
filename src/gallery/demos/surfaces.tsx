import { useState } from "react";
import { Mountain, Pickaxe, Wind } from "lucide-react";
import type { Category } from "../types";
import { Stage, Variant, Btn } from "../ui";
import { Card, CardHeader, InteractiveCard, MediaCard } from "../../kiln/components/cards/Card";
import { ExpandableCards } from "../../kiln/components/cards/ExpandableCard";
import { BillingToggle, PricingCard, type Billing } from "../../kiln/components/cards/PricingCard";
import { Carousel } from "../../kiln/components/media/Carousel";
import { Marquee } from "../../kiln/components/media/Marquee";
import { Separator } from "../../kiln/components/primitives/Separator";
import { AspectImage } from "../../kiln/components/primitives/AspectImage";
import { Masonry } from "../../kiln/components/media/Masonry";
import { Hero } from "../../kiln/components/marketing/Hero";
import { FeatureSplit } from "../../kiln/components/marketing/FeatureSplit";
import { Footer } from "../../kiln/components/marketing/Footer";
import { Stat } from "../../kiln/components/data-display/Stat";
import { BarChart } from "../../kiln/components/charts/BarChart";
import { Button } from "../../kiln/components/buttons/Button";
import { Dialog } from "../../kiln/components/overlays/Dialog";

const pic = (seed: string, w: number, h: number) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const ALT = "Sample photograph (placeholder)";

function CardDemo() {
  const used = 68.4, total = 100;
  return (
    <Stage>
      <Card className="w-full max-w-md">
        <CardHeader
          title="Cargo hold"
          description="Millennium Falcon, YT-1300 light freighter."
          action={<Btn size="sm" variant="secondary">Jettison</Btn>}
        />
        <div className="mt-6 flex items-baseline justify-between">
          <span className="tabular text-[28px] text-ink">{used} t</span>
          <span className="tabular text-sm text-muted">of {total} t</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-active" role="meter" aria-valuenow={used} aria-valuemin={0} aria-valuemax={total} aria-label="Cargo hold used">
          <div className="h-full rounded-full bg-accent" style={{ width: `${(used / total) * 100}%` }} />
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
          {[["Coaxium", "41.2 t"], ["Spare parts", "19.8 t"], ["Other", "7.4 t"]].map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted">{k}</dt>
              <dd className="tabular text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </Stage>
  );
}

const STORIES = [
  { seed: "second-breakfast", meta: "Hobbiton · 6 min read", title: "Second breakfast, explained", body: "“What about elevenses? Luncheon? Afternoon tea? Dinner? Supper?”" },
  { seed: "eleventy-first", meta: "Bag End · 4 min read", title: "Notes from an eleventy-first birthday", body: "Fireworks by Gandalf, a dragon that flew too low, and one guest who vanished." },
  { seed: "road-to-bree", meta: "The East Road · 3 min read", title: "The long way to Bree", body: "“Short cuts make long delays.”" },
];

function MediaCardDemo() {
  const [story, setStory] = useState<(typeof STORIES)[number] | null>(null);
  return (
    <Stage>
      <Dialog
        open={!!story}
        onOpenChange={(o) => !o && setStory(null)}
        title={story?.title ?? ""}
        description={story?.meta}
        footer={<Button onClick={() => setStory(null)}>Back to the Shire</Button>}
      >
        {story && (
          <div className="space-y-3">
            <img src={pic(story.seed, 640, 480)} alt={ALT} width={640} height={480} className="aspect-[4/3] w-full rounded-control object-cover" />
            <p className="text-sm text-ink">{story.body}</p>
          </div>
        )}
      </Dialog>
      <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STORIES.map((s) => (
          <MediaCard key={s.seed} onClick={() => setStory(s)} image={pic(s.seed, 640, 480)} alt={ALT} meta={s.meta} title={s.title}>
            {s.body}
          </MediaCard>
        ))}
      </div>
    </Stage>
  );
}

function InteractiveCardDemo() {
  const [pick, setPick] = useState("caradhras");
  const opts = [
    { id: "rohan", icon: <Wind />, title: "The Gap of Rohan", description: "Long and open, and within sight of Isengard." },
    { id: "caradhras", icon: <Mountain />, title: "The pass of Caradhras", description: "Over the mountain, through the snow." },
    { id: "moria", icon: <Pickaxe />, title: "The Mines of Moria", description: "Under the mountain. Balin will give us a royal welcome." },
  ];
  return (
    <Stage>
      <div className="flex w-full max-w-md flex-col gap-3" role="group" aria-label="The road to Mordor">
        {opts.map((o) => (
          <InteractiveCard key={o.id} leading={o.icon} title={o.title} description={o.description} selected={pick === o.id} onClick={() => setPick(o.id)} />
        ))}
      </div>
    </Stage>
  );
}

function StatCardDemo() {
  return (
    <Stage>
      <div className="grid w-full gap-4 md:grid-cols-[1fr_1.4fr]">
        <Card className="flex flex-col justify-between gap-6">
          <Stat label="Dinosaurs counted" value={244} delta={244 / 238 - 1} invert note="238 expected" />
          <Stat label="Fence charge" value={10000} note="volts, every paddock" />
        </Card>
        <Card>
          <CardHeader title="Hatchlings per week" description="Isla Nublar, last eight weeks" />
          <BarChart
            className="mt-4"
            height={150}
            title="Hatchlings per week on Isla Nublar, last eight weeks"
            data={[2, 3, 1, 4, 5, 3, 6, 4].map((v, i) => ({ label: `W${17 + i}`, value: v }))}
          />
        </Card>
      </div>
    </Stage>
  );
}

function ExpandableDemo() {
  return (
    <Stage>
      <ExpandableCards
        items={[
          {
            id: "ark",
            title: "The Ark of the Covenant",
            meta: "Tanis, Egypt · 1936",
            image: pic("ark-covenant", 1120, 700),
            alt: ALT,
            detail: (
              <div className="flex flex-col gap-3">
                <p>Found in the Well of Souls by Dr. Henry Jones Jr. while a rival dig searched the wrong part of the city.</p>
                <p className="text-muted">“They're digging in the wrong place.”</p>
                <dl className="grid grid-cols-3 gap-3 text-[13px]">
                  <div><dt className="text-muted">Found</dt><dd>Well of Souls</dd></div>
                  <div><dt className="text-muted">Stored</dt><dd className="tabular">Crate 9906753</dd></div>
                  <div><dt className="text-muted">Opened</dt><dd>Once. Badly.</dd></div>
                </dl>
              </div>
            ),
          },
          {
            id: "coronado",
            title: "The Cross of Coronado",
            meta: "Utah · 1912",
            image: pic("cross-coronado", 1120, 700),
            alt: ALT,
            detail: <p>Taken back from treasure hunters by a thirteen-year-old scout, lost the same night, recovered off the Portuguese coast in 1938. “It belongs in a museum!”</p>,
          },
          {
            id: "grail",
            title: "The Holy Grail",
            meta: "Canyon of the Crescent Moon · 1938",
            image: pic("holy-grail", 1120, 700),
            alt: ALT,
            detail: <p>Guarded by a knight for seven hundred years and chosen from a table of decoys. Of one visitor: “He chose… poorly.” Of the next: “You have chosen wisely.”</p>,
          },
        ]}
      />
    </Stage>
  );
}

function PricingDemo() {
  const [billing, setBilling] = useState<Billing>("yearly");
  return (
    <Stage className="flex-col items-stretch">
      <div className="self-center">
        <BillingToggle value={billing} onChange={setBilling} saving="Save up to 20%" />
      </div>
      <div className="grid w-full gap-4 lg:grid-cols-3">
        <PricingCard
          name="Apartment"
          description="For one floor that goes bump in the night."
          price={{ monthly: 0, yearly: 0 }}
          billing={billing}
          features={["One PKE inspection a year", "Call-out within 48 hours", "Slime clean-up advice"]}
          cta="Start free"
        />
        <PricingCard
          name="Brownstone"
          description="For a house with history, and guests who never left."
          price={{ monthly: 24, yearly: 19 }}
          billing={billing}
          featured
          features={["Unlimited inspections", "Class 1 to 5 captures", "Call-out within 12 hours", "Ecto-1 priority dispatch"]}
          cta="Choose Brownstone"
        />
        <PricingCard
          name="High-rise"
          description="For buildings with a temple on the roof."
          price={{ monthly: 64, yearly: 52 }}
          billing={billing}
          features={["Everything in Brownstone", "Rooftop temple cover", "Containment unit storage", "A dedicated team of four"]}
          cta="Choose High-rise"
        />
      </div>
    </Stage>
  );
}

const PLACES = [
  { seed: "bag-end-door", title: "Bag End", note: "No admittance except on party business" },
  { seed: "green-dragon", title: "The Green Dragon", note: "Bywater's finest ale" },
  { seed: "rivendell", title: "Rivendell", note: "The Last Homely House" },
  { seed: "weathertop", title: "Weathertop", note: "Amon Sûl, on the Great East Road" },
  { seed: "moria-gate", title: "The Doors of Durin", note: "Speak, friend, and enter" },
  { seed: "minas-tirith", title: "Minas Tirith", note: "The White City" },
];

function CarouselDemo() {
  return (
    <Stage>
      <Carousel
        label="Places in Middle-earth"
        slides={PLACES.map((s) => (
          <figure className="flex flex-col gap-2" key={s.seed}>
            <div className="aspect-[4/3] overflow-hidden rounded-card bg-active">
              <img decoding="async" src={pic(s.seed, 800, 600)} alt={ALT} width={800} height={600} draggable={false} className="size-full object-cover" />
            </div>
            <figcaption className="flex items-baseline justify-between gap-3 text-sm">
              <span className="shrink-0 whitespace-nowrap font-medium text-ink">{s.title}</span>
              <span className="min-w-0 truncate text-muted">{s.note}</span>
            </figcaption>
          </figure>
        ))}
      />
    </Stage>
  );
}

const PLANETS = ["Tatooine", "Hoth", "Dagobah", "Bespin", "Endor", "Naboo", "Coruscant", "Kashyyyk", "Mustafar", "Scarif", "Jakku", "Yavin 4"];

function MarqueeDemo() {
  return (
    <Stage className="flex-col items-stretch gap-6 overflow-hidden">
      <Marquee label="Planets of a galaxy far, far away" speed={36}>
        {PLANETS.map((p) => (
          <span key={p} className="whitespace-nowrap text-[28px] font-medium tracking-tight text-ink">{p}</span>
        ))}
      </Marquee>
      <Marquee label="The same planets, the other way" speed={-24} gap={12}>
        {PLANETS.map((p) => (
          <span key={p} className="whitespace-nowrap rounded-full bg-surface px-4 py-2 text-sm text-muted">{p}</span>
        ))}
      </Marquee>
      <span className="text-center text-xs text-muted">Hover to ease it to a stop.</span>
    </Stage>
  );
}

function SeparatorDemo() {
  return (
    <Stage className="flex-col items-stretch">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
        <Variant label="Plain">
          <Separator />
        </Variant>
        <Variant label="With a label" className="[&>div]:block">
          <Separator label="or sign in with the Force" />
        </Variant>
        <Variant label="Vertical, between inline items">
          <span className="text-sm text-ink">Edit</span>
          <Separator orientation="vertical" />
          <span className="text-sm text-ink">Duplicate</span>
          <Separator orientation="vertical" />
          <span className="text-sm text-negative">Delete</span>
        </Variant>
      </div>
    </Stage>
  );
}

function ImageDemo() {
  const [n, setN] = useState(0);
  return (
    <Stage className="flex-col">
      <div className="w-full max-w-xl">
        <AspectImage
          key={n}
          src={`${pic("mount-doom", 1200, 675)}?v=${n}`}
          placeholder={pic("mount-doom", 24, 14)}
          alt={ALT}
          ratio={16 / 9}
          caption="Space is reserved before the picture arrives, so nothing below it moves."
        />
      </div>
      <Button size="sm" variant="secondary" onClick={() => setN((v) => v + 1)}>Load again</Button>
    </Stage>
  );
}

function MasonryDemo() {
  const sizes = [[600, 800], [600, 420], [600, 600], [600, 900], [600, 450], [600, 700], [600, 520], [600, 820], [600, 400]];
  return (
    <Stage align="start">
      <Masonry items={sizes.map(([w, h], i) => ({ id: `m${i}`, src: pic(`shire-${i}`, w, h), alt: ALT, width: w, height: h }))} />
    </Stage>
  );
}

function HeroDemo() {
  return (
    <Stage className="bg-surface sm:p-10">
      <Hero
        headingLevel={2}
        title="Printed in the Shire"
        lead="The Bag End Press prints maps, party invitations and second-breakfast menus, in runs from 50 copies."
        actions={
          <>
            <Btn size="lg">Order invitations</Btn>
            <Btn size="lg" variant="ghost">See the maps</Btn>
          </>
        }
        aside="Open every day, after second breakfast."
        image={{ src: pic("hobbiton-press", 900, 1125), alt: ALT, width: 900, height: 1125 }}
      />
    </Stage>
  );
}

function FeatureDemo() {
  const [rev, setRev] = useState(false);
  return (
    <Stage className="flex-col items-stretch bg-surface sm:p-10">
      <FeatureSplit
        key={String(rev)}
        reverse={rev}
        title="Every map inked by hand"
        body="Like Thrór's map, each one carries moon-letters you can only read in the right light. We print in two passes: the map in black, the runes in pale silver."
        points={[
          { title: "From 50 copies", text: "Enough for a long-expected party." },
          { title: "Shire paper", text: "Made at the mill in Hobbiton." },
          { title: "Ready in a fortnight", text: "Sooner, if a wizard asks." },
          { title: "Sent by post", text: "As far as Bree, and beyond." },
        ]}
        image={{ src: pic("thrors-map", 1000, 800), alt: ALT, width: 1000, height: 800 }}
      />
      <Button size="sm" variant="ghost" className="self-start" onClick={() => setRev((r) => !r)}>Swap sides</Button>
    </Stage>
  );
}

function FooterDemo() {
  return (
    <Stage className="p-0 sm:p-0">
      <Footer
        name="Bag End"
        details={
          <>
            The Bag End Press: maps, invitations and menus for hobbits and their guests.
            <br />
            Bag End, Bagshot Row, Hobbiton, the Shire
            <br />
            hello@bagend.example
          </>
        }
        columns={[
          { title: "Press", links: [{ label: "Maps", href: "#/_/masonry" }, { label: "Invitations", href: "#/_/carousel" }, { label: "Menus", href: "#/_/marquee" }, { label: "Prices", href: "#/_/hero" }] },
          { title: "Visit", links: [{ label: "Find us", href: "#/_/feature-split" }, { label: "Opening hours", href: "#/_/aspect-image" }, { label: "Printing classes", href: "#/_/stat-card" }] },
          { title: "Elsewhere", links: [{ label: "Newsletter", href: "#/_/interactive-card" }, { label: "Green Dragon noticeboard", href: "#/_/expandable-card" }, { label: "Email", href: "#/_/separator" }] },
        ]}
        legal="© 2026 Bag End Press. No admittance except on party business."
      />
    </Stage>
  );
}

export const category: Category = {
  id: "surfaces",
  name: "Surfaces & layout",
  summary: "Cards, media and whole page sections to build screens from.",
  entries: [
    { id: "card", name: "Card", summary: "The plain surface, with a header, an action and its content.", files: ["src/kiln/components/cards/Card.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: CardDemo },
    { id: "media-card", name: "Media card", summary: "A picture over its title; the picture pushes in slowly on hover.", files: ["src/kiln/components/cards/Card.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: MediaCardDemo },
    { id: "interactive-card", name: "Choice card", summary: "A whole card that is one control, for picking between a few options.", files: ["src/kiln/components/cards/Card.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: InteractiveCardDemo },
    { id: "stat-card", name: "Stat card", summary: "Figures and a small chart on cards, as on an overview screen.", files: ["src/kiln/components/cards/Card.tsx", "src/kiln/components/data-display/Stat.tsx", "src/kiln/components/charts/BarChart.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: StatCardDemo },
    { id: "expandable-card", name: "Expanding card", summary: "A card that grows into its own detail view; press Esc or the cross to send it back.", files: ["src/kiln/components/cards/ExpandableCard.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: ExpandableDemo },
    { id: "pricing", name: "Pricing", summary: "Plans with a billing switch; the prices roll to their new figures.", files: ["src/kiln/components/cards/PricingCard.tsx", "src/kiln/components/data-display/NumberTicker.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: PricingDemo },
    { id: "carousel", name: "Carousel", summary: "Drag or flick with momentum and it settles on a slide; arrows and keys work too.", files: ["src/kiln/components/media/Carousel.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: CarouselDemo },
    { id: "marquee", name: "Marquee", summary: "An endless row without a seam, which eases to a stop under the pointer.", files: ["src/kiln/components/media/Marquee.tsx", "src/kiln/cn.ts"], Demo: MarqueeDemo },
    { id: "separator", name: "Separator", summary: "A line between things, drawn in from the centre, with or without a label.", files: ["src/kiln/components/primitives/Separator.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: SeparatorDemo },
    { id: "aspect-image", name: "Image", summary: "A picture that holds its space, shows a blurred preview, then fades in sharp.", files: ["src/kiln/components/primitives/AspectImage.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: ImageDemo },
    { id: "masonry", name: "Masonry gallery", summary: "Pictures of mixed heights in columns, rising in as they scroll into view.", files: ["src/kiln/components/media/Masonry.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: MasonryDemo },
    { id: "hero", name: "Hero", summary: "A first screen: the title, one sentence, the action and a large picture.", files: ["src/kiln/components/marketing/Hero.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: HeroDemo },
    { id: "feature-split", name: "Feature section", summary: "Text and its picture side by side, either way round.", files: ["src/kiln/components/marketing/FeatureSplit.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: FeatureDemo },
    { id: "footer", name: "Footer", summary: "A designed close: link columns, then the name at full width.", files: ["src/kiln/components/marketing/Footer.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: FooterDemo },
  ],
};
