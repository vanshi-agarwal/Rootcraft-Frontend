import { Product } from "@/types/product";

const API_BASE =
  process.env.NEXT_BACKEND_URL;
const API_URL = `${API_BASE}/api`;

const toProduct = (data: any): Product => ({
  id: data._id || data.id || data.slug,
  slug: data.slug,
  name: data.name,
  description: data.description,
  price: Number(data.price ?? 0),
  oldPrice: data.oldPrice,
  image: data.image,
  imagePublicId: data.imagePublicId ?? null,
  gallery: Array.isArray(data.gallery) ? data.gallery : [],
  tag: data.tag,
  category: data.category,
  sku: data.sku,
  rating: data.rating,
  reviews: data.reviews ?? data.numReviews,
  features: data.features,
  colors: data.colors,
  tags: data.tags,
  modelSrc: data.modelSrc,
  countInStock: data.countInStock,
});

type FetchProductsParams = {
  pageNumber?: number;
  pageSize?: number;
  category?: string;
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
};

export async function fetchProducts(params: FetchProductsParams = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const res = await fetch(`${API_URL}/products?${searchParams.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products (${res.status})`);
  }

  const data = await res.json();

  return {
    products: Array.isArray(data.products) ? data.products.map(toProduct) : [],
    page: data.page ?? 1,
    pages: data.pages ?? 1,
    totalProducts: data.totalProducts ?? 0,
  };
}

export async function fetchProductBySlug(slug: string) {
  if (!slug) return null;

  const res = await fetch(`${API_URL}/products/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch product ${slug} (${res.status})`);
  }

  try {
    const data = await res.json();
    return toProduct(data);
  } catch (err) {
    console.error("Failed to parse product payload", err);
    return null;
  }
}

export async function fetchProductSlugs(limit = 200) {
  const { products } = await fetchProducts({ pageNumber: 1, pageSize: limit });
  return products.map((product: Product) => product.slug);
}
