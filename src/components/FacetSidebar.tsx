import Form from "next/form";
import Link from "next/link";
import type { Facet, Filters, SearchParams } from "@/lib/filters";
import { hiddenInputs, keepParams, setParam, toggleParam } from "@/lib/url";

// Filters are plain links that toggle URL params, so they work without JS and
// every filtered view has a shareable URL.

export function FacetSidebar({
  path,
  searchParams,
  facets,
  filters,
  activeCount,
}: {
  path: string;
  searchParams: SearchParams;
  facets: Facet[];
  filters: Filters;
  activeCount: number;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {activeCount > 0 && (
          <Link href={keepParams(path, searchParams, ["sort"])} scroll={false} className="text-sm text-muted underline hover:text-ink">
            Clear all ({activeCount})
          </Link>
        )}
      </div>

      <Link
        href={setParam(path, searchParams, "instock", filters.inStock ? null : "1")}
        scroll={false}
        className="flex items-center gap-2 text-sm"
        aria-pressed={filters.inStock}
      >
        <Check checked={filters.inStock} />
        In stock near me
      </Link>

      {facets.map((facet) => (
        <div key={facet.key} className="border-t border-line pt-4">
          <h3 className="mb-2 text-sm font-semibold">{facet.label}</h3>
          <ul className="space-y-1">
            {facet.options.map((o) => (
              <li key={o.value}>
                <Link
                  href={toggleParam(path, searchParams, facet.key, o.value)}
                  scroll={false}
                  aria-pressed={o.selected}
                  className={`flex items-center gap-2 rounded px-1 py-0.5 text-sm hover:bg-paper ${o.count === 0 && !o.selected ? "pointer-events-none opacity-40" : ""}`}
                >
                  <Check checked={o.selected} />
                  <span className="flex-1">{o.label}</span>
                  <span className="tabular text-xs text-muted">{o.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <div className="border-t border-line pt-4">
        <h3 className="mb-2 text-sm font-semibold">Price</h3>
        <Form action={path} scroll={false} className="flex items-center gap-2">
          {hiddenInputs(searchParams, ["min", "max"]).map(([k, v], i) => (
            <input key={`${k}-${i}`} type="hidden" name={k} value={v} />
          ))}
          <PriceInput name="min" placeholder="Min" defaultValue={filters.min} />
          <span className="text-muted">–</span>
          <PriceInput name="max" placeholder="Max" defaultValue={filters.max} />
          <button type="submit" className="rounded-md border border-line px-2 py-1.5 text-sm hover:border-accent">
            Go
          </button>
        </Form>
      </div>
    </div>
  );
}

function PriceInput({ name, placeholder, defaultValue }: { name: string; placeholder: string; defaultValue: number | null }) {
  return (
    <input
      name={name}
      type="number"
      min={0}
      step="any"
      inputMode="decimal"
      placeholder={placeholder}
      defaultValue={defaultValue ?? ""}
      aria-label={`${placeholder} price`}
      className="tabular w-full min-w-0 rounded-md border border-line px-2 py-1.5 text-sm outline-none focus:border-accent"
    />
  );
}

function Check({ checked }: { checked: boolean }) {
  return (
    <span
      className={`flex size-4 shrink-0 items-center justify-center rounded border ${checked ? "border-accent bg-accent text-white" : "border-ink/30 bg-surface"}`}
      aria-hidden
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="m2.5 6.5 2.3 2.3L9.5 3.5" />
        </svg>
      )}
    </span>
  );
}
