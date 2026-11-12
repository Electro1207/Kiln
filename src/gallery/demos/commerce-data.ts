/* Sample shop for the Commerce demos: drawn product pictures (SVG data URLs,
   so the gallery needs no files) and prices that add up. Demo only. */

import type { CartLine, ProductImage } from "../../kiln/components/commerce/commerce";

type Kind = "tee" | "mug" | "cap" | "board" | "poster";
type View = "front" | "detail" | "side" | "flat";

const GROUND = { front: "#ece9e3", detail: "#e4e0d8", side: "#efece6", flat: "#e8e4dc" } as const;

function svg(body: string, view: View, vb = "0 0 400 400") {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><rect x="-400" y="-400" width="1200" height="1200" fill="${GROUND[view]}"/>${body}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(s)}`;
}

/* Pictures are built once and cached; rebuilding data URLs on every render is wasted work. */
const cache = new Map<string, string>();
function art(kind: Kind, colour: string, ink: string, print: string, view: View): string {
  const key = [kind, colour, ink, print, view].join("|");
  let hit = cache.get(key);
  if (!hit) { hit = draw(kind, colour, ink, print, view); cache.set(key, hit); }
  return hit;
}

function draw(kind: Kind, colour: string, ink: string, print: string, view: View): string {
  // Prints shrink to fit the 140-unit-wide print area, so long names never spill off the garment.
  const text = (x: number, y: number, size: number, t: string, c = ink) =>
    `<text x="${x}" y="${y}" font-family="IBM Plex Sans, Arial, sans-serif" font-weight="700" font-size="${Math.min(size, 140 / (0.7 * Math.max(t.length, 1))).toFixed(1)}" text-anchor="middle" fill="${c}" letter-spacing="1">${t.replace(/&/g, "&amp;").replace(/'/g, "&#39;")}</text>`;
  const shade = `<ellipse cx="200" cy="352" rx="120" ry="12" fill="#000" opacity=".08"/>`;
  if (kind === "tee") {
    const body = `${shade}<path d="M130 70l-70 40 26 62 34-14v182h160V158l34 14 26-62-70-40c-8 22-34 36-70 36s-62-14-70-36z" fill="${colour}"/>
      <path d="M160 70c8 16 22 24 40 24s32-8 40-24" fill="none" stroke="${ink}" stroke-opacity=".18" stroke-width="4"/>
      ${text(200, 175, 15, print.split("|")[0])}${text(200, 196, 11, print.split("|")[1] ?? "")}
      <circle cx="200" cy="232" r="22" fill="none" stroke="${ink}" stroke-width="3"/><path d="M188 232h24M200 220v24" stroke="${ink}" stroke-width="3"/>`;
    if (view === "detail") return svg(body, view, "130 130 140 140");
    if (view === "side") return svg(`<g transform="translate(400 0) scale(-1 1)">${shade}<path d="M130 70l-70 40 26 62 34-14v182h160V158l34 14 26-62-70-40c-8 22-34 36-70 36s-62-14-70-36z" fill="${colour}"/></g>${text(200, 140, 12, "ON THE BACK")}${text(200, 230, 22, print.split("|")[1] ?? "")}`, view);
    if (view === "flat") return svg(`<g transform="rotate(-8 200 200)">${body}</g>`, view);
    return svg(body, view);
  }
  if (kind === "mug") {
    const body = `${shade}<rect x="110" y="110" width="160" height="200" rx="14" fill="${colour}"/><path d="M270 150h26a34 34 0 0 1 0 68h-26" fill="none" stroke="${colour}" stroke-width="20"/>
      <ellipse cx="190" cy="112" rx="80" ry="10" fill="#000" opacity=".12"/>${text(190, 205, 17, print.split("|")[0])}${text(190, 228, 11, print.split("|")[1] ?? "")}
      <path d="M150 250h80" stroke="${ink}" stroke-width="3" stroke-opacity=".5"/>`;
    if (view === "detail") return svg(body, view, "120 160 140 100");
    if (view === "side") return svg(`${shade}<rect x="120" y="110" width="160" height="200" rx="14" fill="${colour}"/><path d="M120 150h-26a34 34 0 0 0 0 68h26" fill="none" stroke="${colour}" stroke-width="20"/>${text(200, 215, 14, "CAREFUL, IT'S HOT")}`, view);
    return svg(body, view);
  }
  if (kind === "cap") {
    const body = `${shade}<path d="M90 250c0-90 50-140 110-140s110 50 110 140z" fill="${colour}"/><path d="M90 250c40 10 120 10 200 0l50 20c-90 24-200 24-260 0z" fill="${colour}" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
      <circle cx="200" cy="112" r="8" fill="${ink}" opacity=".5"/>${text(200, 205, 18, print.split("|")[0])}${text(200, 228, 10, print.split("|")[1] ?? "")}`;
    if (view === "detail") return svg(body, view, "130 160 140 90");
    if (view === "side") return svg(`<g transform="translate(400 0) scale(-1 1)">${body}</g>`, view);
    return svg(body, view);
  }
  if (kind === "board") {
    const body = `${shade}<g transform="rotate(-14 200 200)"><rect x="70" y="170" width="260" height="62" rx="31" fill="${colour}"/>
      <rect x="96" y="186" width="208" height="30" rx="15" fill="${ink}" opacity=".18"/>${text(200, 208, 14, print.split("|")[0], "#fff")}
      <rect x="100" y="232" width="50" height="10" rx="5" fill="#000" opacity=".25"/><rect x="250" y="232" width="50" height="10" rx="5" fill="#000" opacity=".25"/></g>`;
    if (view === "detail") return svg(body, view, "110 150 180 120");
    if (view === "side") return svg(`${shade}<rect x="70" y="190" width="260" height="22" rx="11" fill="${colour}"/>${text(200, 160, 12, "NO WHEELS. NO KIDDING.")}`, view);
    return svg(body, view);
  }
  const body = `${shade}<rect x="100" y="50" width="200" height="290" fill="${colour}"/><rect x="112" y="62" width="176" height="266" fill="none" stroke="${ink}" stroke-width="2"/>
    <circle cx="200" cy="160" r="54" fill="${ink}" opacity=".9"/>${text(200, 262, 16, print.split("|")[0])}${text(200, 286, 10, print.split("|")[1] ?? "")}`;
  if (view === "detail") return svg(body, view, "130 100 140 120");
  return svg(body, view);
}

export type DemoProduct = {
  id: string;
  name: string;
  /** Cents. */
  price: number;
  compareAt?: number;
  category: "Apparel" | "Drinkware" | "Collectibles" | "Posters";
  film: string;
  colours: { value: string; name: string; ink: string; light?: boolean }[];
  kind: Kind;
  print: string;
  description: string;
  sizes?: { value: string; soldOut?: boolean }[];
  rating: { average: number; count: number };
};

export const PRODUCTS: DemoProduct[] = [
  { id: "cantina-tee", name: "Cantina Band tee", price: 3200, category: "Apparel", film: "Star Wars", kind: "tee", print: "MOS EISLEY|CANTINA BAND",
    colours: [{ value: "#2f3b4f", name: "Twin-sun navy", ink: "#f2c98a" }, { value: "#d9cdb4", name: "Tatooine sand", ink: "#5b3a20", light: true }, { value: "#7a2e2a", name: "Bantha brown", ink: "#f4e6cf" }],
    description: "Heavyweight cotton, printed with the house band's tour dates. No droids served, and they'll know if you try.",
    sizes: [{ value: "XS" }, { value: "S" }, { value: "M" }, { value: "L", soldOut: true }, { value: "XL" }, { value: "XXL", soldOut: true }],
    rating: { average: 4.6, count: 1138 } },
  { id: "ingen-mug", name: "InGen field mug", price: 1800, category: "Drinkware", film: "Jurassic Park", kind: "mug", print: "JURASSIC PARK|ISLA NUBLAR STAFF",
    colours: [{ value: "#f0ede6", name: "Visitor centre white", ink: "#b3261e", light: true }, { value: "#2f4a35", name: "Ranger green", ink: "#f2c94c" }],
    description: "Holds 12 oz. Ripples visibly when something large walks past.", rating: { average: 4.8, count: 642 } },
  { id: "ecto-cap", name: "Ecto-1 crew cap", price: 2600, compareAt: 3400, category: "Apparel", film: "Ghostbusters", kind: "cap", print: "ECTO-1|EST. 1984",
    colours: [{ value: "#e8e3d6", name: "Firehouse cream", ink: "#b3261e", light: true }, { value: "#1f1f22", name: "Slimer-proof black", ink: "#7ccf5a" }],
    description: "Structured six-panel cap with a curved brim. Who you gonna call is printed inside, in case you forget.", rating: { average: 4.4, count: 389 } },
  { id: "hoverboard", name: "Hill Valley hoverboard", price: 12000, category: "Collectibles", film: "Back to the Future", kind: "board", print: "HOVERBOARD",
    colours: [{ value: "#e86fa0", name: "Pink, as seen in 2015", ink: "#2b1020" }, { value: "#3b6fd1", name: "Griff's blue", ink: "#0c1a33" }],
    description: "Display replica at 1:1 scale. Does not work on water, unless you've got power.", rating: { average: 4.9, count: 2015 } },
  { id: "nostromo-poster", name: "Nostromo crew poster", price: 2400, category: "Posters", film: "Alien", kind: "poster", print: "NOSTROMO|WEYLAND-YUTANI CORP.",
    colours: [{ value: "#d8d4c8", name: "Mother grey", ink: "#1d1d1b", light: true }, { value: "#1d2a2a", name: "Hypersleep teal", ink: "#c9e4dc" }],
    description: "18 × 24 in, archival matte. In space no one can hear you hang it crooked.", rating: { average: 4.7, count: 257 } },
  { id: "zion-tee", name: "Nebuchadnezzar crew tee", price: 3200, category: "Apparel", film: "The Matrix", kind: "tee", print: "NEBUCHADNEZZAR|MARK III NO. 11",
    colours: [{ value: "#16191a", name: "Construct black", ink: "#5ad17a" }, { value: "#e6e6e1", name: "Loading program white", ink: "#1c1c1c", light: true }],
    description: "Soft-washed tee. Fits whether or not there is a spoon.",
    sizes: [{ value: "XS", soldOut: true }, { value: "S" }, { value: "M" }, { value: "L" }, { value: "XL" }, { value: "XXL" }],
    rating: { average: 4.5, count: 999 } },
  { id: "dino-mug", name: "Objects in mirror mug", price: 1600, category: "Drinkware", film: "Jurassic Park", kind: "mug", print: "OBJECTS IN MIRROR|ARE CLOSER THAN THEY APPEAR",
    colours: [{ value: "#c9b27c", name: "Jeep tan", ink: "#3a2a12" }],
    description: "Wing-mirror mug for people who drink coffee faster than a T. rex can run.", rating: { average: 4.3, count: 310 } },
  { id: "flux-poster", name: "Flux capacitor diagram", price: 2800, category: "Posters", film: "Back to the Future", kind: "poster", print: "FLUX CAPACITOR|1.21 GIGAWATTS",
    colours: [{ value: "#1c2433", name: "Blueprint", ink: "#e8eef7" }],
    description: "Doc's original sketch, as drawn after hitting his head on the sink.", rating: { average: 4.9, count: 1985 } },
];

export const VIEWS: View[] = ["front", "side", "detail", "flat"];

const imageCache = new Map<string, ProductImage[]>();
export function imagesFor(p: DemoProduct, colourValue: string): ProductImage[] {
  const k = p.id + colourValue;
  const hit = imageCache.get(k);
  if (hit) return hit;
  const made = makeImages(p, colourValue);
  imageCache.set(k, made);
  return made;
}

function makeImages(p: DemoProduct, colourValue: string): ProductImage[] {
  const c = p.colours.find((x) => x.value === colourValue) ?? p.colours[0];
  const views: View[] = p.kind === "poster" ? ["front", "detail"] : p.kind === "tee" ? VIEWS : ["front", "side", "detail"];
  const label: Record<View, string> = { front: "front", side: "back", detail: "close-up of the print", flat: "laid flat" };
  return views.map((v) => ({ src: art(p.kind, c.value, c.ink, p.print, v), alt: `${p.name} in ${c.name}, ${label[v]}` }));
}

export const thumb = (p: DemoProduct, colour?: string): ProductImage => imagesFor(p, colour ?? p.colours[0].value)[0];

export const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;

export function line(id: string, quantity: number, colourIdx = 0, size?: string): CartLine {
  const p = byId(id);
  const c = p.colours[colourIdx];
  return { id: `${id}-${c.name}-${size ?? ""}`, name: p.name, variant: [c.name, size].filter(Boolean).join(" · "), price: p.price, quantity, image: thumb(p, c.value), max: 9 };
}
