"use client";

import { useEffect } from "react";

/**
 * SEO Head Component
 * Adds additional head elements that aren't covered by Next.js metadata API
 * This includes preconnect links for performance optimization
 */
export default function SEOHead() {
  useEffect(() => {
    // Add preconnect links for performance
    const preconnectLinks = [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
    ];

    preconnectLinks.forEach((link) => {
      const existingLink = document.querySelector(
        `link[rel="${link.rel}"][href="${link.href}"]`
      );
      if (!existingLink) {
        const linkElement = document.createElement("link");
        linkElement.rel = link.rel;
        linkElement.href = link.href;
        if (link.crossOrigin) {
          linkElement.crossOrigin = link.crossOrigin;
        }
        document.head.appendChild(linkElement);
      }
    });

    // Add additional favicon links for maximum browser compatibility
    const faviconLinks = [
      { rel: "icon", href: "/favicons/favicon.svg", type: "image/svg+xml" },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicons/favicon-16.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicons/favicon-32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "48x48",
        href: "/favicons/favicon-48.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "64x64",
        href: "/favicons/favicon-64.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "128x128",
        href: "/favicons/favicon-128.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "180x180",
        href: "/favicons/favicon-180.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        href: "/favicons/favicon-192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        href: "/favicons/favicon-512.png",
      },
      { rel: "shortcut icon", href: "/favicons/favicon.ico" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/favicons/favicon-180.png",
      },
    ];

    faviconLinks.forEach((link) => {
      const selector = link.rel === "shortcut icon" 
        ? `link[rel="shortcut icon"]`
        : `link[rel="${link.rel}"][href="${link.href}"]`;
      
      const existingLink = document.querySelector(selector);
      if (!existingLink) {
        const linkElement = document.createElement("link");
        linkElement.rel = link.rel;
        linkElement.href = link.href;
        if (link.type) {
          linkElement.setAttribute("type", link.type);
        }
        if (link.sizes) {
          linkElement.setAttribute("sizes", link.sizes);
        }
        document.head.appendChild(linkElement);
      }
    });
  }, []);

  return null;
}

