#!/usr/bin/env node
/**
 * Quick checker to inspect product data from the backend.
 *
 * Usage:
 *   node scripts/check-products.mjs
 *
 * Env:
 *   NEXT_PUBLIC_BACKEND_URL - base API (default: http://localhost:5000)
 */

const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const pageSize = Number(process.env.PAGE_SIZE || 500);
const pageNumber = 1;

const url = `${base.replace(
  /\/$/,
  ""
)}/api/products?pageSize=${pageSize}&pageNumber=${pageNumber}`;

const run = async () => {
  console.log(`Fetching products from: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status} ${res.statusText}`);
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();

    const products = Array.isArray(data.products) ? data.products : [];
    const totalProducts =
      typeof data.totalProducts === "number"
        ? data.totalProducts
        : typeof data.total === "number"
        ? data.total
        : typeof data.count === "number"
        ? data.count
        : products.length;

    const uniqueIds = new Set();
    const uniqueSlugs = new Set();
    const duplicateIds = [];
    const duplicateSlugs = [];

    for (const p of products) {
      if (p?._id) {
        if (uniqueIds.has(p._id)) duplicateIds.push(p._id);
        uniqueIds.add(p._id);
      }
      if (p?.slug) {
        if (uniqueSlugs.has(p.slug)) duplicateSlugs.push(p.slug);
        uniqueSlugs.add(p.slug);
      }
    }

    const missingSlugs = products.filter((p) => !p?.slug).length;
    const missingIds = products.filter((p) => !p?._id).length;

    console.log("----- Product Data Summary -----");
    console.log(`Reported totalProducts: ${totalProducts}`);
    console.log(`Fetched products length: ${products.length}`);
    console.log(
      `Unique IDs: ${uniqueIds.size} (dupes: ${duplicateIds.length})`
    );
    console.log(
      `Unique slugs: ${uniqueSlugs.size} (dupes: ${duplicateSlugs.length}, missing: ${missingSlugs})`
    );
    console.log(`Missing IDs: ${missingIds}`);
    console.log(`Pages reported: ${data.pages ?? "N/A"}`);
    console.log("--------------------------------");

    if (duplicateIds.length) {
      console.log("Duplicate IDs:", duplicateIds.slice(0, 10));
    }
    if (duplicateSlugs.length) {
      console.log("Duplicate slugs:", duplicateSlugs.slice(0, 10));
    }
  } catch (err) {
    console.error("Error fetching products:", err.message);
    process.exitCode = 1;
  }
};

run();
