export type ProductTag = {
  type: "discount" | "new";
  value: string;
};

export type ProductColor = {
  name: string;
  value: string;
};

export type ProductGalleryItem = string | { url?: string; publicId?: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  image: string;
  imagePublicId?: string | null;
  gallery?: ProductGalleryItem[];
  tag?: ProductTag;
  category: string;
  sku?: string;
  rating?: number;
  reviews?: number;
  features?: string[];
  colors?: ProductColor[];
  tags?: string[];
  modelSrc?: string;
  countInStock?: number;
};
