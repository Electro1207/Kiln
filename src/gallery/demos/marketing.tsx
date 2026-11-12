import type { Category } from "../types";
import { BentoDemo, BlogDemo, CTADemo, ChangelogDemo, ContactDemo, FAQDemo, FeatureTabsDemo, FlyoutDemo, HeadingsDemo, NewsletterDemo, NotFoundDemo, StatsDemo, TeamDemo, TestimonialsDemo } from "./parts/marketing";

export const category: Category = {
  id: "marketing",
  name: "Marketing sections",
  summary: "Whole sections for public pages: navigation, features, proof, sign-ups and the pages around them.",
  entries: [
    { id: "flyout-nav", name: "Flyout and mega menu", summary: "Navigation with wide panels of grouped links and a featured card; hover intent, keyboard, and an accordion on phones.", files: ["src/kiln/components/menus/FlyoutNav.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: FlyoutDemo },
    { id: "bento-grid", name: "Bento grid", summary: "Tiles of different sizes, each with a small live picture; reflows to two columns and then one.", files: ["src/kiln/components/marketing/BentoGrid.tsx", "src/kiln/cn.ts"], Demo: BentoDemo },
    { id: "feature-tabs", name: "Feature tabs", summary: "Features on one side, a picture panel that cross-fades on the other; advances on its own and pauses on hover.", files: ["src/kiln/components/marketing/FeatureTabs.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: FeatureTabsDemo },
    { id: "stats-section", name: "Stats section", summary: "Large figures that count up once as they come into view.", files: ["src/kiln/components/marketing/StatsSection.tsx", "src/kiln/components/app-shells/PageHeading.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: StatsDemo },
    { id: "cta-section", name: "Call to action", summary: "The closing ask: a field of colour, or a split with a picture.", files: ["src/kiln/components/marketing/CTASection.tsx", "src/kiln/cn.ts"], Demo: CTADemo },
    { id: "newsletter", name: "Newsletter sign-up", summary: "Email field with inline validation, a loading state and a success message in place.", files: ["src/kiln/components/marketing/NewsletterSignup.tsx", "src/kiln/components/buttons/Button.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: NewsletterDemo },
    { id: "contact-section", name: "Contact section", summary: "Offices beside a short form that checks itself and confirms when sent.", files: ["src/kiln/components/marketing/ContactSection.tsx", "src/kiln/components/text-input/TextField.tsx", "src/kiln/components/text-input/Textarea.tsx", "src/kiln/components/pickers/Select.tsx", "src/kiln/controllable.ts", "src/kiln/components/shared/Anchored.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts", "src/kiln/components/shared/Field.tsx", "src/kiln/components/buttons/Button.tsx"], Demo: ContactDemo },
    { id: "team-grid", name: "Team grid", summary: "People and their roles; links rise into view on hover and stay visible on touch.", files: ["src/kiln/components/marketing/TeamGrid.tsx", "src/kiln/components/data-display/Avatar.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: TeamDemo },
    { id: "faq-section", name: "FAQ section", summary: "Two columns: the heading and a way to ask, then the questions.", files: ["src/kiln/components/marketing/FAQSection.tsx", "src/kiln/components/wayfinding/Accordion.tsx", "src/kiln/controllable.ts", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: FAQDemo },
    { id: "testimonials", name: "Testimonials", summary: "One quotation set large, then the rest in columns.", files: ["src/kiln/components/marketing/Testimonials.tsx", "src/kiln/components/data-display/Avatar.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: TestimonialsDemo },
    { id: "blog-list", name: "Blog list", summary: "Articles with cover, category, reading time and author.", files: ["src/kiln/components/marketing/BlogList.tsx", "src/kiln/components/data-display/Avatar.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: BlogDemo },
    { id: "changelog", name: "Changelog", summary: "Releases with what is new, improved and fixed.", files: ["src/kiln/components/marketing/Changelog.tsx", "src/kiln/cn.ts"], Demo: ChangelogDemo },
    { id: "not-found", name: "404 page", summary: "A plain way back and the places people usually meant.", files: ["src/kiln/components/marketing/NotFound.tsx", "src/kiln/cn.ts"], Demo: NotFoundDemo },
    { id: "headings", name: "Page and section headings", summary: "Titles with facts, actions and tabs, for the top of a page or a section.", files: ["src/kiln/components/app-shells/PageHeading.tsx", "src/kiln/motion.ts", "src/kiln/cn.ts"], Demo: HeadingsDemo },
  ],
};
