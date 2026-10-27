import { amazonConfigFromEnv, createAmazonProvider } from "./amazon";
import { createMockProvider } from "./mock";
import type { PriceProvider } from "./types";

export type { PriceProvider, Quote, ListingRef, StoreRef } from "./types";

/**
 * Returns the price provider for a retailer. Real providers switch on when
 * their credentials are configured; everything else uses mock data.
 * To add a source, implement PriceProvider and return it here for its slug.
 */
export function getProvider(retailerSlug: string): PriceProvider {
  switch (retailerSlug) {
    case "amazon": {
      const config = amazonConfigFromEnv();
      return config ? createAmazonProvider(config) : createMockProvider(retailerSlug);
    }
    default:
      return createMockProvider(retailerSlug);
  }
}
