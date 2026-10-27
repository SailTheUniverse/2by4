import type { ListingRef, PriceProvider, Quote, StoreRef } from "./types";

// Generates believable, stable prices so the UI can be built before we have
// real data. A price is deterministic for a listing + location + day, and moves
// over time like real prices do: a slow drift up and down, plus the occasional
// week-long sale. That gives the price history chart realistic shapes.

interface RetailerProfile {
  /** Typical price level relative to the market reference price */
  priceLevel: number;
  /** How much individual items stray from that level (± fraction) */
  spread: number;
  /** Regional variation between stores (± fraction) */
  regional: number;
  sellsOnline: boolean;
  /** Online orders under this subtotal pay flatShipping */
  freeShippingOver: number | null;
  flatShipping: number;
  /** Chance a given store is out of stock */
  outOfStockRate: number;
  /** Chance an item is on sale in a given week */
  saleRate: number;
}

const PROFILES: Record<string, RetailerProfile> = {
  "home-depot": { priceLevel: 1.0, spread: 0.06, regional: 0.04, sellsOnline: true, freeShippingOver: 45, flatShipping: 6.99, outOfStockRate: 0.06, saleRate: 0.08 },
  lowes: { priceLevel: 1.01, spread: 0.07, regional: 0.04, sellsOnline: true, freeShippingOver: 45, flatShipping: 6.99, outOfStockRate: 0.07, saleRate: 0.09 },
  menards: { priceLevel: 0.95, spread: 0.06, regional: 0.03, sellsOnline: true, freeShippingOver: null, flatShipping: 8.99, outOfStockRate: 0.08, saleRate: 0.12 },
  "ace-hardware": { priceLevel: 1.12, spread: 0.08, regional: 0.06, sellsOnline: true, freeShippingOver: 50, flatShipping: 7.99, outOfStockRate: 0.12, saleRate: 0.06 },
  "harbor-freight": { priceLevel: 1.0, spread: 0.02, regional: 0.0, sellsOnline: true, freeShippingOver: null, flatShipping: 8.99, outOfStockRate: 0.05, saleRate: 0.15 },
  amazon: { priceLevel: 1.04, spread: 0.1, regional: 0, sellsOnline: true, freeShippingOver: 35, flatShipping: 5.99, outOfStockRate: 0.03, saleRate: 0.1 },
};

/** Hash a string to a float in [0, 1). FNV-1a; stable across runs. */
export function hash01(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x100000000;
}

/** Map [0,1) to ±1 */
const signed = (x: number) => x * 2 - 1;

/** Round like a retailer: $X.97 / $X.98 / $X.99 / $X.49 endings. */
function retailRound(price: number, seed: number): number {
  if (price < 1) return Math.round(price * 100) / 100;
  const endings = [0.97, 0.98, 0.99, 0.49];
  const ending = endings[Math.floor(seed * endings.length)];
  return Math.max(0.49, Math.floor(price) + ending);
}

/** Days since the Unix epoch for a YYYY-MM-DD date */
function dayIndex(day: string) {
  return Math.floor(Date.parse(`${day}T00:00:00Z`) / 86_400_000);
}

/** Price multiplier for a day: slow drift (±3%) times a sale discount in sale weeks. */
export function timeFactor(key: string, day: string, saleRate: number) {
  const d = dayIndex(day);
  const period = 45 + hash01(`${key}|period`) * 75; // 45–120 day cycle
  const phase = hash01(`${key}|phase`);
  const drift = 1 + 0.03 * Math.sin(2 * Math.PI * (d / period + phase));
  const week = Math.floor(d / 7);
  const onSale = hash01(`${key}|sale|${week}`) < saleRate;
  const discount = onSale ? 1 - (0.08 + hash01(`${key}|depth|${week}`) * 0.12) : 1;
  return drift * discount;
}

export function quoteListing(
  retailerSlug: string,
  product: ListingRef["product"],
  stores: StoreRef[],
  day: string,
): Quote[] {
  const profile = PROFILES[retailerSlug] ?? PROFILES["home-depot"];
  const key = `${product.slug}|${retailerSlug}`;
  // The retailer's usual price for this item
  const itemLevel = profile.priceLevel * (1 + signed(hash01(key)) * profile.spread);
  const base = product.referencePrice * itemLevel * timeFactor(key, day, profile.saleRate);
  const ending = hash01(key);

  const quotes: Quote[] = stores.map((store) => {
    const regional = 1 + signed(hash01(`${key}|${store.zip.slice(0, 3)}`)) * profile.regional;
    return {
      locationKey: store.id,
      storeId: store.id,
      price: retailRound(base * regional, ending),
      shippingCost: null,
      inStock: hash01(`${key}|${store.id}|${day}`) >= profile.outOfStockRate,
    };
  });

  if (profile.sellsOnline && product.shippable) {
    const price = retailRound(base * 1.01, hash01(`${key}|online`));
    const free = profile.freeShippingOver !== null && price >= profile.freeShippingOver;
    quotes.push({
      locationKey: "online",
      storeId: null,
      price,
      shippingCost: free ? null : profile.flatShipping,
      inStock: hash01(`${key}|online|${day}`) >= profile.outOfStockRate / 2,
    });
  }

  return quotes;
}

export function createMockProvider(retailerSlug: string, day = currentDay()): PriceProvider {
  return {
    retailerSlug,
    source: "mock",
    async getQuotes(listings, stores) {
      return new Map(listings.map((l) => [l.listingId, quoteListing(retailerSlug, l.product, stores, day)]));
    },
  };
}

export function currentDay(date = new Date()) {
  return date.toISOString().slice(0, 10);
}
