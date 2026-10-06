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
 * Prices are in whole rupees. The server always prices orders from this file;
 * client-side cart prices are display only.
 */
import { images, type SiteImage } from "@/lib/content/images";

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

export const products: Product[] = [
  {
    slug: "magenta-peacock-blue-pallu",
    name: "Magenta with Peacock-Blue Pallu",
    line: "vastras",
    images: [images.sareeMagenta, images.detailMagenta],
    colour: "Magenta body, peacock-blue pallu",
    description:
      "A magenta body scattered with small woven motifs, finished with a peacock-blue pallu of peacocks, flowering vines and bands of metallic-toned thread work.",
    details: ["Woven peacock and vine pallu", "Small motifs across the body", "Tasselled pallu end"],
    maxPerOrder: 1,
  },
  {
    slug: "orange-peacock-blue-pallu",
    name: "Orange with Peacock-Blue Pallu",
    line: "vastras",
    images: [images.sareeOrange, images.detailOrange],
    colour: "Orange body, peacock-blue pallu with a green band",
    description:
      "A warm orange body with small woven motifs and a peacock-blue pallu, edged by a green band, woven with peacocks among vines.",
    details: ["Woven peacock and vine pallu", "Green band at the pallu", "Tasselled pallu end"],
    maxPerOrder: 1,
  },
  {
    slug: "ivory-magenta-pallu",
    name: "Ivory with Magenta Pallu",
    line: "vastras",
    images: [images.sareeIvory, images.detailIvory],
    colour: "Ivory body, magenta pallu with a pale pink band",
    description:
      "An ivory body with small woven motifs, meeting a pale pink band and a deep magenta pallu woven with peacocks and paisleys.",
    details: ["Woven peacock and paisley pallu", "Pale pink band", "Tasselled pallu end"],
    maxPerOrder: 1,
  },
  {
    slug: "coral-peacock-blue-pallu",
    name: "Coral with Peacock-Blue Pallu",
    line: "vastras",
    images: [images.sareeCoral, images.detailCoral],
    colour: "Coral-red body, peacock-blue pallu",
    description:
      "A coral-red body with small woven motifs and a peacock-blue pallu of peacocks, vines and metallic-toned borders.",
    details: ["Woven peacock and vine pallu", "Small motifs across the body", "Tasselled pallu end"],
    maxPerOrder: 1,
  },
  {
    slug: "varatti-1kg",
    name: "Varatti — 1 kg",
    line: "energy",
    images: [],
    description:
      "Handmade, sun-dried cow dung cakes from desi cow gobar. A size for trying them, or for daily puja or havan.",
    details: ["Desi cow gobar", "Sun-dried", "Handmade"],
    price: 150,
    maxPerOrder: 20,
  },
  {
    slug: "varatti-5kg",
    name: "Varatti — 5 kg",
    line: "energy",
    images: [],
    description: "A larger pack for regular havans, pujas or organic farming use.",
    details: ["Desi cow gobar", "Sun-dried", "Handmade"],
    price: 700,
    maxPerOrder: 20,
  },
  {
    slug: "varatti-10kg",
    name: "Varatti — 10 kg",
    line: "energy",
    images: [],
    description: "A bulk pack for temples, ashrams or larger-scale organic farming.",
    details: ["Desi cow gobar", "Sun-dried", "Handmade"],
    price: 1300,
    maxPerOrder: 20,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export const sarees = products.filter((p) => p.line === "vastras");
export const varatti = products.filter((p) => p.line === "energy");

/**
 * Order rules. Shipping and the COD fee are the values published on the
 * previous anaadiecofutures.com checkout; confirm before launch.
 */
export const commerce = {
  currency: "INR",
  paymentMethods: ["cod"] as const,
  shippingFee: 80,
  freeShippingFrom: 1000,
  codFee: 50,
};

export interface PricedLine {
  slug: string;
  name: string;
  quantity: number;
  unitPrice: number | null;
  lineTotal: number | null;
}

export interface Quote {
  lines: PricedLine[];
  subtotal: number;
  shipping: number;
  codFee: number;
  total: number;
  /** True when some items have no published price yet. */
  hasUnpricedItems: boolean;
}

export function quote(items: { slug: string; quantity: number }[]): Quote {
  const lines: PricedLine[] = [];
  for (const item of items) {
    const product = getProduct(item.slug);
    if (!product) continue;
    const quantity = Math.max(1, Math.min(product.maxPerOrder, Math.floor(item.quantity)));
    const unitPrice = product.price ?? null;
    lines.push({
      slug: product.slug,
      name: product.name,
      quantity,
      unitPrice,
      lineTotal: unitPrice === null ? null : unitPrice * quantity,
    });
  }
  const subtotal = lines.reduce((sum, l) => sum + (l.lineTotal ?? 0), 0);
  const hasUnpricedItems = lines.some((l) => l.unitPrice === null);
  const shipping = lines.length === 0 || subtotal >= commerce.freeShippingFrom ? 0 : commerce.shippingFee;
  const codFee = lines.length === 0 ? 0 : commerce.codFee;
  return { lines, subtotal, shipping, codFee, total: subtotal + shipping + codFee, hasUnpricedItems };
}

export function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
