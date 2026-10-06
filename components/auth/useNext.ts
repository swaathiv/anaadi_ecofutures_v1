"use client";

import { useSearchParams } from "next/navigation";

/** Same-site relative path from ?next=, else the fallback. */
export function useNext(fallback = "/account") {
  const next = useSearchParams().get("next");
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
