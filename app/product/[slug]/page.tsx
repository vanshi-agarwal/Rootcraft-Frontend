import { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetailClient from "./ProductDetailClient";
import { fetchProductBySlug, fetchProducts } from "@/lib/api/products";
import { Product } from "@/types/product";

type ProductPageProps = {
  params:
    | {
        slug: string;
      }
    | Promise<{
        slug: string;
      }>;
};

export const dynamic = "force-dynamic";

const resolveParams = async (params: ProductPageProps["params"]) =>
  Promise.resolve(params);

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const resolved = await resolveParams(params);
  const slug = resolved?.slug;

  if (!slug) {
    return {
      title: "Product not found | Rootcraft",
    };
  }

  try {
    const product = await fetchProductBySlug(slug);

    if (!product) {
      return {
        title: "Product not found | Rootcraft",
      };
    }

    return {
      title: `${product.name} | Rootcraft`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [
          {
            url: product.image,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
    };
  } catch {
    return {
      title: "Product | Rootcraft",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const resolved = await resolveParams(params);
  const slug = resolved?.slug;

  if (!slug) {
    notFound();
  }

  let product: Product | null = null;

  try {
    product = await fetchProductBySlug(slug);
  } catch (err) {
    console.error("Failed to fetch product", err);
    notFound();
  }

  if (!product) {
    notFound();
  }

  let related = [];
  try {
    const { products } = await fetchProducts({
      category: product.category,
      pageNumber: 1,
      pageSize: 6,
    });

    related = products
      .filter((item: Product) => item.slug !== product.slug)
      .slice(0, 5);
  } catch {
    related = [];
  }

  return <ProductDetailClient product={product} relatedProducts={related} />;
}
