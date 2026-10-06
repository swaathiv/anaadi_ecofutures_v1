import type { MetadataRoute } from "next";

import { sarees } from "@/lib/catalog";
import { site } from "@/lib/content/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/energy", "/vastras", ...sarees.map((p) => `/vastras/${p.slug}`)].map((path) => ({
    url: `${site.url}${path}`,
  }));
}
