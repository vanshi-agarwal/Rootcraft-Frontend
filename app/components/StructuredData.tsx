"use client";

import { useEffect } from "react";

/**
 * Structured Data Component
 * Adds JSON-LD structured data for better SEO and rich snippets
 */
export default function StructuredData() {
  useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4000";

    // Organization Schema
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "FurnitureStore",
      name: "Rootcraft",
      description:
        "Premium furniture store offering high-quality furniture crafted from top materials",
      url: baseUrl,
      logo: `${baseUrl}/logo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+91-98765-43210",
        contactType: "customer service",
        areaServed: "IN",
        availableLanguage: ["English"],
      },
      address: {
        "@type": "PostalAddress",
        streetAddress: "123 Main Street",
        addressLocality: "Mumbai",
        addressRegion: "Maharashtra",
        postalCode: "400001",
        addressCountry: "IN",
      },
      sameAs: [
        "https://www.facebook.com/rootcraft",
        "https://twitter.com/rootcraft",
        "https://www.linkedin.com/company/rootcraft",
      ],
      priceRange: "₹₹₹",
      openingHours: [
        "Mo-Fr 09:00-22:00",
        "Sa-Su 09:00-21:00",
      ],
    };

    // Website Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Rootcraft",
      url: baseUrl,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${baseUrl}/shop?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    };

    // BreadcrumbList Schema (for navigation)
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: baseUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Shop",
          item: `${baseUrl}/shop`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Contact",
          item: `${baseUrl}/contact`,
        },
      ],
    };

    const navigationSchema = {
      "@context": "https://schema.org",
      "@type": "SiteNavigationElement",
      name: ["Home", "Shop", "Blog", "Contact"],
      url: [
        baseUrl,
        `${baseUrl}/shop`,
        `${baseUrl}/blog`,
        `${baseUrl}/contact`,
      ],
    };

    // Add schemas to page
    const schemas = [
      organizationSchema,
      websiteSchema,
      breadcrumbSchema,
      navigationSchema,
    ];

    schemas.forEach((schema, index) => {
      const scriptId = `structured-data-${index}`;
      const existingScript = document.getElementById(scriptId);
      
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.type = "application/ld+json";
        script.text = JSON.stringify(schema);
        document.head.appendChild(script);
      }
    });

    // Cleanup function
    return () => {
      schemas.forEach((_, index) => {
        const script = document.getElementById(`structured-data-${index}`);
        if (script) {
          script.remove();
        }
      });
    };
  }, []);

  return null;
}

