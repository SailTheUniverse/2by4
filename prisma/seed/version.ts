import { createHash } from "node:crypto";
import { AMAZON_ASINS, MODEL_NUMBERS } from "./amazon";
import { CATEGORIES } from "./categories";
import { CATEGORY_CARRIERS, PRODUCTS } from "./products";
import { METROS, RETAILERS } from "./retailers";

export const CATALOG_KEY = "catalogVersion";

/** Fingerprint of all seed data. When it changes, deploys reseed the catalog. */
export function catalogVersion() {
  const retailers = RETAILERS.map(({ searchUrl, ...r }) => ({ ...r, url: searchUrl("x") }));
  const data = JSON.stringify({ CATEGORIES, PRODUCTS, CATEGORY_CARRIERS, METROS, retailers, AMAZON_ASINS, MODEL_NUMBERS });
  return createHash("sha256").update(data).digest("hex").slice(0, 16);
}
