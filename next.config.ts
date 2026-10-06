import type { NextConfig } from "next";

/**
 * Static export for Firebase Hosting: `npm run build` writes plain files to
 * out/. All dynamic behaviour (sign-in, orders) runs in the browser against
 * Firebase Auth, Firestore and the Cloud Functions in functions/.
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: false,
  // No image server on static hosting; images are pre-sized by
  // scripts/prepare-assets.py.
  images: { unoptimized: true },
  poweredByHeader: false,
};

export default nextConfig;
