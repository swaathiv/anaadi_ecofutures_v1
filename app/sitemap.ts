import type { MetadataRoute } from "next";

import { sarees } from "@/lib/catalog";
import { site } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/energy", "/vastras", ...sarees.map((p) => `/vastras/${p.slug}`)].map((path) => ({
    url: `${site.url}${path}`,
  }));
}
