import type { ListingRef, PriceProvider, Quote } from "./types";

// Amazon Creators API provider (the successor to PA-API 5, which Amazon retired in 2026).
//
// Needs Creators API credentials from Amazon Associates Central, plus your
// Associates partner tag. Listings are matched by ASIN, stored in Listing.retailerSku
// (see `npm run amazon:match`). Amazon doesn't expose shipping cost here, so online
// quotes report free shipping (true for Prime-eligible items, optimistic otherwise).
//
// Wire format follows Amazon's Creators API: OAuth client-credentials token, then
// POST {API_BASE}/getItems with camelCase fields. Verify against Amazon's docs
// when you first connect real credentials.

export const API_BASE = "https://creatorsapi.amazon/catalog/v1";
const MAX_ITEMS_PER_REQUEST = 10;
const MIN_MS_BETWEEN_REQUESTS = 1100; // stay under the default 1 request/second

type Region = "NA" | "EU" | "FE";

export interface AmazonConfig {
  credentialId: string;
  credentialSecret: string;
  /** Credential version from Associates Central, e.g. "2.1" (Cognito) or "3.1" (Login with Amazon) */
  version: string;
  partnerTag: string;
  marketplace: string;
  region: Region;
}

const COGNITO_HOSTS: Record<Region, string> = {
  NA: "creatorsapi.auth.us-east-1.amazoncognito.com",
  EU: "creatorsapi.auth.eu-south-2.amazoncognito.com",
  FE: "creatorsapi.auth.us-west-2.amazoncognito.com",
};
const LWA_HOSTS: Record<Region, string> = {
  NA: "api.amazon.com",
  EU: "api.amazon.co.uk",
  FE: "api.amazon.co.jp",
};

export function amazonConfigFromEnv(env: Record<string, string | undefined> = process.env): AmazonConfig | null {
  const { AMAZON_CREDENTIAL_ID, AMAZON_CREDENTIAL_SECRET, AMAZON_PARTNER_TAG } = env;
  if (!AMAZON_CREDENTIAL_ID || !AMAZON_CREDENTIAL_SECRET || !AMAZON_PARTNER_TAG) return null;
  return {
    credentialId: AMAZON_CREDENTIAL_ID,
    credentialSecret: AMAZON_CREDENTIAL_SECRET,
    version: env.AMAZON_CREDENTIAL_VERSION || "3.1",
    partnerTag: AMAZON_PARTNER_TAG,
    marketplace: env.AMAZON_MARKETPLACE || "www.amazon.com",
    region: (env.AMAZON_REGION as Region) || "NA",
  };
}

const isCognito = (version: string) => version.trim().startsWith("2");

// ─── Response types (only the fields we read) ───────────────

interface OfferListing {
  isBuyBoxWinner?: boolean;
  price?: { money?: { amount?: number; currency?: string } };
  availability?: { type?: string; message?: string };
}

export interface ApiItem {
  asin: string;
  detailPageURL?: string;
  itemInfo?: { title?: { displayValue?: string } };
  offersV2?: { listings?: OfferListing[] };
}

interface ItemsResponse {
  itemsResult?: { items?: ApiItem[] };
  searchResult?: { items?: ApiItem[] };
  errors?: { code?: string; message?: string }[];
}

const OUT_OF_STOCK = new Set(["OUT_OF_STOCK", "UNAVAILABLE", "UNKNOWN"]);

/** Pick the offer a shopper would see (the buy box) and turn it into a quote. */
export function quoteFromItem(item: ApiItem): Quote | null {
  const listings = item.offersV2?.listings ?? [];
  const listing = listings.find((l) => l.isBuyBoxWinner) ?? listings[0];
  const amount = listing?.price?.money?.amount;
  if (typeof amount !== "number") return null;
  const type = listing.availability?.type?.toUpperCase();
  return {
    locationKey: "online",
    storeId: null,
    price: Math.round(amount * 100) / 100,
    shippingCost: null,
    inStock: !type || !OUT_OF_STOCK.has(type),
  };
}

