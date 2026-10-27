// Turns raw offers into "what would this cost me at each retailer".

export interface RawOffer {
  locationKey: string;
  price: number;
  shippingCost: number | null;
  inStock: boolean;
  source: string;
  checkedAt: Date;
  store: { id: string; name: string; city: string; state: string; zip: string } | null;
}

export interface RetailerRef {
  id: string;
  slug: string;
  name: string;
  color: string;
}

export interface Option {
  channel: "store" | "online";
  price: number;
  shipping: number; // 0 for pickup / free shipping
  total: number;
  inStock: boolean;
  /** "mock" for sample data, otherwise the live source name */
  source: string;
  checkedAt: Date;
  store: RawOffer["store"];
}

export interface RetailerPrice {
  retailer: RetailerRef;
  url: string;
  store: Option | null;
  online: Option | null;
  /** Cheapest in-stock option, or cheapest overall if nothing is in stock */
  best: Option | null;
}

export interface PriceSummary {
  retailers: RetailerPrice[]; // sorted cheapest first
  best: RetailerPrice | null;
  bestTotal: number | null;
  highestTotal: number | null;
  /** Difference between the most and least expensive retailer */
  savings: number;
  inStockCount: number;
}

function toOption(o: RawOffer): Option {
  const shipping = o.locationKey === "online" ? (o.shippingCost ?? 0) : 0;
  return {
    channel: o.locationKey === "online" ? "online" : "store",
    price: o.price,
    shipping,
    total: Math.round((o.price + shipping) * 100) / 100,
    inStock: o.inStock,
    source: o.source,
    checkedAt: o.checkedAt,
    store: o.store,
  };
}

function cheaper(a: Option | null, b: Option | null): Option | null {
  if (!a) return b;
  if (!b) return a;
  if (a.inStock !== b.inStock) return a.inStock ? a : b;
  return a.total <= b.total ? a : b;
}

/**
 * @param listings one per retailer, with the offers relevant to the shopper:
 *   the online offer plus (at most) the nearest store's offer.
 */
export function summarize(
  listings: { url: string; retailer: RetailerRef; offers: RawOffer[] }[],
): PriceSummary {
  const retailers: RetailerPrice[] = listings
    .map((l) => {
      const storeOffer = l.offers.find((o) => o.locationKey !== "online");
      const onlineOffer = l.offers.find((o) => o.locationKey === "online");
      const store = storeOffer ? toOption(storeOffer) : null;
      const online = onlineOffer ? toOption(onlineOffer) : null;
      return { retailer: l.retailer, url: l.url, store, online, best: cheaper(store, online) };
    })
    .filter((r) => r.best);

  retailers.sort((a, b) => {
    if (a.best!.inStock !== b.best!.inStock) return a.best!.inStock ? -1 : 1;
    return a.best!.total - b.best!.total;
  });

  const totals = retailers.filter((r) => r.best!.inStock).map((r) => r.best!.total);
  const bestTotal = totals.length ? Math.min(...totals) : null;
  const highestTotal = totals.length ? Math.max(...totals) : null;

  return {
    retailers,
    best: retailers[0]?.best?.inStock ? retailers[0] : null,
    bestTotal,
    highestTotal,
    savings: bestTotal !== null && highestTotal !== null ? Math.round((highestTotal - bestTotal) * 100) / 100 : 0,
    inStockCount: totals.length,
  };
}

export function unitPrice(total: number | null, unitQty: number) {
  if (total === null || !unitQty) return null;
  return total / unitQty;
}
