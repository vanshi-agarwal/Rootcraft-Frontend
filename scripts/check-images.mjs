#!/usr/bin/env node
/**
 * Check product image URLs for availability.
 *
 * Usage:
 *   node scripts/check-images.mjs
 *
 * Env:
 *   NEXT_PUBLIC_BACKEND_URL - base API (default: http://localhost:5000)
 *   PAGE_SIZE               - max products to fetch (default: 500)
 */

import { setTimeout as delay } from "timers/promises";

const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const pageSize = Number(process.env.PAGE_SIZE || 500);
const url = `${base.replace(/\/$/, "")}/api/products?pageSize=${pageSize}&pageNumber=1`;

const fetchJson = async (target) => {
  const res = await fetch(target);
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return res.json();
};

const checkHead = async (target) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(target, { method: "HEAD", signal: controller.signal });
    return res.status;
  } catch (err) {
    return err.name === "AbortError" ? "timeout" : err.message;
  } finally {
    clearTimeout(timeout);
  }
};

const run = async () => {
  console.log(`Fetching products from: ${url}`);
  let data;
  try {
    data = await fetchJson(url);
  } catch (err) {
    console.error("Failed to fetch products:", err.message);
    process.exit(1);
  }

  const products = Array.isArray(data.products) ? data.products : [];
  console.log(`Checking ${products.length} products...`);

  const broken = [];

  for (const p of products) {
    const image = p?.image;
    if (!image) {
      broken.push({ id: p?._id, slug: p?.slug, reason: "missing image field" });
      continue;
    }

    const status = await checkHead(image);
    if (status !== 200) {
      broken.push({
        id: p?._id,
        slug: p?.slug,
        image,
        status,
      });
    }

    // be gentle
    await delay(50);
  }

  console.log("----- Image Check Summary -----");
  console.log(`Total products: ${products.length}`);
  console.log(`Broken/missing images: ${broken.length}`);
  if (broken.length) {
    console.log("Examples:");
    broken.slice(0, 20).forEach((b) => console.log(b));
  }
  console.log("--------------------------------");
};

run();

