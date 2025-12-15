#!/usr/bin/env node
/**
 * Replace known broken product images with local fallbacks.
 *
 * Usage:
 *   ADMIN_TOKEN=<jwt> NEXT_PUBLIC_BACKEND_URL=http://localhost:5000 node scripts/fix-images.mjs
 *
 * Notes:
 * - Requires admin auth token (JWT) via ADMIN_TOKEN env; script uses Authorization: Bearer.
 * - Only updates products whose current image returns non-200 OR is mapped in BROKEN_IMAGE_MAP.
 * - Sends a minimal PATCH body (image + imagePublicId) to avoid overwriting other fields.
 */

import { setTimeout as delay } from "timers/promises";

const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTNiMDA0N2QwNDNmM2EwNDVhMjg4OWYiLCJpYXQiOjE3NjU3ODMwNTAsImV4cCI6MTc2ODM3NTA1MH0.VOycLzsmdV2I9zXXfeHDmW6WIb6ub4r8cGx5ImPbQDY";
const pageSize = Number(process.env.PAGE_SIZE || 500);
const api = `${base.replace(/\/$/, "")}/api`;

const BROKEN_IMAGE_MAP = {
  "bookshelf-with-ladder": "/product/pd-5.jpg",
  "executive-leather-chair": "/product/pd-2.jpg",
  "handcrafted-wooden-photo-frame-set": "/product/pd-6.jpg",
  "corner-display-cabinet": "/product/pd-4.jpg",
  "wall-mounted-shelves-set": "/product/pd-4.jpg",
  "l-shaped-office-desk": "/product/pd-2.jpg",
  "sliding-door-wardrobe": "/product/pd-7.jpg",
  "single-bed-with-trundle": "/product/pd-7.jpg",
  "sheesham-wood-dining-table": "/product/pd-9.jpg",
  "upholstered-dining-chairs-set-4": "/product/pd-3.jpg",
  "extendable-dining-table": "/product/pd-9.jpg",
  "wooden-crockery-cabinet": "/product/pd-4.jpg",
  "round-dining-table-for-4": "/product/pd-9.jpg",
};

const fetchJson = async (url, init = {}) => {
  const res = await fetch(url, init);
  if (!res.ok)
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return res.json();
};

const headStatus = async (url) => {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    return res.status;
  } catch (err) {
    return err.name === "AbortError" ? "timeout" : err.message;
  } finally {
    clearTimeout(t);
  }
};

const run = async () => {
  if (!token) {
    console.error("ADMIN_TOKEN is required to update products.");
    process.exit(1);
  }

  const listUrl = `${api}/products?pageNumber=1&pageSize=${pageSize}`;
  console.log(`Fetching products from ${listUrl}`);

  const data = await fetchJson(listUrl);
  const products = Array.isArray(data.products) ? data.products : [];
  console.log(`Fetched ${products.length} products`);

  const toFix = [];
  for (const p of products) {
    const mapped = BROKEN_IMAGE_MAP[p.slug];
    let needsFix = Boolean(mapped);
    if (!needsFix && p.image) {
      const status = await headStatus(p.image);
      needsFix = status !== 200;
      if (!needsFix) continue;
    }
    if (mapped || needsFix) {
      toFix.push({
        id: p._id,
        slug: p.slug,
        current: p.image,
        target: mapped || "/product/pd-1.jpg",
      });
    }
    await delay(50);
  }

  console.log(`Identified ${toFix.length} products to update...`);

  let updated = 0;
  for (const item of toFix) {
    if (!item.id) continue;
    const url = `${api}/products/${item.id}`;
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: item.target,
          imagePublicId: null,
        }),
      });
      if (!res.ok) {
        console.error(`Failed ${item.slug}: ${res.status} ${res.statusText}`);
      } else {
        updated += 1;
        console.log(`Updated ${item.slug} -> ${item.target}`);
      }
    } catch (err) {
      console.error(`Error updating ${item.slug}:`, err.message);
    }
    await delay(100);
  }

  console.log(`Done. Updated ${updated}/${toFix.length} products.`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
