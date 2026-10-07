import { images } from "./images";

export const vastras = {
  hero: {
    eyebrow: "Anaadi Vastras",
    title: "Tradition, woven into everyday life.",
    lede: "Explore handloom cotton, silk-cotton and silk, with attention to texture, craft and the way we wear.",
    cta: { label: "Explore the fabrics", href: "#fabrics" },
    images: { main: images.sareeMagenta, overlap: images.detailCoral },
  },
  fabrics: {
    eyebrow: "The fabrics",
    title: "Three fabrics. Many expressions.",
    /*
     * Descriptions are deliberately general. Fibre percentages, sourcing,
     * dyeing and impact claims must come from the supplier.
     * `weave` selects the woven-swatch illustration until fabric-specific
     * photographs are supplied (set `image` to use a photograph instead).
     */
    entries: [
      {
        id: "handloom-cotton",
        name: "Handloom Cotton",
        body: "Cotton yarn woven on the handloom. A matte, soft-handled cloth for everyday wear.",
        weave: "plain" as const,
      },
      {
        id: "silk-cotton",
        name: "Silk-Cotton",
        body: "Silk and cotton yarns woven together, pairing the ease of cotton with a quiet sheen of silk.",
        weave: "fine" as const,
      },
      {
        id: "silk",
        name: "Silk",
        body: "Woven from silk yarn, with its characteristic lustre and fluid drape.",
        weave: "satin" as const,
      },
    ],
  },
  collection: {
    eyebrow: "The collection",
    title: "Sarees from the loom.",
    body: "Each saree is ₹1,500, with free shipping. Fabric and measurements are confirmed with you before dispatch, and every order is cash on delivery.",
  },
  care: {
    eyebrow: "Craft and care",
    title: "Choose thoughtfully. Care well. Wear often.",
    body: "A considered relationship with clothing begins with noticing the fabric, understanding its care and making room to wear it again and again.",
    note: "Care differs between cotton, silk-cotton and silk, and between individual pieces, so there is no single rule for all of them. Ask us for the care guidance for a particular saree before you order.",
  },
  crossLink: {
    title: "Explore the other expression of Anaadi Ecofutures.",
    cta: { label: "Discover our energy initiatives", href: "/energy" },
  },
};
