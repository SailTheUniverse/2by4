import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToListForm } from "@/components/AddToListForm";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { PriceTable } from "@/components/PriceTable";
import { ProductCard, ProductThumb } from "@/components/ProductCard";
import { RetailerBadge } from "@/components/RetailerBadge";
import { PageSkeleton } from "@/components/Skeletons";
import { getAlternatives, getPriceHistory, getProduct } from "@/lib/catalog";
import { formatPrice, formatSpec, formatUnitPrice } from "@/lib/format";
import { specHighlights } from "@/lib/specs";
import { getZip } from "@/lib/zip";

export default function ProductPage(props: PageProps<"/p/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProductView {...props} />
    </Suspense>
  );
}

async function ProductView({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const zip = await getZip();
  const result = await getProduct(slug, zip);
  if (!result) notFound();
  const { product, category } = result;
  const { prices } = product;
  const [alternatives, history] = await Promise.all([
    getAlternatives(product, category.attributes, zip),
    getPriceHistory(product.id, zip),
  ]);

  const vsTypical = prices.bestTotal !== null ? product.typicalPrice - prices.bestTotal : 0;
  // Lowest price any retailer offered this shopper in the history window
  const historyLow = Math.min(...history.flatMap((s) => s.points.map((p) => p.price)));
  const atHistoryLow = prices.bestTotal !== null && Number.isFinite(historyLow) && prices.bestTotal <= historyLow;

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        {category.parent && (
          <>
            {" / "}
            <Link href={`/c/${category.parent.slug}`} className="hover:text-ink">
              {category.parent.name}
            </Link>
          </>
        )}
        {" / "}
        <Link href={`/c/${category.slug}`} className="hover:text-ink">
          {category.name}
        </Link>
      </nav>

      <div className="flex flex-col gap-6 md:flex-row">
        <ProductThumb product={product} size="lg" />
        <div className="flex-1">
          <p className="text-sm font-medium uppercase tracking-wide text-muted">{product.brand}</p>
          <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{product.name}</h1>
          {product.model && <p className="mt-1 text-sm text-muted">Model {product.model}</p>}
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {specHighlights(product, category.attributes, 6).map((h) => (
              <li key={h} className="rounded bg-surface px-2 py-1 text-xs text-muted ring-1 ring-line">
                {h}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-surface p-5 md:w-72">
          {prices.best ? (
            <>
              <p className="text-sm text-muted">Best price{zip ? ` near ${zip}` : ""}</p>
              <p className="tabular mt-1 text-4xl font-bold">{formatPrice(prices.bestTotal)}</p>
              {atHistoryLow && (
                <p className="mt-1 inline-block rounded bg-save-soft px-1.5 py-0.5 text-xs font-semibold text-save">
                  Lowest price in 90 days
                </p>
              )}
              {product.unitQty !== 1 && (
                <p className="tabular text-sm text-muted">{formatUnitPrice(product.unitPrice, product.unitLabel)}</p>
              )}
              <p className="mt-2 text-sm">
                at <RetailerBadge name={prices.best.retailer.name} color={prices.best.retailer.color} className="font-medium" />
                {prices.best.best?.channel === "online" ? " online" : prices.best.best?.store ? ` – ${prices.best.best.store.city}` : ""}
              </p>
              <dl className="mt-4 space-y-1 border-t border-line pt-3 text-sm">
                {prices.savings > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-muted">vs. priciest store</dt>
                    <dd className="tabular font-medium text-save">Save {formatPrice(prices.savings)}</dd>
                  </div>
                )}
                {Number.isFinite(historyLow) && !atHistoryLow && (
                  <div className="flex justify-between">
                    <dt className="text-muted">90-day low</dt>
                    <dd className="tabular">{formatPrice(historyLow)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted">Typical price</dt>
                  <dd className={`tabular ${vsTypical > 0 ? "text-save" : ""}`}>{formatPrice(product.typicalPrice)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">In stock at</dt>
                  <dd className="tabular">
                    {prices.inStockCount} of {prices.retailers.length} retailers
                  </dd>
                </div>
              </dl>
              <a
                href={prices.best.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-4 block rounded-lg bg-accent px-4 py-2.5 text-center font-semibold text-ink hover:brightness-95"
              >
                Go to {prices.best.retailer.name} ↗
              </a>
              <div className="mt-3">
                <AddToListForm
                  productId={product.id}
                  unitHint={product.unitQty !== 1 ? `${product.unitQty} ${product.unitLabel}` : undefined}
                />
              </div>
            </>
          ) : (
            <p className="text-muted">Not in stock at any retailer near you right now.</p>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Compare prices</h2>
        <PriceTable product={product} hasZip={!!zip} />
      </section>

      {history.length > 0 && (
        <section>
          <h2 className="mb-1 text-xl font-semibold">Price history</h2>
          <p className="mb-3 text-sm text-muted">
            Each retailer&apos;s best price for you per day: nearest-store price or online price with shipping.
          </p>
          <div className="rounded-xl border border-line bg-surface p-4">
            <PriceHistoryChart series={history} />
          </div>
        </section>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <section>
          <h2 className="mb-3 text-xl font-semibold">Specifications</h2>
          <dl className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface text-sm">
            <SpecRow label="Brand" value={product.brand} />
            {product.model && <SpecRow label="Model" value={product.model} />}
            {category.attributes.map((a) => (
              <SpecRow key={a.key} label={a.label} value={formatSpec(product.specs[a.key], a.unit)} />
            ))}
            <SpecRow label="Package" value={product.unitQty === 1 ? product.unitLabel : `${product.unitQty} ${product.unitLabel}`} />
          </dl>
        </section>

        {alternatives.length > 0 && (
          <section>
            <h2 className="mb-1 text-xl font-semibold">Similar items</h2>
            <p className="mb-3 text-sm text-muted">
              Same {category.attributes.slice(0, 2).map((a) => a.label.toLowerCase()).join(" and ")}, cheapest per{" "}
              {product.unitLabel} first.
            </p>
            <div className="space-y-3">
              {alternatives.map((p) => (
                <ProductCard key={p.id} product={p} highlights={specHighlights(p, category.attributes)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}