// ─── Client ─────────────────────────────────────────────────

export function createAmazonClient(config: AmazonConfig, fetchImpl: typeof fetch = fetch) {
  let token: { value: string; expiresAt: number } | null = null;
  let lastRequestAt = 0;

  async function getToken() {
    if (token && token.expiresAt - Date.now() > 5 * 60_000) return token.value;

    const cognito = isCognito(config.version);
    const url = cognito
      ? `https://${COGNITO_HOSTS[config.region]}/oauth2/token`
      : `https://${LWA_HOSTS[config.region]}/auth/o2/token`;
    const res = cognito
      ? await fetchImpl(url, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: config.credentialId,
            client_secret: config.credentialSecret,
            scope: "creatorsapi/default",
          }).toString(),
        })
      : await fetchImpl(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grant_type: "client_credentials",
            client_id: config.credentialId,
            client_secret: config.credentialSecret,
            scope: "creatorsapi::default",
          }),
        });
    if (!res.ok) throw new Error(`Amazon token request failed (HTTP ${res.status}): ${await res.text()}`);
    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!data.access_token) throw new Error("Amazon token response had no access_token");
    token = { value: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
    return token.value;
  }

  async function call(operation: string, body: Record<string, unknown>, attempt = 0): Promise<ItemsResponse> {
    const wait = lastRequestAt + MIN_MS_BETWEEN_REQUESTS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastRequestAt = Date.now();

    const accessToken = await getToken();
    const res = await fetchImpl(`${API_BASE}/${operation}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-marketplace": config.marketplace,
        Authorization: isCognito(config.version)
          ? `Bearer ${accessToken}, Version ${config.version}`
          : `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ...body, partnerTag: config.partnerTag, marketplace: config.marketplace }),
    });
    if (res.status === 429 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
      return call(operation, body, attempt + 1);
    }
    if (!res.ok) throw new Error(`Amazon ${operation} failed (HTTP ${res.status}): ${await res.text()}`);
    return (await res.json()) as ItemsResponse;
  }

  return {
    /** Look up offers for any number of ASINs (batched 10 per request). */
    async getItems(asins: string[]): Promise<ApiItem[]> {
      const items: ApiItem[] = [];
      for (let i = 0; i < asins.length; i += MAX_ITEMS_PER_REQUEST) {
        const data = await call("getItems", {
          itemIds: asins.slice(i, i + MAX_ITEMS_PER_REQUEST),
          resources: [
            "itemInfo.title",
            "offersV2.listings.price",
            "offersV2.listings.availability",
            "offersV2.listings.isBuyBoxWinner",
          ],
        });
        items.push(...(data.itemsResult?.items ?? []));
      }
      return items;
    },

    /** Keyword search, used to find ASINs for our products. */
    async searchItems(keywords: string): Promise<ApiItem[]> {
      const data = await call("searchItems", {
        keywords,
        searchIndex: "ToolsAndHomeImprovement",
        itemCount: 5,
        resources: ["itemInfo.title", "offersV2.listings.price"],
      });
      return data.searchResult?.items ?? [];
    },
  };
}

export function createAmazonProvider(config: AmazonConfig, fetchImpl: typeof fetch = fetch): PriceProvider {
  const client = createAmazonClient(config, fetchImpl);
  return {
    retailerSlug: "amazon",
    source: "amazon-creators-api",
    async getQuotes(listings: ListingRef[]) {
      const byAsin = new Map<string, string[]>();
      for (const l of listings) {
        if (!l.retailerSku) continue; // not matched to an ASIN yet
        byAsin.set(l.retailerSku, [...(byAsin.get(l.retailerSku) ?? []), l.listingId]);
      }
      const result = new Map<string, Quote[]>();
      if (!byAsin.size) return result;

      for (const item of await client.getItems([...byAsin.keys()])) {
        const quote = quoteFromItem(item);
        if (!quote) continue;
        for (const listingId of byAsin.get(item.asin) ?? []) result.set(listingId, [quote]);
      }
      return result;
    },
  };
}
