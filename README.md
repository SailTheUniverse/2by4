# 2by4

Price comparison for construction materials. Search or browse lumber, electrical, plumbing and tools, filter by
real specs (wire gauge, length, lumber size, PEX diameter…), and see what each item costs at Home Depot, Lowe's,
Menards, Ace Hardware, Harbor Freight and Amazon. Includes in-store prices at your nearest stores and online prices
with shipping, plus unit prices (per ft, per sheet, per 100 ct).

> **Draft:** all prices come from a mock provider that generates believable sample data. See
> [Real price data](#real-price-data) for the plan to plug in real sources.

## Stack

- **Next.js 16** (App Router, Cache Components) + TypeScript + Tailwind CSS 4
- **PostgreSQL** + **Prisma 7** (`@prisma/adapter-pg`)

## Getting started

Requirements: Node 20+ and a PostgreSQL database. Local Postgres works, or use a free hosted tier
(Neon, Supabase, Prisma Postgres).

```bash
npm install
cp .env.example .env          # then edit DATABASE_URL
npm run db:migrate            # create tables
npm run db:seed               # load sample catalog + prices
npm run dev                   # http://localhost:3000
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run prices:refresh [-- <retailer-slug>]` | Pull fresh quotes from each retailer's provider |
| `npm run amazon:match [-- --apply]` | Find Amazon ASINs for products (needs Amazon credentials) |
| `npm test` | Unit tests (optimizer, Amazon provider) |
| `npm run db:reset` | Drop, re-migrate and re-seed the database |
| `npm run typecheck` / `npm run lint` | Checks |

## How it works

```
Category (tree) ──< AttributeDef        filterable specs per category (ENUM / NUMBER / BOOLEAN)
Product (specs JSON, unitLabel/unitQty)  one canonical item, matched across retailers
  └─< Listing (product × retailer, url, retailerSku e.g. ASIN)
        ├─< Offer (current price per location: a Store id or "online"; source = mock | live)
        └─< PricePoint (price history)
Retailer ──< Store (zip)
ProjectList ──< ProjectItem (product, quantity)
```

- **Filters** come from the URL (`/c/wire?gauge=12+AWG&length=250&sort=unit`), so every view can be shared.
  Facet counts are disjunctive: each one ignores its own selection. See `src/lib/filters.ts`.
- **Adding a category or spec** is data only. Add it to `prisma/seed/categories.ts` with its attributes. Product
  specs are JSON keyed by attribute key, so no migration is needed.
- **Local pricing:** the shopper's ZIP is stored in a cookie. For each retailer we use the nearest store in the same
  ZIP zone (first digit), and the "best price" is the cheaper of in-store pickup and online plus shipping. See
  `src/lib/location.ts` and `src/lib/pricing.ts`.
- **Project lists** (`/list`, shareable at `/lists/[id]`): there are no accounts yet, so the list id lives in a cookie.
  `src/lib/optimizer.ts` tries every combination of retailers and pickup vs. online and returns the cheapest plan
  overall, with up to 2 stops, and with one stop. Shipping is one fee per online order: free if any item in the order
  ships free on its own, otherwise the largest single-item fee.
- **Price history**: every refresh appends `PricePoint`s. The product page charts each retailer's best price per day for
  your location (30/90 days) and flags "Lowest price in 90 days". The seed back-fills 90 days of sample history.

### Project layout

```
prisma/schema.prisma         data model
prisma/seed/                 sample retailers, stores, categories, products
scripts/refresh-prices.ts    price refresh job
scripts/amazon-match.ts      ASIN matching for Amazon listings
src/lib/providers/           PriceProvider interface, mock + Amazon providers
src/lib/catalog.ts           queries (products, prices, history)
src/lib/filters.ts           filter parsing, facets, sorting
src/lib/optimizer.ts         cheapest-plan search for project lists
src/app/                     pages: / , /c/[slug], /p/[slug], /search, /list, /lists/[id]
src/components/              UI
```

## Real price data

Each retailer gets a `PriceProvider` (`src/lib/providers/types.ts`). Providers are picked per retailer in
`src/lib/providers/index.ts`, and every offer records its `source`, so the UI tags live prices with **LIVE**. Options,
roughly in order of cost:

1. **Free:** Amazon Creators API (built in, see below), and affiliate network product feeds (Impact, CJ,
   Rakuten), which carry some home-improvement retailers.
2. **Paid ($50–200/mo):** retail data APIs (e.g. SerpApi's Home Depot/Walmart engines, Google Shopping APIs,
   Unwrangle, BlueCart). These cover Home Depot and Lowe's, which have no public API and prohibit scraping.

Product matching across retailers should key on UPC, then brand + model number.

### Amazon (Creators API)

Amazon retired PA-API 5 in spring 2026; the Creators API replaces it, with new credentials.

1. Join Amazon Associates and register for the Creators API in Associates Central. Amazon may require qualifying
   sales before granting or keeping access.
2. Fill in the `AMAZON_*` variables in `.env` (see `.env.example`).
3. `npm run amazon:match`: searches Amazon for each product and shows proposed ASINs. Matches where the model number
   appears in the Amazon title are saved with `--apply`; review the rest and save them with
   `npm run amazon:match -- --set <product-slug> <ASIN>`.
4. `npm run prices:refresh -- amazon` fetches live prices (10 ASINs per request, about 1 request/second).

Once credentials are set, Amazon listings without an ASIN show no Amazon price, rather than sample data. The request
format (token endpoints, `getItems`/`searchItems` fields, `offersV2` response) was taken from published Creators API
client SDKs, because Amazon's docs site wasn't reachable while building this. Unit tests cover it with a mocked API.
Check the first live run against Amazon's current docs, since it hasn't run against real credentials yet.

## Roadmap

- [x] Categories, spec filters, sorting, search
- [x] Price comparison table with unit prices, in-store vs online
- [x] ZIP-based local pricing
- [x] Drywall, concrete & masonry, roofing, miter saws, hand tools, ladders
- [x] Amazon Creators API provider (needs credentials)
- [x] Price history chart + "lowest in 90 days"
- [x] Project lists with cheapest-plan optimizer and share links
- [ ] Scheduled refresh (cron) and more real data sources
- [ ] Accounts, saved lists, price-drop alerts
- [ ] Browser extension ("$4 cheaper at Lowe's")
- [ ] Affiliate links
