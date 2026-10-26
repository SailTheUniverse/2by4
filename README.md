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
| `npm run db:reset` | Drop, re-migrate and re-seed the database |
| `npm run typecheck` / `npm run lint` | Checks |

## How it works

```
Category (tree) ──< AttributeDef        filterable specs per category (ENUM / NUMBER / BOOLEAN)
Product (specs JSON, unitLabel/unitQty)  one canonical item, matched across retailers
  └─< Listing (product × retailer, url)
        ├─< Offer (current price per location: a Store id or "online")
        └─< PricePoint (price history)
Retailer ──< Store (zip)
```

- **Filters** come from the URL (`/c/wire?gauge=12+AWG&length=250&sort=unit`), so every view can be shared.
  Facet counts are disjunctive: each one ignores its own selection. See `src/lib/filters.ts`.
- **Adding a category or spec** is data only. Add it to `prisma/seed/categories.ts` with its attributes. Product
  specs are JSON keyed by attribute key, so no migration is needed.
- **Local pricing:** the shopper's ZIP is stored in a cookie. For each retailer we use the nearest store in the same
  ZIP zone (first digit), and the "best price" is the cheaper of in-store pickup and online plus shipping. See
  `src/lib/location.ts` and `src/lib/pricing.ts`.

### Project layout

```
prisma/schema.prisma         data model
prisma/seed/                 sample retailers, stores, categories, products
scripts/refresh-prices.ts    price refresh job
src/lib/providers/           PriceProvider interface + mock provider
src/lib/catalog.ts           queries
src/lib/filters.ts           filter parsing, facets, sorting
src/app/                     pages: / , /c/[slug], /p/[slug], /search
src/components/              UI
```

## Real price data

Each retailer gets a `PriceProvider` (`src/lib/providers/types.ts`). Swap the mock out per retailer in
`src/lib/providers/index.ts`. Options, roughly in order of cost:

1. **Free:** Amazon Product Advertising API (requires an Associates account with qualifying sales), and affiliate
   network product feeds (Impact, CJ, Rakuten), which carry some home-improvement retailers.
2. **Paid ($50–200/mo):** retail data APIs (e.g. SerpApi's Home Depot/Walmart engines, Google Shopping APIs,
   Unwrangle, BlueCart). These cover Home Depot and Lowe's, which have no public API and prohibit scraping.

Product matching across retailers should key on UPC, then brand + model number.

## Roadmap

- [x] Categories, spec filters, sorting, search
- [x] Price comparison table with unit prices, in-store vs online
- [x] ZIP-based local pricing
- [ ] Real data providers + scheduled refresh
- [ ] Price history chart and price-drop alerts (accounts)
- [ ] Project lists: cheapest way to buy a whole materials list, split across stores or at one store
- [ ] Browser extension ("$4 cheaper at Lowe's")
- [ ] Affiliate links
