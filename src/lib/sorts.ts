// Kept separate from filters.ts so client components can import it without
// pulling in server-only catalog code.
export const SORTS = {
  price: "Price: low to high",
  "price-desc": "Price: high to low",
  unit: "Unit price",
  savings: "Biggest savings",
  name: "Name",
} as const;
export type SortKey = keyof typeof SORTS;
