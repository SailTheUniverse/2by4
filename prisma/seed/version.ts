import { createHash } from "node:crypto";
import { CATEGORIES } from "./categories";
import { CATEGORY_CARRIERS, PRODUCTS } from "./products";
import { METROS, RETAILERS } from "./retailers";

export const CATALOG_KEY = "catalogVersion";

/** Fingerprint of all seed data. When it changes, deploys reseed the catalog. */
export function catalogVersion() {
  const retailers = RETAILERS.map(({ searchUrl, ...r }) => ({ ...r, url: searchUrl("x") }));
  const data = JSON.stringify({ CATEGORIES, PRODUCTS, CATEGORY_CARRIERS, METROS, retailers });
  return createHash("sha256").update(data).digest("hex").slice(0, 16);
}
