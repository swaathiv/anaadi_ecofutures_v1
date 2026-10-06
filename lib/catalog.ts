/**
 * Product catalogue and order pricing rules.
 *
 * Only supplied facts are recorded here:
 * - Sarees: the four supplied photographs. Fabric, dimensions, fibre
 *   composition, care and price were NOT supplied, so they are left
 *   undefined and the UI shows "confirmed before dispatch" instead.
 * - Varatti: name, description and prices from the previous
 *   anaadiecofutures.com shop.
 *
 * Names, prices and order limits live in lib/pricing.ts, which the
 * `placeOrder` Cloud Function also uses; this file adds presentation data.
 */
import { images, type SiteImage } from "@/lib/content/images";
import { priceList } from "@/lib/pricing";

export { commerce, formatINR, quote } from "@/lib/pricing";

export type Fabric = "handloom-cotton" | "silk-cotton" | "silk";

export interface Product {
  slug: string;
  name: string;
  line: "vastras" | "energy";
  images: SiteImage[];
  /** One or two sentences, factual. */
  description: string;
  fabric?: Fabric;
  dimensions?: string;
  fibreComposition?: string;
  colour?: string;
  care?: string;
  /** Unit price in rupees. Undefined = price confirmed before dispatch. */
  price?: number;
  /** Supplier-provided availability text. Undefined = not shown. */
  availability?: string;
  /** Short factual attributes shown as a list. */
  details?: string[];
  maxPerOrder: number;
}

export const fabricLabels: Record<Fabric, string> = {
  "handloom-cotton": "Handloom Cotton",
  "silk-cotton": "Silk-Cotton",
  silk: "Silk",
};

type ProductInput = Omit<Product, "name" | "price" | "maxPerOrder">;

const productInputs: ProductInput[] = [
  {
    slug: "magenta-peacock-blue-pallu",
    line: "vastras",
    images: [images.sareeMagenta, images.detailMagenta],
    colour: "Magenta body, peacock-blue pallu",
    description:
      "A magenta body scattered with small woven motifs, finished with a peacock-blue pallu of peacocks, flowering vines and bands of metallic-toned thread work.",
    details: ["Woven peacock and vine pallu", "Small motifs across the body", "Tasselled pallu end"],
  },
  {
    slug: "orange-peacock-blue-pallu",
    line: "vastras",
    images: [images.sareeOrange, images.detailOrange],
    colour: "Orange body, peacock-blue pallu with a green band",
    description:
      "A warm orange body with small woven motifs and a peacock-blue pallu, edged by a green band, woven with peacocks among vines.",
    details: ["Woven peacock and vine pallu", "Green band at the pallu", "Tasselled pallu end"],
  },
  {
    slug: "ivory-magenta-pallu",
    line: "vastras",
    images: [images.sareeIvory, images.detailIvory],
    colour: "Ivory body, magenta pallu with a pale pink band",
    description:
      "An ivory body with small woven motifs, meeting a pale pink band and a deep magenta pallu woven with peacocks and paisleys.",
    details: ["Woven peacock and paisley pallu", "Pale pink band", "Tasselled pallu end"],
  },
  {
    slug: "coral-peacock-blue-pallu",
    line: "vastras",
    images: [images.sareeCoral, images.detailCoral],
    colour: "Coral-red body, peacock-blue pallu",
    description:
      "A coral-red body with small woven motifs and a peacock-blue pallu of peacocks, vines and metallic-toned borders.",
    details: ["Woven peacock and vine pallu", "Small motifs across the body", "Tasselled pallu end"],
  },
  {
    slug: "varatti-1kg",
    line: "energy",
    images: [],
    description:
      "Handmade, sun-dried cow dung cakes from desi cow gobar. A size for trying them, or for daily puja or havan.",
    details: ["Desi cow gobar", "Sun-dried", "Handmade"],
  },
  {
    slug: "varatti-5kg",
    line: "energy",
    images: [],
    description: "A larger pack for regular havans, pujas or organic farming use.",
    details: ["Desi cow gobar", "Sun-dried", "Handmade"],
  },
  {
    slug: "varatti-10kg",
    line: "energy",
    images: [],
    description: "A bulk pack for temples, ashrams or larger-scale organic farming.",
    details: ["Desi cow gobar", "Sun-dried", "Handmade"],
  },
];

export const products: Product[] = productInputs.map((p) => {
  const entry = priceList[p.slug];
  if (!entry) throw new Error(`No price-list entry for ${p.slug}`);
  return { ...p, name: entry.name, price: entry.price ?? undefined, maxPerOrder: entry.maxPerOrder };
});

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const sarees = products.filter((p) => p.line === "vastras");
export const varatti = products.filter((p) => p.line === "energy");
