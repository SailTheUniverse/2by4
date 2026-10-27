// A PriceProvider knows how to get current prices for one retailer.
//
// Today every retailer uses the mock provider. Real providers (Amazon Product
// Advertising API, affiliate product feeds, or a paid data API) implement the
// same interface, and the refresh job doesn't need to change.

export interface ListingRef {
  listingId: string;
  retailerSku: string | null;
  url: string;
  product: {
    slug: string;
    upc: string | null;
    model: string | null;
    shippable: boolean;
    // Typical market price. Only the mock provider uses it, to generate believable prices.
    referencePrice: number;
  };
}

export interface StoreRef {
  id: string;
  zip: string;
}

export interface Quote {
  /** "online" or a store id */
  locationKey: string;
  storeId: string | null;
  price: number;
  shippingCost: number | null;
  inStock: boolean;
}

export interface PriceProvider {
  retailerSlug: string;
  /** Stored on each Offer so the UI can tell live prices from sample data */
  source: string;
  /**
   * Quotes for many listings at once, keyed by listingId. Providers backed by a
   * real API batch requests here. A listing missing from the result has no
   * current offers (its old offers are removed).
   */
  getQuotes(listings: ListingRef[], stores: StoreRef[]): Promise<Map<string, Quote[]>>;
}
