import { MetadataRoute } from "next";
import { fetchProductSlugs } from "@/lib/api/products";

/**
 * Sitemap configuration for SEO
 * Helps search engines discover and index all pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4000";
  const generatedAt = new Date();

  let productEntries: MetadataRoute.Sitemap = [];

  try {
    const slugs: string[] = await fetchProductSlugs(200);
    productEntries = slugs.map((slug: string) => ({
      url: `${baseUrl}/product/${slug}`,
      lastModified: generatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    }));
  } catch {
    productEntries = [];
  }

  return [
    {
      url: baseUrl,
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: generatedAt,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productEntries,
    {
      url: `${baseUrl}/blog`,
      lastModified: generatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: generatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: generatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/wishlist`,
      lastModified: generatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
