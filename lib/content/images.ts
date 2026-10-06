/**
 * Central image registry. Replace a file in assets/images (or point an entry
 * at a new import) to swap imagery site-wide.
 *
 * `temporary: true` marks concept imagery cropped from the approved mockup.
 * It is illustrative only and must be replaced with approved photographs
 * before launch. It must never be presented as an actual Anaadi installation.
 */
import type { StaticImageData } from "next/image";

import logo from "@/assets/images/logo.png";
import tempEnergyHero from "@/assets/images/temp-energy-hero.jpg";
import tempEnergyCard from "@/assets/images/temp-energy-card.jpg";
import sareeMagenta from "@/assets/images/saree-magenta-peacock-blue.jpg";
import sareeOrange from "@/assets/images/saree-orange-peacock-blue.jpg";
import sareeIvory from "@/assets/images/saree-ivory-magenta.jpg";
import sareeCoral from "@/assets/images/saree-coral-peacock-blue.jpg";
import detailMagenta from "@/assets/images/detail-magenta-pallu.jpg";
import detailOrange from "@/assets/images/detail-orange-pallu.jpg";
import detailIvory from "@/assets/images/detail-ivory-pallu.jpg";
import detailCoral from "@/assets/images/detail-coral-pallu.jpg";

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
    alt: "Illustrative image: native Indian cattle resting under a shelter, with a domed gobar-based energy unit behind them.",
    focus: "50% 60%",
    temporary: true,
  },
  energyCard: {
    src: tempEnergyCard,
    alt: "Illustrative image: native Indian cattle beside a feeding trough, with a domed gobar-based energy unit in the background.",
    focus: "40% 60%",
    temporary: true,
  },
  sareeMagenta: {
    src: sareeMagenta,
    alt: "Magenta saree with a peacock-blue pallu woven with peacocks, vines and flowers, laid flat on a wooden table.",
    focus: "45% 45%",
  },
  sareeOrange: {
    src: sareeOrange,
    alt: "Orange saree with a peacock-blue pallu and a green band, woven with peacocks and vines, laid flat on a wooden table.",
    focus: "45% 45%",
  },
  sareeIvory: {
    src: sareeIvory,
    alt: "Ivory saree with a magenta pallu and pale pink band, woven with peacocks and paisleys, laid diagonally on a wooden table.",
    focus: "55% 40%",
  },
  sareeCoral: {
    src: sareeCoral,
    alt: "Coral-red saree with a peacock-blue pallu woven with peacocks and vines, laid flat on a wooden table.",
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
