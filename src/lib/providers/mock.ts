import type { ListingRef, PriceProvider, Quote, StoreRef } from "./types";

// Generates believable, stable prices so the UI can be built before we have
// real data. Prices are deterministic for a given listing + location + day,
// so they shift a little each day the refresh job runs.

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
}

const PROFILES: Record<string, RetailerProfile> = {
  "home-depot": { priceLevel: 1.0, spread: 0.06, regional: 0.04, sellsOnline: true, freeShippingOver: 45, flatShipping: 6.99, outOfStockRate: 0.06 },
  lowes: { priceLevel: 1.01, spread: 0.07, regional: 0.04, sellsOnline: true, freeShippingOver: 45, flatShipping: 6.99, outOfStockRate: 0.07 },
  menards: { priceLevel: 0.95, spread: 0.06, regional: 0.03, sellsOnline: true, freeShippingOver: null, flatShipping: 8.99, outOfStockRate: 0.08 },
  "ace-hardware": { priceLevel: 1.12, spread: 0.08, regional: 0.06, sellsOnline: true, freeShippingOver: 50, flatShipping: 7.99, outOfStockRate: 0.12 },
  "harbor-freight": { priceLevel: 1.0, spread: 0.02, regional: 0.0, sellsOnline: true, freeShippingOver: null, flatShipping: 8.99, outOfStockRate: 0.05 },
  amazon: { priceLevel: 1.04, spread: 0.1, regional: 0, sellsOnline: true, freeShippingOver: 35, flatShipping: 5.99, outOfStockRate: 0.03 },
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

/** Round like a retailer: $X.97 / $X.98 / $X.99 endings for most prices. */
function retailRound(price: number, seed: number): number {
  if (price < 1) return Math.round(price * 100) / 100;
  const endings = [0.97, 0.98, 0.99, 0.49];
  const ending = endings[Math.floor(seed * endings.length)];
  return Math.max(0.49, Math.floor(price) + ending);
}

export function createMockProvider(retailerSlug: string, day = currentDay()): PriceProvider {
  const profile = PROFILES[retailerSlug] ?? PROFILES["home-depot"];

  return {
    retailerSlug,
    async getQuotes(listing: ListingRef, stores: StoreRef[]): Promise<Quote[]> {
      const { product } = listing;
      const key = `${product.slug}|${retailerSlug}`;
      // The retailer's "list" price for this item
      const itemLevel = profile.priceLevel * (1 + signed(hash01(key)) * profile.spread);
      // Small daily drift so refreshes produce history
      const drift = 1 + signed(hash01(`${key}|${day}`)) * 0.015;
      const base = product.referencePrice * itemLevel * drift;

      const quotes: Quote[] = stores.map((store) => {
        const regional = 1 + signed(hash01(`${key}|${store.zip.slice(0, 3)}`)) * profile.regional;
        const seed = hash01(`${key}|${store.id}|${day}`);
        return {
          locationKey: store.id,
          storeId: store.id,
          price: retailRound(base * regional, hash01(key)),
          shippingCost: null,
          inStock: seed >= profile.outOfStockRate,
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
    },
  };
}

export function currentDay() {
  return new Date().toISOString().slice(0, 10);
}
