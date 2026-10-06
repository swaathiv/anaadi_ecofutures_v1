/**
 * Energy page content.
 *
 * Source: the previous anaadiecofutures.com site (index.html in this
 * repository's history, commit 6e7196b). Wording is lightly edited for length
 * and "Govar" is normalised to "gobar" to match the brand brief. Figures and
 * milestones are reproduced as published there; re-confirm them before launch.
 */
import { images } from "./images";

export const energy = {
  hero: {
    eyebrow: "Anaadi Ecofutures · Energy",
    title: "Exploring the energy potential of gobar.",
    lede: "Our energy initiatives focus on cow dung as a resource and its role in meeting everyday energy needs.",
    cta: { label: "Our approach", href: "#approach" },
    image: images.energyHero,
  },

  /** As published on the previous site's hero. */
  figures: [
    { value: "5+", label: "Goshalas" },
    { value: "1,000+", label: "Cows and bulls" },
    { value: "5,500+", label: "Tonnes of cow dung annually" },
  ],

  challenge: {
    eyebrow: "The challenge",
    title: "An energy divide is coming.",
    body: "As the global energy transition accelerates, a new divide is emerging — one that risks leaving farming communities and rural populations behind, much like the digital divide.",
  },

  approach: {
    eyebrow: "Our approach",
    title: "A resource-led approach to energy.",
    body: [
      "Anaadi Ecofutures works to harness the untapped potential of gobar through scalable, sustainable, decentralised climate solutions.",
      "Operating at the intersection of research, design and deployment, we build integrated systems that convert farm waste into clean energy, sustainable materials and bio-based inputs — creating continuing revenue streams for farmers.",
    ],
    /**
     * Feedstock / conversion / use / context. Every line is drawn from the
     * previous site; add detail here only when it is verified.
     */
    facets: [
      {
        label: "Feedstock",
        body: "Cow dung (gobar) and farm waste from goshalas and farms.",
      },
      {
        label: "Conversion",
        body: "A biogas plant set up in 2015, alongside research into gobar-based biofuels and materials.",
      },
      {
        label: "Energy use",
        body: "Fuel for chula (cookstove) and boiler systems in rural households and farms.",
      },
      {
        label: "Context",
        body: "Decentralised, farm-level systems designed with farms, institutions and communities.",
      },
    ],
  },

  /** Rendered by the reusable ProcessSteps component. */
  process: {
    eyebrow: "How we work",
    title: "Research, design, deployment.",
    steps: [
      {
        title: "Research",
        body: "Advancing gobar-based biofuels, bio-construction materials and sustainable packaging.",
      },
      {
        title: "Design",
        body: "Translating research into deployable models by working with farms, institutions and communities to design scalable, decentralised systems.",
      },
      {
        title: "Deployment",
        body: "Bringing solutions to market through products and on-ground systems, from bio-materials to chemical-free agriculture.",
      },
    ],
  },

  why: {
    eyebrow: "Why gobar",
    title: "A local resource with many uses.",
    points: [
      {
        title: "Renewable",
        body: "Gobar is a renewable, carbon-circular resource that turns agricultural waste into energy and helps reduce methane emissions.",
      },
      {
        title: "Resilient",
        body: "Locally available and abundant, it reduces dependence on volatile fossil-fuel supply chains and strengthens rural energy security.",
      },
      {
        title: "Decentralised",
        body: "Gobar-based systems enable distributed energy production at the farm level, lowering infrastructure costs and improving access in rural areas.",
      },
      {
        title: "Stronger ESG performance",
        body: "Compared with coal and oil, gobar-based energy improves ESG performance by lowering carbon intensity, putting waste to use and adding to farmer income.",
      },
    ],
  },

  journey: {
    eyebrow: "Our journey",
    title: "From roots to future.",
    milestones: [
      {
        year: "2015",
        title: "Biogas plant established",
        body: "Our first biogas plant, set up to show that cow dung could be a viable source of energy for rural communities.",
      },
      {
        year: "2017",
        title: "CREST 2017",
        body: "Presented research on cow-based sustainability practices at the CREST conference.",
      },
      {
        year: "2018",
        title: "Capacity building",
        body: "Hands-on training and workshops for local farmers and communities on organic farming, gobar use and sustainable living.",
      },
      {
        year: "2019",
        title: "The gobar kutir",
        body: "Built a kutir (cottage) using gobar-based bio-construction materials.",
      },
      {
        year: "2020",
        title: "Chula and boiler systems",
        body: "Designed and deployed gobar-powered chula and boiler systems, reducing smoke and saving fuel in rural households.",
      },
      {
        year: "2024",
        title: "Anaadi Ecofutures established",
        body: "Years of research and ground-level work formalised as a company dedicated to decentralised climate solutions from gobar.",
      },
    ],
    ahead: {
      title: "The road ahead",
      body: "Bio-construction at scale, gobar-based biofuels for aviation, wider capacity-building workshops, and partnerships that take this work from the farm outward.",
    },
  },

  research: {
    eyebrow: "Research",
    title: "Value from every stream.",
    body: "Each research stream is designed to create value from gobar and open new revenue models for goshalas and farmers.",
    streams: [
      {
        area: "Bioenergy",
        title: "Gobar-based biofuels",
        body: "Research into gobar-based biofuels including biogas, aviation fuel and rocket fuel.",
      },
      {
        area: "Agriculture",
        title: "Organic farming",
        body: "Our farm has produced over 5 tonnes of rice using only cow dung and gomutra as fertilisers.",
      },
      {
        area: "Construction",
        title: "Bio-construction materials",
        body: "A mix of cow dung, soil and other ingredients for affordable building materials, rooted in traditional methods.",
      },
      {
        area: "Construction",
        title: "Interlocking bricks",
        body: "An interlocking brick design using gobar, intended to reduce construction waste and speed up building.",
      },
      {
        area: "Packaging",
        title: "Bio-cardboard",
        body: "Cardboard from cow dung as an alternative for non-food-grade packaging.",
      },
    ],
  },

  /** Space for verified project entries: { title, body, status, image }. */
  initiatives: [] as { title: string; body: string; status?: string }[],

  consultancy: {
    eyebrow: "Consultancy and workshops",
    title: "We help you build and operate.",
    services: [
      {
        title: "Organic farm setup",
        body: "Consulting for farms, individuals and institutions to build and operate organic farms using traditional Indian methods.",
      },
      {
        title: "Biogas and gobar plants",
        body: "End-to-end support for installing and operating biogas or gobar plants, from feasibility to commissioning and training.",
      },
      {
        title: "Capacity-building workshops",
        body: "Hands-on workshops on organic farming and gobar for farmers, students and organisations.",
      },
      {
        title: "Institutional advisory",
        body: "Consulting for educational institutions, NGOs and government bodies adopting sustainable agriculture and energy practices.",
      },
    ],
    cta: { label: "Start a conversation", subject: "Consultancy enquiry" },
  },

  products: {
    eyebrow: "From the farm",
    title: "Handmade varatti.",
    body: "Sun-dried cow dung cakes made from desi cow gobar, used for havans, pujas, organic farming and as fuel.",
  },

  crossLink: {
    title: "Explore the other expression of Anaadi Ecofutures.",
    cta: { label: "Discover Anaadi Vastras", href: "/vastras" },
  },
};
