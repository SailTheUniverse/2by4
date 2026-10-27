import type { PrismaClient } from "@/generated/prisma/client";
import { getProvider } from "@/lib/providers";

/**
 * Pull fresh quotes for every listing (optionally just one retailer), replace
 * the retailer's current Offers with them, and append to PricePoint history.
 * Writes are bulk (a few queries per retailer) so this fits in a serverless
 * function. Used by the seed script, `npm run prices:refresh` and the cron route.
 */
export async function refreshPrices(db: PrismaClient, opts: { retailerSlug?: string } = {}) {
  const retailers = await db.retailer.findMany({
    where: opts.retailerSlug ? { slug: opts.retailerSlug } : undefined,
    include: { stores: { select: { id: true, zip: true } } },
  });

  let offerCount = 0;
  for (const retailer of retailers) {
    const provider = getProvider(retailer.slug);
    const listings = await db.listing.findMany({
      where: { retailerId: retailer.id },
      include: { product: true },
    });

    const quotesByListing = await provider.getQuotes(
      listings.map((listing) => ({
        listingId: listing.id,
        retailerSku: listing.retailerSku,
        url: listing.url,
        product: {
          slug: listing.product.slug,
          upc: listing.product.upc,
          model: listing.product.model,
          shippable: listing.product.shippable,
          referencePrice: Number(listing.product.typicalPrice),
        },
      })),
      retailer.hasStores ? retailer.stores : [],
    );

    const now = new Date();
    const offers = listings.flatMap((listing) =>
      (quotesByListing.get(listing.id) ?? []).map((q) => ({
        listingId: listing.id,
        locationKey: q.locationKey,
        storeId: q.storeId,
        price: q.price,
        shippingCost: q.shippingCost,
        inStock: q.inStock,
        source: provider.source,
        checkedAt: now,
      })),
    );

    // Listings the provider returned nothing for lose their offers
    await db.$transaction([
      db.offer.deleteMany({ where: { listing: { retailerId: retailer.id } } }),
      db.offer.createMany({ data: offers }),
      db.pricePoint.createMany({
        data: offers.map((o) => ({
          listingId: o.listingId,
          locationKey: o.locationKey,
          price: o.price,
          shippingCost: o.shippingCost,
          recordedAt: now,
        })),
      }),
    ]);
    offerCount += offers.length;

    const matched = listings.filter((l) => quotesByListing.has(l.id)).length;
    console.log(`  ${retailer.name} (${provider.source}): ${matched}/${listings.length} listings priced`);
  }
  return offerCount;
}

/** Drop history older than `days` so the database stays small (free-tier friendly). */
export async function pruneHistory(db: PrismaClient, days = 120) {
  const { count } = await db.pricePoint.deleteMany({
    where: { recordedAt: { lt: new Date(Date.now() - days * 86_400_000) } },
  });
  return count;
}
