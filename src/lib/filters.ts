import type { AttributeDef, LoadedProduct, PricedProduct } from "@/lib/catalog";
import { priceProduct } from "@/lib/catalog";
import { SORTS, type SortKey } from "@/lib/sorts";

export { SORTS, type SortKey };

// URL search params drive all filtering so results are shareable/bookmarkable:
//   /c/wire?gauge=12+AWG&gauge=14+AWG&wireType=NM-B+(Romex)&sort=unit
// Attribute keys are used directly; these names are reserved:
export const RESERVED = ["brand", "retailer", "instock", "min", "max", "sort", "q"] as const;

export type SearchParams = Record<string, string | string[] | undefined>;

export interface Filters {
  attrs: Record<string, string[]>;
  brands: string[];
  retailers: string[];
  inStock: boolean;
  min: number | null;
  max: number | null;
  sort: SortKey;
}

const list = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);
const num = (v: string | string[] | undefined) => {
  const n = Number(list(v)[0]);
  return list(v)[0] && Number.isFinite(n) ? n : null;
};

export function parseFilters(sp: SearchParams, attributes: AttributeDef[]): Filters {
  const attrs: Record<string, string[]> = {};
  for (const a of attributes) {
    const values = list(sp[a.key]);
    if (values.length) attrs[a.key] = values;
  }
  const sort = list(sp.sort)[0];
  return {
    attrs,
    brands: list(sp.brand),
    retailers: list(sp.retailer),
    inStock: list(sp.instock)[0] === "1",
    min: num(sp.min),
    max: num(sp.max),
    sort: sort && sort in SORTS ? (sort as SortKey) : "price",
  };
}

export function activeFilterCount(f: Filters) {
  return (
    Object.values(f.attrs).reduce((n, v) => n + v.length, 0) +
    f.brands.length +
    f.retailers.length +
    (f.inStock ? 1 : 0) +
    (f.min !== null ? 1 : 0) +
    (f.max !== null ? 1 : 0)
  );
}

/** The value a product contributes to a facet, as it appears in the URL. */
export function facetValue(p: LoadedProduct, attr: Pick<AttributeDef, "key" | "type">): string | null {
  const v = p.specs[attr.key];
  if (v === undefined || v === null) return null;
  if (attr.type === "BOOLEAN") return v ? "Yes" : "No";
  return String(v);
}

type FacetKey = string; // attribute key, "brand" or "retailer"

function matches(p: PricedProduct, f: Filters, attributes: AttributeDef[], skip?: FacetKey) {
  for (const a of attributes) {
    if (a.key === skip) continue;
    const selected = f.attrs[a.key];
    if (selected?.length && !selected.includes(facetValue(p, a) ?? "")) return false;
  }
  if (skip !== "brand" && f.brands.length && !f.brands.includes(p.brand)) return false;
  if (skip !== "retailer" && f.retailers.length && !p.prices.retailers.length) return false;
  if (f.inStock && !p.prices.inStockCount) return false;
  const price = p.prices.bestTotal ?? p.prices.retailers[0]?.best?.total ?? null;
  if (f.min !== null && (price === null || price < f.min)) return false;
  if (f.max !== null && (price === null || price > f.max)) return false;
  return true;
}

function sortProducts(products: PricedProduct[], sort: SortKey) {
  const price = (p: PricedProduct) => p.prices.bestTotal ?? p.prices.retailers[0]?.best?.total ?? Infinity;
  const sorted = [...products];
  switch (sort) {
    case "price":
      return sorted.sort((a, b) => price(a) - price(b));
    case "price-desc":
      return sorted.sort((a, b) => price(b) - price(a));
    case "unit":
      return sorted.sort((a, b) => (a.unitPrice ?? Infinity) - (b.unitPrice ?? Infinity));
    case "savings":
      return sorted.sort((a, b) => b.prices.savings - a.prices.savings);
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
  selected: boolean;
}

export interface Facet {
  key: FacetKey;
  label: string;
  options: FacetOption[];
}

/**
 * Apply filters and build facets. Facet counts are "disjunctive": each facet's
 * counts ignore its own selection, so picking 12 AWG still shows how many 14 AWG
 * items there are.
 */
export function applyFilters(products: LoadedProduct[], f: Filters, attributes: AttributeDef[]) {
  const priced = products.map((p) => priceProduct(p, f.retailers));
  const results = sortProducts(
    priced.filter((p) => matches(p, f, attributes)),
    f.sort,
  );

  const facets: Facet[] = [];

  for (const a of attributes) {
    const pool = priced.filter((p) => matches(p, f, attributes, a.key));
    const counts = new Map<string, number>();
    for (const p of pool) {
      const v = facetValue(p, a);
      if (v !== null) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    // Include selected values even if nothing matches, so they can be unchecked
    for (const v of f.attrs[a.key] ?? []) if (!counts.has(v)) counts.set(v, 0);

    const values = [...counts.keys()];
    if (a.type === "ENUM") {
      values.sort((x, y) => rank(a.options, x) - rank(a.options, y));
    } else if (a.type === "NUMBER") {
      values.sort((x, y) => Number(x) - Number(y));
    } else {
      values.sort((x, y) => (x === y ? 0 : x === "Yes" ? -1 : 1));
    }

    facets.push({
      key: a.key,
      label: a.unit && a.type === "NUMBER" ? `${a.label} (${a.unit})` : a.label,
      options: values.map((v) => ({
        value: v,
        label: a.type === "NUMBER" && a.unit ? `${v} ${a.unit}` : v,
        count: counts.get(v) ?? 0,
        selected: (f.attrs[a.key] ?? []).includes(v),
      })),
    });
  }

  // Brand facet
  {
    const pool = priced.filter((p) => matches(p, f, attributes, "brand"));
    const counts = countBy(pool.map((p) => p.brand));
    for (const b of f.brands) if (!counts.has(b)) counts.set(b, 0);
    facets.push({
      key: "brand",
      label: "Brand",
      options: [...counts.keys()].sort().map((b) => ({
        value: b,
        label: b,
        count: counts.get(b)!,
        selected: f.brands.includes(b),
      })),
    });
  }

  // Retailer facet: count against the full listing set, not the retailer-restricted prices
  {
    const unrestricted = products.map((p) => priceProduct(p));
    const pool = unrestricted.filter((p) => matches(p, f, attributes, "retailer"));
    const counts = new Map<string, { name: string; count: number }>();
    for (const p of pool) {
      for (const r of p.prices.retailers) {
        const entry = counts.get(r.retailer.slug) ?? { name: r.retailer.name, count: 0 };
        entry.count++;
        counts.set(r.retailer.slug, entry);
      }
    }
    facets.push({
      key: "retailer",
      label: "Retailer",
      options: [...counts.entries()]
        .sort((a, b) => a[1].name.localeCompare(b[1].name))
        .map(([slug, { name, count }]) => ({
          value: slug,
          label: name,
          count,
          selected: f.retailers.includes(slug),
        })),
    });
  }

  return {
    results,
    // Hide facets that can't narrow anything
    facets: facets.filter((x) => x.options.length > 1 || x.options.some((o) => o.selected)),
  };
}

function rank(options: string[], value: string) {
  const i = options.indexOf(value);
  return i === -1 ? options.length : i;
}

function countBy(values: string[]) {
  const m = new Map<string, number>();
  for (const v of values) m.set(v, (m.get(v) ?? 0) + 1);
  return m;
}
