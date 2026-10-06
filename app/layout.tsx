import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Marcellus, Public_Sans } from "next/font/google";

import { CartProvider } from "@/components/cart/CartProvider";
import { ContactSection } from "@/components/ContactSection";
import { Logo } from "@/components/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/content/site";

import "./globals.css";

// next/font downloads these at build time and self-hosts them as WOFF2.
const marcellus = Marcellus({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-marcellus",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});
const publicSans = Public_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});
const barlowCondensed = Barlow_Condensed({
  weight: ["500", "600"],
  subsets: ["latin"],
  variable: "--font-barlow-condensed",
  display: "swap",
  fallback: ["Arial Narrow", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Anaadi Ecofutures | Energy & Handloom Textiles",
    template: "%s | Anaadi Ecofutures",
  },
  description: site.description,
  openGraph: { siteName: site.name, type: "website", locale: "en_IN" },
  icons: { icon: "/brand/anaadi-ecofutures-logo-original.png" },
};

export const viewport: Viewport = {
  themeColor: "#faf8f0",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${marcellus.variable} ${publicSans.variable} ${barlowCondensed.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only z-50 bg-forest px-4 py-3 text-paper focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <CartProvider>
          <SiteHeader logo={<Logo priority />} />
          <main id="main" tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
          <ContactSection />
          <SiteFooter logo={<Logo size="sm" />} />
        </CartProvider>
      </body>
    </html>
  );
}
