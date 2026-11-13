# Kiln

Kiln is a free, MIT-licensed set of 200+ animated React components that work in light and dark mode. It's built on React 19, Tailwind CSS v4, Motion (formerly Framer Motion) and lucide-react, and every component is tested to hold 60fps and to work from the keyboard.

**[Gallery](https://usekiln.pages.dev)** · [What's new](https://usekiln.pages.dev/whats-new) · [npm](https://www.npmjs.com/package/@electro1207/kiln) · [shadcn registry](https://usekiln.pages.dev/r/registry.json) · [Guide for AI agents](https://github.com/Electro1207/Kiln/blob/main/src/kiln/CLAUDE.md)

```bash
npm i @electro1207/kiln motion lucide-react                        # the whole library
npx shadcn@latest add https://usekiln.pages.dev/r/card-journey.json # or one component, copied in
```

You can see every component working in the gallery at https://usekiln.pages.dev, where each one has its own page with a live demo, a Code tab and its install commands. (The address is set once, as `KILN_SITE` in `src/gallery/site.ts`.)

There are two ways to use it. Install the npm package `@electro1207/kiln`, or copy just the components you want into your own project. Both ship the same code from the same release. Either way, the words on screen are yours: titles, labels and messages all come from props and children, so you never need to edit Kiln's source to change text.

## Why Kiln

I started Kiln while using AI to build full-stack apps faster. The code came together quickly, but the interface didn't: good UI and UX was always the slow part. There are other component libraries, but many of them keep their best pieces behind a paywall.

Kiln is free, all of it. It's a passion project, made so anyone can ship a product that looks and feels good without paying for the parts that make it so.

## About

Kiln is built and maintained by one person, and it isn't for sale. If you need a feature, ask for it and I'll try to add it as soon as I can.

## Requests, bugs and questions

Everything goes through GitHub, which is free. You only need a GitHub account.

- **Found a bug?** [Open a bug report](https://github.com/Electro1207/Kiln/issues/new?template=bug_report.yml).
- **Want a component or a change?** [Request a feature](https://github.com/Electro1207/Kiln/issues/new?template=feature_request.yml).
- **Have a question or an idea to talk through?** [Start a discussion](https://github.com/Electro1207/Kiln/discussions).
- **Found a security problem?** [Report it privately](https://github.com/Electro1207/Kiln/security/advisories/new) instead of opening an issue.

## Contents

[Why Kiln](#why-kiln) · [Requests](#requests-bugs-and-questions) · [Install from npm](#install-from-npm) · [Copy components in](#copy-components-in) · [Usage](#usage) · [Theming](#theming) · [Sizing and className](#sizing-and-classname) · [Controlled and uncontrolled](#controlled-and-uncontrolled) · [For AI agents](#for-ai-agents) · [Develop this repo](#develop-this-repo) · [Contributing](#contributing) · [Licence](#licence) · [Security](#security)

## Install from npm

You need a React 19 app that uses Tailwind v4. Vite, Next.js and anything else Tailwind v4 supports will do.

### 1. Install the package and its peers

```bash
npm i @electro1207/kiln motion lucide-react
npm i tailwindcss @tailwindcss/vite   # skip if you already have Tailwind v4
```

The peer dependencies are `react` and `react-dom` 19, `motion`, `lucide-react` and `tailwindcss` 4.

### 2. Add the styles

In your main CSS file, import Tailwind first and Kiln second:

```css
@import "tailwindcss";
@import "@electro1207/kiln/styles.css";
```

`styles.css` holds the colour tokens and maps them onto Tailwind utilities such as `bg-surface`, `text-ink` and `bg-accent`. It also contains `@source "./lib"`, which tells Tailwind to look inside the package for class names. Tailwind normally skips `node_modules`, so without that line the components would show up unstyled. You don't need to add an `@source` of your own. Because Tailwind reads the whole package, your CSS includes every Kiln class (about 18 kB gzipped), whichever components you use.

With Vite, add the plugin to `vite.config.ts` as well:

```ts
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ plugins: [react(), tailwindcss()] });
```

### 3. Wrap your app once

```tsx
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "@electro1207/kiln";

<ThemeProvider>
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>
</ThemeProvider>
```

### 4. Use the components

```tsx
import { Alert, Button, Switch } from "@electro1207/kiln";

<Alert title="Low fuel">Refuel before the Kessel Run.</Alert>
```

The default font is IBM Plex Sans. If you don't load it, the text falls back to Inter or the system font. This repo's `index.html` has both the font link and a small script that sets `.dark` before the first paint, so a dark page doesn't flash white on load. Copy them if you want either.

### Smaller bundles

The package is ESM with one file per component and `"sideEffects": ["*.css"]`, so your bundler leaves out anything you don't import. You can also import from one folder at a time, for example `import { Dialog } from "@electro1207/kiln/overlays"`. The folders are `ai`, `app-shells`, `buttons`, `cards`, `charts`, `choice-controls`, `commerce`, `communication`, `core` (cn, the motion presets, `useControllable` and the theme), `data-display`, `dev-tools`, `effects`, `forms`, `guidance`, `marketing`, `media`, `menus`, `notices`, `overlays`, `pickers`, `primitives`, `shared`, `status`, `tables`, `text-effects`, `text-input`, `wayfinding` and `workspace`.

Your JavaScript only carries what you import, but `styles.css` makes Tailwind scan the whole package, so your CSS holds the classes of every component. For the smallest CSS, run `kiln-css` (it ships in the package) before each build. It reads which Kiln components your code imports and writes a file that points Tailwind at only those:

```bash
npx kiln-css          # scans ./src and writes ./src/kiln-sources.css
```

```css
@import "tailwindcss";
@import "@electro1207/kiln/styles.css";
@import "./kiln-sources.css";
```

Add it to your scripts (`"prebuild": "kiln-css"`, and `kiln-css --watch` beside your dev server). A one-page site using about twenty components went from 119 KB of CSS to 60 KB.

Three type names are exported under different names to avoid clashes: `ChatThreadMessage` (the message type in `ChatThread`), and `AnchoredPlacement` and `OverlayPlacement` (both called `Placement` in `shared/`).

## Copy components in

If you'd rather own the code, copy in only what you need. The files land in your project under `src/kiln/...`, in the same layout as this repo, so the imports between them keep working.

### With the shadcn CLI

Each component is served as `<site>/r/<id>.json`, where `<id>` is the component's id in the gallery (`alert`, `dialog`, `tabs` and so on). `kiln-base` holds the shared code and styles, and `registry.json` lists everything.

1. Add a `components.json` at the root of your project. You don't need to run `npx shadcn@latest init`; this small file is enough. Point `tailwind.css` at your main CSS file:

   ```json
   {
     "$schema": "https://ui.shadcn.com/schema.json",
     "style": "new-york",
     "rsc": false,
     "tsx": true,
     "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true },
     "aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui", "lib": "@/lib", "hooks": "@/hooks" }
   }
   ```

   Kiln's files import each other by relative path and never use these aliases. The CLI just refuses to run without them.

2. Add components:

   ```bash
   npx shadcn@latest add https://usekiln.pages.dev/r/alert.json
   npx shadcn@latest add https://usekiln.pages.dev/r/dialog.json https://usekiln.pages.dev/r/tabs.json
   ```

   Each one brings `kiln-base` and any other Kiln components it uses, and installs `motion` and `lucide-react`. Files you already have are skipped if they're identical.

3. The first time, set up the base. The CLI prints these steps too. In `src/index.css`:

   ```css
   @import "tailwindcss";
   @import "./kiln/kiln.css";
   ```

   Then wrap your app in `ThemeProvider` and `MotionConfig` as in step 3 of the npm install, importing with `import { ThemeProvider } from "./kiln/theme"`.

### Without shadcn

This needs nothing but Node:

```bash
curl -fsSL https://usekiln.pages.dev/kiln-add.mjs | node - alert dialog tabs
```

From a checkout of this repo you can run `node scripts/kiln-add.mjs alert dialog tabs` instead. It downloads the same JSON, writes the files into the current folder and prints the `npm i` command for the packages they need. It takes `--list`, `--site <url>`, `--dir <path>` and `--overwrite`. After that, set up the base as in step 3 above.

You can also copy files by hand. Take `src/kiln/{cn,motion,controllable,theme}.ts(x)`, `tokens.css` and `kiln.css`, then the component file and the helpers its Code tab lists. Keep the folder layout.

## Usage

You set the text with props and children:

```tsx
<Alert tone="warning" title="Low fuel">Refuel before the Kessel Run.</Alert>
<Button>Engage</Button>
<Button variant="secondary" leading={<Plus />}>Add crew</Button>
<Switch label="Retinal scan" defaultChecked />
<Select aria-label="Ship" options={ships} />
<Dialog open={open} onOpenChange={setOpen} title="Eject the warp core?" footer={<Button onClick={eject}>Eject</Button>}>
  This cannot be undone.
</Dialog>
```

### The `labels` prop

Some text a component writes for itself, such as the name of a close button, an empty-state line, screen-reader text or a unit. You change that text with the optional `labels` prop. Each component that has one exports a type, `XLabels`, and its English defaults, `xLabels`. Pass only the words you want to change and the rest stay as they are.

```tsx
import { Pagination, paginationLabels } from "@electro1207/kiln";

<Pagination pageCount={24} labels={{ previous: "Anterior", next: "Siguiente" }} />
// paginationLabels holds the English defaults, if you want to spread them into your own set.
```

If a component also has a dedicated prop for the same text (`placeholder`, `emptyText`, `label`, `aria-label`), that prop wins. A few components memoise their rows, so give them a `labels` object that doesn't change between renders, such as a module constant or a `useMemo`. `docs/API.md`, section 7, lists the components and the rules. Each component's props are documented in its source file, or in its `.d.ts` file if you installed from npm.

### The `icons` prop

The same goes for icons a component draws itself, such as a close button's cross, a chevron, the tick in a checkbox or the star in a rating. Each component that draws some has an optional `icons` prop, plus an exported type, `XIcons`, and its defaults, `xIcons`. Pass any element and only that icon changes. Kiln sizes and colours it for you, so you don't pass a size, and your icon follows the text colour as long as it uses `currentColor`.

```tsx
import { Alert, Rating } from "@electro1207/kiln";
import { Heart, Zap } from "lucide-react";

<Alert tone="warning" title="Don't cross the streams" icons={{ warning: <Zap /> }} />
<Rating value={4} icons={{ star: <Heart fill="currentColor" />, starOff: <Heart /> }} />
```

A dedicated prop such as `icon`, `leading` or `trailing` still wins over `icons`. Pass a stable object to components that memoise their rows, as with `labels`. The theme toggle's sun and moon is the one thing you can't swap, because the two shapes morph into each other. `docs/API.md`, section 8, lists the components and their slots.

## Theming

Every colour, radius and shadow comes from `tokens.css`. Light values are in `:root` and dark values in `.dark`, which goes on `<html>`. Components only use the token utilities, so when you change a token, the whole library follows in both modes.

The easiest way to make a theme is the theme studio in the gallery (the palette icon in the top bar, or [usekiln.pages.dev/studio](https://usekiln.pages.dev/studio)). Pick a preset or set each colour for light and dark, watch every page update, then click Copy tokens.css or Download.

If you copied Kiln in, replace `src/kiln/tokens.css` with the new file. If you use the npm package, put the variables in your own CSS after the Kiln import, and they override the package's values:

```css
@import "tailwindcss";
@import "@electro1207/kiln/styles.css";

:root { --k-accent: #0e7490; }
.dark { --k-accent: #67e8f9; }
```

The package also ships `@electro1207/kiln/tokens.css` on its own, which is handy for looking up variable names.

### Light and dark

`ThemeProvider` stores the mode (`"light"`, `"dark"` or `"system"`) in `localStorage` under `kiln-theme`, and toggles `.dark` on `<html>`. Use `defaultMode` to choose what first-time visitors see. `useTheme()` returns `{ mode, resolved, setMode, toggle }`. `ThemeToggle` is a ready-made button that reveals the new theme as a circle spreading out from where you clicked.

```tsx
<ThemeProvider defaultMode="dark">
  <ThemeToggle />
</ThemeProvider>
```

The motion presets (`springSoft`, `springFirm`, `fade` and others) are in `motion.ts`, and you can use them in your own components.

## Sizing and className

Controls share one size scale: `size="sm" | "md" | "lg"`, which is 32, 40 or 48px tall, with `md` as the default. Components measured in pixels take a number, as in `<Avatar size={64} />` or `<Spinner size={32} />`.

Inputs, Select, Slider, Progress, Tabs and similar components stretch to fill their container, so set a width on them directly: `<Select className="w-[240px]" />`. TextField and Textarea take `containerClassName` for their outer element.

`className` goes on the component's outer element and is added after its own classes. Some components also have classes for their inner parts, such as `boxClassName`, `triggerClassName` and `listClassName`. To change a built-in size, use `size` where you can. Otherwise use Tailwind's important modifier, for example `className="h-14!"`.

## Controlled and uncontrolled

Every input works both ways, and so does anything else you can sort, select, expand or page through. If you leave out the value prop, the component keeps track of its own state, and `defaultChecked`, `defaultValue` and similar props set where it starts. If you pass the value and its change handler, it shows exactly what you give it.

```tsx
<Switch label="Wi-Fi" defaultChecked onCheckedChange={save} />             // uncontrolled

const [on, setOn] = useState(true);
<Switch label="Wi-Fi" checked={on} onCheckedChange={setOn} />              // controlled
```

Dialogs, drawers and other overlays are always controlled: you pass `open` and `onOpenChange`. A few whole flows, like checkout and sign-in, keep their own state and tell you through a callback such as `onSubmit`. `docs/API.md` lists the prop names for each component and which ones are exceptions. For your own components, `useControllable(value, defaultValue, onChange)` gives you the same behaviour.

## For AI agents

If you're an AI coding agent, read `src/kiln/CLAUDE.md` before writing any UI with Kiln. After an npm install it's at `node_modules/@electro1207/kiln/CLAUDE.md`. A copy-in install puts it at `src/kiln/CLAUDE.md`, because it comes with `kiln-base`. It covers setup, lists every component by folder, and sets out the rules to follow.

The short version:

1. Look for a Kiln component in the catalogue before writing your own.
2. Never edit Kiln's source to change text. Use props, children and `labels`. If some text can't be changed from outside, that's a bug in Kiln.
3. Take colours only from the token utilities (`bg-surface`, `text-ink`, `border-line`, `bg-btn-primary`), never raw hex or arbitrary colours. To change the look, edit `tokens.css`.
4. Filled controls use `bg-btn-primary text-btn-primary-ink`. `accent` is for text, rings and small marks, never a large fill.
5. Animate with the presets in `motion.ts`, only on `transform` and `opacity`, and respect `MotionConfig reducedMotion="user"`.
6. Selection indicators fade in where they are. They never slide across other items.
7. Keep the API consistent: `size` is `sm | md | lg`, state can be controlled or uncontrolled, `className` goes on the outer element, and every control has an accessible name (`label` or `aria-label`).
8. Overlays are controlled. Toasts need a `<ToastProvider>` somewhere above `useToast()`.
9. Don't edit generated files: `src/kiln/index.ts`, `src/kiln/groups/`, `public/r/` and `packages/kiln/lib/`.

To change the library itself, follow the rules in [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md).

## Develop this repo

```bash
npm install
npm run dev          # gallery at http://localhost:5190
npm run build        # regenerates public/r/*.json, then builds the gallery to dist/
npm run build:lib    # builds the npm package into packages/kiln/ (then: cd packages/kiln && npm pack)
npm run lint
npx tsc --noEmit -p tsconfig.app.json
```

| Path | What it is |
| --- | --- |
| `src/kiln/` | The library: `tokens.css`, `kiln.css`, `motion.ts`, `theme.tsx`, `cn.ts`, `controllable.ts`, and `components/<folder>/<Name>.tsx`, with one folder per gallery group (see `docs/TAXONOMY.md`). |
| `src/kiln/index.ts`, `src/kiln/groups/` | The package entry points, generated by `scripts/gen-index.mjs` (`npm run gen:index`). |
| `src/gallery/` | The gallery app. It isn't part of the package, and `src/kiln/` never imports from it. |
| `src/gallery/site.ts` | `KILN_SITE` (where the gallery is deployed) and `KILN_PACKAGE`. |
| `packages/kiln/` | The npm package manifest. `lib/`, `styles.css` and the copied docs are build output. |
| `scripts/` | `gen-index.mjs`, `gen-registry.mjs`, `build-lib.mjs`, `kiln-add.mjs`, and `prerender.mjs`, which gives every gallery page its own static HTML, plus `sitemap.xml`, `robots.txt` and `llms.txt`, after `vite build`. |
| `public/r/` | The generated registry, which the deployed gallery serves at `/r/*.json`. |

To try the registry against a local server, generate it with a matching address and serve the output:

```bash
KILN_OUT=/tmp/site KILN_SITE=http://localhost:4175 node scripts/gen-registry.mjs
(cd /tmp/site && python3 -m http.server 4175)
```

Publishing to npm is done by hand. Run `npm run build:lib`, then `npm publish` from `packages/kiln`. `publishConfig` sets public access and provenance, and provenance only works from a trusted CI environment.

## Contributing

Start with [`docs/CONVENTIONS.md`](docs/CONVENTIONS.md). Its rules are binding, and each one exists because something went wrong without it. [`docs/API.md`](docs/API.md) covers props, sizes and slots, and [`docs/TAXONOMY.md`](docs/TAXONOMY.md) shows where every component lives. If you add, move or rename a component, update the catalogue in `src/kiln/CLAUDE.md`, add a demo to the gallery, and run `npm run gen:index`. [`CONTRIBUTING.md`](CONTRIBUTING.md) explains the branches and the checks to run before a pull request.

## Licence

The code is MIT licensed; see [`LICENSE`](LICENSE). The pictures, video and audio in the demos keep their own licences, and [`CREDITS.md`](CREDITS.md) credits each one. Film, show, game and book names in the demo text, and the names of the tools Kiln works with, belong to their owners; Kiln isn't affiliated with or endorsed by them.

## Security

Please report vulnerabilities privately, as described in [`SECURITY.md`](SECURITY.md), rather than opening a public issue.

## Privacy and terms

Kiln collects no personal information: no accounts, cookies, analytics or tracking. The [privacy policy](PRIVACY.md) lists what the website keeps in your browser and which services see a visit. Use of the website, registry and package is covered by the [terms of use](TERMS.md); the code itself stays under the MIT licence. Both are also on the site, at [/privacy](https://usekiln.pages.dev/privacy) and [/terms](https://usekiln.pages.dev/terms).
