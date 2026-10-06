/**
 * Site-wide content and configuration.
 *
 * Contact details: only the email published on the previous
 * anaadiecofutures.com site is used. The old site's phone number was a
 * placeholder (+91 XXXXX XXXXX) and its address only said "India", so neither
 * is shown. Add verified details here when available.
 */

export const site = {
  name: "Anaadi Ecofutures",
  url: "https://anaadiecofutures.com",
  tagline: "From the energy we use to the fabrics we wear.",
  description:
    "Anaadi Ecofutures brings together gobar-based energy initiatives and Anaadi Vastras handloom textiles.",
};

const envEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export const contact = {
  /** Undefined hides every email-based contact affordance. */
  email: envEmail === undefined ? "info@anaadiecofutures.com" : envEmail.trim() || undefined,
  /** Verified phone number, e.g. "+91 …". Not yet supplied. */
  phone: undefined as string | undefined,
  /** Verified postal address lines. Not yet supplied. */
  address: undefined as string[] | undefined,
  /** Verified social profiles: { label, href }. Not yet supplied. */
  social: [] as { label: string; href: string }[],
};

export function mailto(subject?: string) {
  if (!contact.email) return undefined;
  return subject
    ? `mailto:${contact.email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${contact.email}`;
}

export const nav = [
  { label: "Our Purpose", href: "/#purpose", match: "/" },
  { label: "Energy", href: "/energy", match: "/energy" },
  { label: "Vastras", href: "/vastras", match: "/vastras" },
  { label: "Contact", href: "#contact", match: null },
] as const;

export const footerNav = [
  { label: "Home", href: "/" },
  { label: "Energy", href: "/energy" },
  { label: "Vastras", href: "/vastras" },
  { label: "Contact", href: "#contact" },
  { label: "Your account", href: "/account" },
] as const;

/** Enquiry topics carried over from the previous site's contact form. */
export const enquiryTopics = [
  "Consultancy enquiry",
  "Workshop registration",
  "Product enquiry",
  "Research collaboration",
  "Anaadi Vastras enquiry",
] as const;
