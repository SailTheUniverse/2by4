import Link from "next/link";
import type { PricedProduct } from "@/lib/catalog";
import { formatPrice, formatUnitPrice } from "@/lib/format";
import { RetailerBadge } from "@/components/RetailerBadge";

export function ProductThumb({ product, size = "md" }: { product: PricedProduct; size?: "md" | "lg" }) {
  const icon = product.category.icon ?? product.category.parent?.icon ?? "📦";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg bg-paper ${size === "lg" ? "size-40 text-6xl" : "size-16 text-3xl"}`}
      aria-hidden
    >
      {icon}
    </div>
  );
}

export function ProductCard({ product, highlights = [] }: { product: PricedProduct; highlights?: string[] }) {
  const { prices } = product;
  const best = prices.best;
  const unit = product.unitQty !== 1 ? formatUnitPrice(product.unitPrice, product.unitLabel) : null;
  const savingsPct = prices.highestPrice ? Math.round((prices.savings / prices.highestPrice) * 100) : 0;

  return (
    <Link
      href={`/p/${product.slug}`}
      className="group flex gap-4 rounded-xl border border-line bg-surface p-4 transition hover:border-accent/50 hover:shadow-sm"
    >
      <ProductThumb product={product} />
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">{product.brand}</p>
          <h3 className="font-medium leading-snug group-hover:underline">{product.name}</h3>
          {highlights.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {highlights.map((h) => (
                <li key={h} className="rounded bg-paper px-1.5 py-0.5 text-xs text-muted">
                  {h}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="shrink-0 sm:w-44 sm:text-right">
          {best ? (
            <>
              <p className="tabular text-xl font-semibold">{formatPrice(prices.bestTotal)}</p>
              {unit && <p className="tabular text-xs text-muted">{unit}</p>}
              <p className="mt-1 text-xs text-muted">
                at <RetailerBadge name={best.retailer.name} color={best.retailer.color} className="text-ink" />
                {best.best?.channel === "online" ? " (online)" : ""}
              </p>
              <p className="mt-1 text-xs text-muted">
                {prices.inStockCount} {prices.inStockCount === 1 ? "retailer" : "retailers"}
                {savingsPct >= 3 && (
                  <span className="ml-1.5 rounded bg-save-soft px-1.5 py-0.5 font-medium text-save">
                    Save {savingsPct}%
                  </span>
                )}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">Out of stock nearby</p>
          )}
        </div>
      </div>
    </Link>
  );
}
