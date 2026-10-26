import { createMockProvider } from "./mock";
import type { PriceProvider } from "./types";

export type { PriceProvider, Quote, ListingRef, StoreRef } from "./types";

/**
 * Returns the price provider for a retailer.
 *
 * Every retailer uses mock data for now. To add a real source, implement
 * PriceProvider (e.g. `amazonPaapiProvider`) and return it here for its slug.
 */
export function getProvider(retailerSlug: string): PriceProvider {
  switch (retailerSlug) {
    default:
      return createMockProvider(retailerSlug);
  }
}
