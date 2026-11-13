import type { Category } from "../types";
import { CardDemo, CarouselDemo, ExpandableDemo, FeatureDemo, FooterDemo, HeroDemo, ImageDemo, InteractiveCardDemo, MarqueeDemo, MasonryDemo, MediaCardDemo, PricingDemo, SeparatorDemo, StatCardDemo } from "./parts/surfaces";

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
    { id: "footer", name: "Footer", summary: "A designed close: link columns, then the name sized to fill the width; `reveal` makes it a curtain the page lifts off.", files: ["src/kiln/components/marketing/Footer.tsx", "src/kiln/cn.ts", "src/kiln/motion.ts"], Demo: FooterDemo },
  ],
};
