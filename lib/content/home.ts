import { images } from "./images";

export const home = {
  hero: {
    eyebrow: "Rooted in tradition. Shaping tomorrow.",
    title: "A thoughtful way forward.",
    lede: "From the energy we use to the fabrics we wear.",
    primary: { label: "Explore Energy", href: "/energy" },
    secondary: { label: "Discover Vastras", href: "/vastras" },
    images: {
      main: images.energyHero,
      overlap: images.fabricHero,
    },
  },
  purpose: {
    eyebrow: "Our Purpose",
    title: "One purpose. Two expressions.",
    body: "Anaadi Ecofutures brings together gobar-based energy initiatives and handloom textiles through a shared interest in thoughtful everyday living.",
    cards: [
      {
        eyebrow: "Energy",
        title: "Gobar-based Energy",
        body: "Exploring the energy potential of cow dung.",
        cta: { label: "Explore our initiatives", href: "/energy" },
        image: images.energyCard,
      },
      {
        eyebrow: "Vastras",
        title: "Anaadi Vastras",
        body: "Handloom cotton, silk-cotton and silk.",
        cta: { label: "Discover the collection", href: "/vastras" },
        image: images.fabricCard,
      },
    ],
  },
  mission: {
    eyebrow: "Our Purpose",
    title: "Care, woven into everyday life.",
    body: "Thoughtful choices. Shared futures.",
  },
};
