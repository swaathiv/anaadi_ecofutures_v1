/**
 * Central image registry. Replace a file in assets/images (or point an entry
 * at a new import) to swap imagery site-wide.
 *
 * `temporary: true` marks concept imagery cropped from the approved mockup
 * (low resolution, ~300–400 px wide). Replace with approved photographs of
 * the same subjects when available; see README → "Assets to replace".
 */
import type { StaticImageData } from "next/image";

import logo from "@/assets/images/logo.png";
import tempEnergyHero from "@/assets/images/temp-energy-hero.jpg";
import tempEnergyCard from "@/assets/images/temp-energy-card.jpg";
import tempFabricHero from "@/assets/images/temp-fabric-hero.jpg";
import tempFabricCard from "@/assets/images/temp-fabric-card.jpg";
// Saree storefront images: the supplied photos with the background replaced
// by a plain ivory backdrop (scripts/make-storefront.py). The sarees
// themselves are unaltered.
import sareeMagenta from "@/assets/images/store-magenta-peacock-blue.jpg";
import sareeOrange from "@/assets/images/store-orange-peacock-blue.jpg";
import sareeIvory from "@/assets/images/store-ivory-magenta.jpg";
import sareeCoral from "@/assets/images/store-coral-peacock-blue.jpg";
import detailMagenta from "@/assets/images/store-detail-magenta-peacock-blue.jpg";
import detailOrange from "@/assets/images/store-detail-orange-peacock-blue.jpg";
import detailIvory from "@/assets/images/store-detail-ivory-magenta.jpg";
import detailCoral from "@/assets/images/store-detail-coral-peacock-blue.jpg";

export interface SiteImage {
  src: StaticImageData;
  alt: string;
  /** CSS object-position focal point. */
  focus?: string;
  temporary?: boolean;
}

export const images = {
  logo: {
    src: logo,
    alt: "Anaadi Ecofutures",
  },
  energyHero: {
    src: tempEnergyHero,
    alt: "Native Indian cattle resting under a shelter, with a domed gobar-based energy unit behind them.",
    focus: "50% 60%",
    temporary: true,
  },
  energyCard: {
    src: tempEnergyCard,
    alt: "Native Indian cattle beside a feeding trough, with a domed gobar-based energy unit in the background.",
    focus: "40% 60%",
    temporary: true,
  },
  fabricHero: {
    src: tempFabricHero,
    alt: "Draped ivory handloom fabric with a green and gold woven border.",
    focus: "50% 50%",
    temporary: true,
  },
  fabricCard: {
    src: tempFabricCard,
    alt: "Folded ivory handloom fabrics with green and gold woven borders, beside raw cotton.",
    focus: "60% 50%",
    temporary: true,
  },
  sareeMagenta: {
    src: sareeMagenta,
    alt: "Magenta saree with a peacock-blue pallu woven with peacocks, vines and flowers, folded on a plain ivory backdrop.",
    focus: "45% 45%",
  },
  sareeOrange: {
    src: sareeOrange,
    alt: "Orange saree with a peacock-blue pallu and a green band, woven with peacocks and vines, folded on a plain ivory backdrop.",
    focus: "45% 45%",
  },
  sareeIvory: {
    src: sareeIvory,
    alt: "Ivory saree with a magenta pallu and pale pink band, woven with peacocks and paisleys, folded on a plain ivory backdrop.",
    focus: "55% 40%",
  },
  sareeCoral: {
    src: sareeCoral,
    alt: "Coral-red saree with a peacock-blue pallu woven with peacocks and vines, folded on a plain ivory backdrop.",
    focus: "45% 45%",
  },
  detailMagenta: {
    src: detailMagenta,
    alt: "Close view of a peacock-blue pallu woven with peacocks among flowering vines.",
  },
  detailOrange: {
    src: detailOrange,
    alt: "Close view of a peacock-blue pallu with woven peacocks and vines, beside an orange body.",
  },
  detailIvory: {
    src: detailIvory,
    alt: "Close view of a magenta pallu woven with peacocks and paisleys in metallic-toned thread.",
  },
  detailCoral: {
    src: detailCoral,
    alt: "Close view of a peacock-blue pallu with woven peacocks and vines, beside a coral-red body.",
  },
} satisfies Record<string, SiteImage>;
