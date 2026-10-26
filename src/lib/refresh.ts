import type { PrismaClient } from "@/generated/prisma/client";
import { getProvider } from "@/lib/providers";

/**
 * Pull fresh quotes for every listing (optionally just one retailer) and
 * upsert them as current Offers, appending to PricePoint history.
 * Used by the seed script and by `npm run prices:refresh`.
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

    for (const listing of listings) {
      const quotes = await provider.getQuotes(
        {
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
        },
        retailer.hasStores ? retailer.stores : [],
      );

      const now = new Date();
      await db.$transaction([
        ...quotes.map((q) =>
          db.offer.upsert({
            where: { listingId_locationKey: { listingId: listing.id, locationKey: q.locationKey } },
            create: {
              listingId: listing.id,
              locationKey: q.locationKey,
              storeId: q.storeId,
              price: q.price,
              shippingCost: q.shippingCost,
              inStock: q.inStock,
              checkedAt: now,
            },
            update: { price: q.price, shippingCost: q.shippingCost, inStock: q.inStock, checkedAt: now },
          }),
        ),
        db.pricePoint.createMany({
          data: quotes.map((q) => ({
            listingId: listing.id,
            locationKey: q.locationKey,
            price: q.price,
            recordedAt: now,
          })),
        }),
      ]);
      offerCount += quotes.length;
    }
    console.log(`  ${retailer.name}: ${listings.length} listings refreshed`);
  }
  return offerCount;
}
