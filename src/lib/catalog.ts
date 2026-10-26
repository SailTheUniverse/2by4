import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { nearestStores, zoneOf } from "@/lib/location";
import { summarize, unitPrice, type PriceSummary, type RawOffer } from "@/lib/pricing";

// ─── Categories ─────────────────────────────────────────────

export async function getCategoryTree() {
  return db.category.findMany({
    where: { parentId: null },
    orderBy: { sortOrder: "asc" },
    include: {
      children: {
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      },
    },
  });
}

export async function getCategory(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: { orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } },
      attributes: { orderBy: { sortOrder: "asc" } },
    },
  });
}

export type CategoryWithAttributes = NonNullable<Awaited<ReturnType<typeof getCategory>>>;
export type AttributeDef = CategoryWithAttributes["attributes"][number];

// ─── Stores near the shopper ────────────────────────────────

export async function getNearbyStores(zip: string | null) {
  if (!zip) return [];
  const stores = await db.store.findMany({
    where: { zip: { startsWith: zoneOf(zip) } },
    include: { retailer: true },
  });
  return [...nearestStores(stores, zip).values()].sort((a, b) =>
    a.retailer.name.localeCompare(b.retailer.name),
  );
}

// ─── Products with prices ───────────────────────────────────

/**
 * Load products matching `where`, with each retailer's online offer and its
 * nearest-store offer for the shopper's ZIP.
 */
export async function loadProducts(where: Prisma.ProductWhereInput, zip: string | null) {
  const storeIds = (await getNearbyStores(zip)).map((s) => s.id);
  const products = await db.product.findMany({
    where,
    orderBy: { name: "asc" },
    include: {
      category: { select: { slug: true, name: true, icon: true, parent: { select: { icon: true } } } },
      listings: {
        include: {
          retailer: { select: { id: true, slug: true, name: true, color: true } },
          offers: {
            where: { OR: [{ locationKey: "online" }, { storeId: { in: storeIds } }] },
            include: { store: { select: { id: true, name: true, city: true, state: true, zip: true } } },
          },
        },
      },
    },
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    model: p.model,
    description: p.description,
    category: p.category,
    categoryId: p.categoryId,
    specs: (p.specs ?? {}) as Record<string, string | number | boolean>,
    unitLabel: p.unitLabel,
    unitQty: p.unitQty,
    shippable: p.shippable,
    typicalPrice: Number(p.typicalPrice),
    listings: p.listings.map((l) => ({
      url: l.url,
      retailer: l.retailer,
      offers: l.offers.map(
        (o): RawOffer => ({
          locationKey: o.locationKey,
          price: Number(o.price),
          shippingCost: o.shippingCost === null ? null : Number(o.shippingCost),
          inStock: o.inStock,
          checkedAt: o.checkedAt,
          store: o.store,
        }),
      ),
    })),
  }));
}

export type LoadedProduct = Awaited<ReturnType<typeof loadProducts>>[number];

export interface PricedProduct extends LoadedProduct {
  prices: PriceSummary;
  unitPrice: number | null;
}

/** Summarize prices, optionally only across the given retailer slugs. */
export function priceProduct(p: LoadedProduct, retailerSlugs: string[] = []): PricedProduct {
  const listings = retailerSlugs.length
    ? p.listings.filter((l) => retailerSlugs.includes(l.retailer.slug))
    : p.listings;
  const prices = summarize(listings);
  return { ...p, prices, unitPrice: unitPrice(prices.bestTotal, p.unitQty) };
}

export async function getProduct(slug: string, zip: string | null) {
  const [product] = await loadProducts({ slug }, zip);
  if (!product) return null;
  const category = await getCategory(product.category.slug);
  return { product: priceProduct(product), category: category! };
}

/** Same-category products that share the most important specs, cheapest per unit first. */
export async function getAlternatives(product: PricedProduct, attributes: AttributeDef[], zip: string | null) {
  // The first two attributes of a category are its defining specs (e.g. wire type + gauge)
  const keySpecs = attributes.slice(0, 2).map((a) => a.key);
  const candidates = await loadProducts(
    { categoryId: product.categoryId, NOT: { id: product.id } },
    zip,
  );
  return candidates
    .filter((c) => keySpecs.every((k) => c.specs[k] === product.specs[k]))
    .map((c) => priceProduct(c))
    .filter((c) => c.unitPrice !== null)
    .sort((a, b) => a.unitPrice! - b.unitPrice!)
    .slice(0, 4);
}

export async function searchProducts(query: string, zip: string | null) {
  const terms = query.trim().split(/\s+/).filter(Boolean).slice(0, 8);
  if (!terms.length) return [];
  const products = await loadProducts(
    {
      AND: terms.map((t) => ({
        OR: [
          { name: { contains: t, mode: "insensitive" as const } },
          { brand: { contains: t, mode: "insensitive" as const } },
          { model: { contains: t, mode: "insensitive" as const } },
          { category: { name: { contains: t, mode: "insensitive" as const } } },
        ],
      })),
    },
    zip,
  );
  return products.map((p) => priceProduct(p));
}

/** Products with the biggest gap between cheapest and priciest retailer. */
export async function getTopSavings(zip: string | null, limit = 8) {
  const products = await loadProducts({}, zip);
  return products
    .map((p) => priceProduct(p))
    .filter((p) => p.prices.inStockCount >= 2 && p.prices.highestTotal)
    .sort((a, b) => b.prices.savings / b.prices.highestTotal! - a.prices.savings / a.prices.highestTotal!)
    .slice(0, limit);
}
