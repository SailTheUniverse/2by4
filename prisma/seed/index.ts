// Seeds the database with sample categories, retailers, stores, products and
// mock prices. Safe to re-run: it wipes catalog data first, but keeps project
// lists (their items are re-linked to the new products by slug).
//   npx prisma db seed
import "dotenv/config";
import { db } from "../../src/lib/db";
import { getProvider } from "../../src/lib/providers";
import { currentDay, quoteListing } from "../../src/lib/providers/mock";
import { refreshPrices } from "../../src/lib/refresh";
import { CATEGORIES, type CategorySeed } from "./categories";
import { CATEGORY_CARRIERS, PRODUCTS } from "./products";
import { METROS, RETAILERS } from "./retailers";
import { CATALOG_KEY, catalogVersion } from "./version";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seedCategories(nodes: CategorySeed[], parentId: string | null = null) {
  for (const [i, node] of nodes.entries()) {
    const category = await db.category.create({
      data: {
        slug: node.slug,
        name: node.name,
        icon: node.icon,
        sortOrder: i,
        parentId,
        attributes: {
          create: (node.attributes ?? []).map((a, j) => ({
            key: a.key,
            label: a.label,
            type: a.type,
            unit: a.unit,
            options: a.options ?? [],
            sortOrder: j,
          })),
        },
      },
    });
    if (node.children) await seedCategories(node.children, category.id);
  }
}

async function main() {
  const savedItems = await db.projectItem.findMany({
    select: { listId: true, quantity: true, product: { select: { slug: true } } },
  });

  console.log("Clearing existing data…");
  await db.pricePoint.deleteMany();
  await db.offer.deleteMany();
  await db.listing.deleteMany();
  await db.product.deleteMany();
  await db.attributeDef.deleteMany();
  await db.category.deleteMany({ where: { parentId: { not: null } } });
  await db.category.deleteMany();
  await db.store.deleteMany();
  await db.retailer.deleteMany();

  console.log("Retailers & stores…");
  const retailerIds = new Map<string, string>();
  for (const r of RETAILERS) {
    const retailer = await db.retailer.create({
      data: { slug: r.slug, name: r.name, websiteUrl: r.websiteUrl, color: r.color, hasStores: r.hasStores },
    });
    retailerIds.set(r.slug, retailer.id);
    if (!r.hasStores) continue;
    const metros = METROS.filter((m) => !r.zones || r.zones.includes(m.zip[0]));
    await db.store.createMany({
      data: metros.map((m) => ({
        retailerId: retailer.id,
        name: `${r.name} – ${m.city}`,
        city: m.city,
        state: m.state,
        zip: m.zip,
      })),
    });
  }

  console.log("Categories…");
  await seedCategories(CATEGORIES);
  const categories = await db.category.findMany({ select: { id: true, slug: true } });
  const categoryIds = new Map(categories.map((c) => [c.slug, c.id]));

  console.log(`Products (${PRODUCTS.length})…`);
  const usedSlugs = new Set<string>();
  for (const p of PRODUCTS) {
    let slug = slugify(p.name);
    while (usedSlugs.has(slug)) slug += "-2";
    usedSlugs.add(slug);

    const shippable = p.shippable ?? true;
    const carriers = (p.only ?? CATEGORY_CARRIERS[p.category]).filter(
      (r) => !p.exclude?.includes(r) && (shippable || RETAILERS.find((x) => x.slug === r)!.hasStores),
    );
    const searchTerm = p.model ? `${p.brand} ${p.model}` : p.name;

    await db.product.create({
      data: {
        slug,
        name: p.name,
        brand: p.brand,
        model: p.model,
        categoryId: categoryIds.get(p.category)!,
        specs: p.specs,
        unitLabel: p.unit?.[0] ?? "each",
        unitQty: p.unit?.[1] ?? 1,
        shippable,
        typicalPrice: p.price,
        listings: {
          create: carriers.map((r) => ({
            retailerId: retailerIds.get(r)!,
            url: RETAILERS.find((x) => x.slug === r)!.searchUrl(searchTerm),
          })),
        },
      },
    });
  }

  if (savedItems.length) {
    const ids = new Map((await db.product.findMany({ select: { id: true, slug: true } })).map((p) => [p.slug, p.id]));
    const kept = savedItems.filter((i) => ids.has(i.product.slug));
    await db.projectItem.createMany({
      data: kept.map((i) => ({ listId: i.listId, productId: ids.get(i.product.slug)!, quantity: i.quantity })),
    });
    console.log(`  Kept ${kept.length}/${savedItems.length} project list items`);
  }

  console.log("Price history (90 days)…");
  const points = await seedHistory(90, 5);
  console.log(`  ${points} history points`);

  console.log("Current prices…");
  const offers = await refreshPrices(db);
  const version = catalogVersion();
  await db.appSetting.upsert({
    where: { key: CATALOG_KEY },
    create: { key: CATALOG_KEY, value: version },
    update: { value: version },
  });
  console.log(`Seeded ${PRODUCTS.length} products with ${offers} offers (catalog ${version}).`);
}

/** Back-fill mock price history: one point every `step` days for the last `days` days. */
async function seedHistory(days: number, step: number) {
  const retailers = await db.retailer.findMany({ include: { stores: { select: { id: true, zip: true } } } });
  let total = 0;
  for (const retailer of retailers) {
    if (getProvider(retailer.slug).source !== "mock") continue; // real sources build their own history
    const listings = await db.listing.findMany({ where: { retailerId: retailer.id }, include: { product: true } });
    const stores = retailer.hasStores ? retailer.stores : [];
    let batch: { listingId: string; locationKey: string; price: number; shippingCost: number | null; recordedAt: Date }[] = [];
    for (let ago = days; ago >= step; ago -= step) {
      const date = new Date(Date.now() - ago * 86_400_000);
      const day = currentDay(date);
      for (const l of listings) {
        const product = { slug: l.product.slug, upc: l.product.upc, model: l.product.model, shippable: l.product.shippable, referencePrice: Number(l.product.typicalPrice) };
        for (const q of quoteListing(retailer.slug, product, stores, day)) {
          batch.push({ listingId: l.id, locationKey: q.locationKey, price: q.price, shippingCost: q.shippingCost, recordedAt: date });
        }
      }
      if (batch.length > 5000) {
        await db.pricePoint.createMany({ data: batch });
        total += batch.length;
        batch = [];
      }
    }
    await db.pricePoint.createMany({ data: batch });
    total += batch.length;
  }
  return total;
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
