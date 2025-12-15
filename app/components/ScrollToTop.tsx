"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * ScrollToTop
 * Ensures the viewport resets to the top-left corner whenever the route changes.
 */
const ScrollToTop = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, searchParams?.toString()]);

  return null;
};

export default ScrollToTop;

