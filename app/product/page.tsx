import { redirect } from "next/navigation";

import { fetchProducts } from "@/lib/api/products";

export const dynamic = "force-dynamic";

export default async function ProductIndexPage() {
  try {
    const { products } = await fetchProducts({ pageNumber: 1, pageSize: 1 });
    const firstProduct = products[0];

    if (firstProduct) {
      redirect(`/product/${firstProduct.slug}`);
    }
  } catch {
    // fall through to shop redirect
  }

  redirect("/shop");
}
