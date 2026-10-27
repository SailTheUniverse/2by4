import { describe, expect, it, vi } from "vitest";
import { amazonConfigFromEnv, API_BASE, createAmazonProvider, quoteFromItem, type AmazonConfig } from "./amazon";
import type { ListingRef } from "./types";

const config: AmazonConfig = {
  credentialId: "id",
  credentialSecret: "secret",
  version: "3.1",
  partnerTag: "tag-20",
  marketplace: "www.amazon.com",
  region: "NA",
};

const listing = (listingId: string, asin: string | null): ListingRef => ({
  listingId,
  retailerSku: asin,
  url: "",
  product: { slug: listingId, upc: null, model: null, shippable: true, referencePrice: 10 },
});

const item = (asin: string, amount: number, availability = "IN_STOCK") => ({
  asin,
  offersV2: { listings: [{ isBuyBoxWinner: true, price: { money: { amount, currency: "USD" } }, availability: { type: availability } }] },
});

function mockFetch(responses: Record<string, unknown[]>) {
  return vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    const key = String(url);
    if (key.includes("/auth/o2/token") || key.includes("/oauth2/token")) {
      return Response.json({ access_token: "tok", expires_in: 3600 });
    }
    const body = JSON.parse(String(init?.body));
    const items = (body.itemIds as string[]).flatMap((id) => responses[id] ?? []);
    return Response.json({ itemsResult: { items } });
  });
}

describe("amazonConfigFromEnv", () => {
  it("returns null until credentials and partner tag are set", () => {
    expect(amazonConfigFromEnv({})).toBeNull();
    expect(amazonConfigFromEnv({ AMAZON_CREDENTIAL_ID: "a", AMAZON_CREDENTIAL_SECRET: "b" })).toBeNull();
    expect(
      amazonConfigFromEnv({ AMAZON_CREDENTIAL_ID: "a", AMAZON_CREDENTIAL_SECRET: "b", AMAZON_PARTNER_TAG: "t-20" }),
    ).toMatchObject({ version: "3.1", marketplace: "www.amazon.com", region: "NA" });
  });
});

describe("quoteFromItem", () => {
  it("uses the buy-box offer and maps availability", () => {
    expect(quoteFromItem(item("A", 19.99))).toMatchObject({ locationKey: "online", price: 19.99, inStock: true });
    expect(quoteFromItem(item("A", 19.99, "OUT_OF_STOCK"))!.inStock).toBe(false);
    expect(quoteFromItem({ asin: "A", offersV2: { listings: [] } })).toBeNull();
  });
});

describe("createAmazonProvider", () => {
  it("authenticates, batches ASINs and maps quotes back to listings", async () => {
    const asins = Array.from({ length: 12 }, (_, i) => `B0000000${String(i).padStart(2, "0")}`);
    const fetchImpl = mockFetch(Object.fromEntries(asins.map((a, i) => [a, [item(a, 10 + i)]])));
    vi.useFakeTimers({ shouldAdvanceTime: true, advanceTimeDelta: 500 });
    try {
      const provider = createAmazonProvider(config, fetchImpl as unknown as typeof fetch);
      const result = await provider.getQuotes(
        [...asins.map((a, i) => listing(`l${i}`, a)), listing("unmatched", null)],
        [],
      );

      expect(result.size).toBe(12);
      expect(result.get("l3")![0].price).toBe(13);
      expect(result.has("unmatched")).toBe(false);

      const apiCalls = fetchImpl.mock.calls.filter(([url]) => String(url).startsWith(API_BASE));
      expect(apiCalls).toHaveLength(2); // 10 + 2
      const [url, init] = apiCalls[0];
      expect(String(url)).toBe(`${API_BASE}/getItems`);
      expect((init!.headers as Record<string, string>).Authorization).toBe("Bearer tok");
      expect((init!.headers as Record<string, string>)["x-marketplace"]).toBe("www.amazon.com");
      expect(JSON.parse(String(init!.body))).toMatchObject({ partnerTag: "tag-20", marketplace: "www.amazon.com" });
      // Token fetched once and reused
      expect(fetchImpl.mock.calls.filter(([u]) => String(u).includes("token"))).toHaveLength(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it("uses the Cognito flow and versioned auth header for v2 credentials", async () => {
    const fetchImpl = mockFetch({ B1: [item("B1", 5)] });
    const provider = createAmazonProvider({ ...config, version: "2.1" }, fetchImpl as unknown as typeof fetch);
    await provider.getQuotes([listing("l", "B1")], []);
    const [tokenUrl, tokenInit] = fetchImpl.mock.calls[0];
    expect(String(tokenUrl)).toBe("https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token");
    expect(String(tokenInit!.body)).toContain("scope=creatorsapi%2Fdefault");
    const apiInit = fetchImpl.mock.calls[1][1]!;
    expect((apiInit.headers as Record<string, string>).Authorization).toBe("Bearer tok, Version 2.1");
  });
});
