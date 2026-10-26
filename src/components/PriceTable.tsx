import type { PricedProduct } from "@/lib/catalog";
import { formatPrice, formatUnitPrice, timeAgo } from "@/lib/format";
import type { Option } from "@/lib/pricing";
import { RetailerBadge } from "@/components/RetailerBadge";

export function PriceTable({ product, hasZip }: { product: PricedProduct; hasZip: boolean }) {
  const { prices } = product;
  const showUnit = product.unitQty !== 1;

  if (!prices.retailers.length) {
    return <p className="rounded-xl border border-line bg-surface p-6 text-muted">No prices found for this item yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {/* Desktop table */}
      <table className="hidden w-full text-sm md:table">
        <thead className="bg-paper text-left text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Retailer</th>
            <th className="px-4 py-3 font-medium">{hasZip ? "Nearest store" : "In store"}</th>
            <th className="px-4 py-3 font-medium">Online</th>
            <th className="px-4 py-3 text-right font-medium">Your best price</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {prices.retailers.map((r, i) => {
            const isBest = i === 0 && r.best?.inStock;
            return (
              <tr key={r.retailer.id} className={`border-t border-line ${isBest ? "bg-save-soft/60" : ""}`}>
                <td className="px-4 py-3 font-medium">
                  <RetailerBadge name={r.retailer.name} color={r.retailer.color} />
                  {isBest && <span className="ml-2 rounded bg-save px-1.5 py-0.5 text-xs font-semibold text-white">Best price</span>}
                </td>
                <td className="px-4 py-3">
                  <OptionCell option={r.store} empty={hasZip ? "No store nearby" : "Set ZIP to see"} />
                </td>
                <td className="px-4 py-3">
                  <OptionCell option={r.online} empty={product.shippable ? "Not sold online" : "In-store only"} />
                </td>
                <td className="px-4 py-3 text-right">
                  <p className="tabular text-base font-semibold">{formatPrice(r.best?.total)}</p>
                  {showUnit && r.best && (
                    <p className="tabular text-xs text-muted">{formatUnitPrice(r.best.total / product.unitQty, product.unitLabel)}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-block rounded-lg border border-line px-3 py-1.5 font-medium whitespace-nowrap hover:border-ink"
                  >
                    View ↗
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile cards */}
      <ul className="divide-y divide-line md:hidden">
        {prices.retailers.map((r, i) => {
          const isBest = i === 0 && r.best?.inStock;
          return (
            <li key={r.retailer.id} className={`space-y-2 p-4 ${isBest ? "bg-save-soft/60" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  <RetailerBadge name={r.retailer.name} color={r.retailer.color} />
                  {isBest && <span className="ml-2 rounded bg-save px-1.5 py-0.5 text-xs font-semibold text-white">Best</span>}
                </span>
                <span className="tabular text-lg font-semibold">{formatPrice(r.best?.total)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-muted">In store</p>
                  <OptionCell option={r.store} empty={hasZip ? "No store nearby" : "Set ZIP"} />
                </div>
                <div>
                  <p className="text-xs text-muted">Online</p>
                  <OptionCell option={r.online} empty={product.shippable ? "Not online" : "In-store only"} />
                </div>
              </div>
              <a href={r.url} target="_blank" rel="noopener noreferrer nofollow" className="block text-sm font-medium underline">
                View at {r.retailer.name} ↗
              </a>
            </li>
          );
        })}
      </ul>

      <p className="border-t border-line bg-paper px-4 py-2 text-xs text-muted">
        Prices checked {timeAgo(newestCheck(product))}. Online totals include shipping; in-store is pickup price.
      </p>
    </div>
  );
}

function OptionCell({ option, empty }: { option: Option | null; empty: string }) {
  if (!option) return <span className="text-muted">{empty}</span>;
  return (
    <div>
      <span className="tabular font-medium">{formatPrice(option.price)}</span>
      {option.channel === "online" && (
        <span className="ml-1 text-xs text-muted">{option.shipping ? `+ ${formatPrice(option.shipping)} ship` : "free ship"}</span>
      )}
      <p className={`text-xs ${option.inStock ? "text-save" : "text-warn"}`}>
        {option.inStock ? "In stock" : "Out of stock"}
        {option.store && <span className="text-muted"> · {option.store.city}</span>}
      </p>
    </div>
  );
}

function newestCheck(product: PricedProduct) {
  let newest = new Date(0);
  for (const r of product.prices.retailers) {
    for (const o of [r.store, r.online]) if (o && o.checkedAt > newest) newest = o.checkedAt;
  }
  return newest;
}
