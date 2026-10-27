import type { PrismaClient } from "@/generated/prisma/client";
import { getProvider } from "@/lib/providers";

/**
 * Pull fresh quotes for every listing (optionally just one retailer), upsert
 * them as current Offers, drop offers the provider no longer returns, and
 * append to PricePoint history. Used by the seed script and `npm run prices:refresh`.
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
    for (const listing of listings) {
      const quotes = quotesByListing.get(listing.id) ?? [];
      await db.$transaction([
        db.offer.deleteMany({
          where: { listingId: listing.id, locationKey: { notIn: quotes.map((q) => q.locationKey) } },
        }),
        ...quotes.map((q) => {
          const data = {
            storeId: q.storeId,
            price: q.price,
            shippingCost: q.shippingCost,
            inStock: q.inStock,
            source: provider.source,
            checkedAt: now,
          };
          return db.offer.upsert({
            where: { listingId_locationKey: { listingId: listing.id, locationKey: q.locationKey } },
            create: { listingId: listing.id, locationKey: q.locationKey, ...data },
            update: data,
          });
        }),
        db.pricePoint.createMany({
          data: quotes.map((q) => ({
            listingId: listing.id,
            locationKey: q.locationKey,
            price: q.price,
            shippingCost: q.shippingCost,
            recordedAt: now,
          })),
        }),
      ]);
      offerCount += quotes.length;
    }
    const matched = listings.filter((l) => quotesByListing.has(l.id)).length;
    console.log(`  ${retailer.name} (${provider.source}): ${matched}/${listings.length} listings priced`);
  }
  return offerCount;
}
