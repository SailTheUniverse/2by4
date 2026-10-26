import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FacetSidebar } from "@/components/FacetSidebar";
import { ProductCard } from "@/components/ProductCard";
import { PageSkeleton } from "@/components/Skeletons";
import { SortSelect } from "@/components/SortSelect";
import { getCategory, loadProducts } from "@/lib/catalog";
import { activeFilterCount, applyFilters, parseFilters, SORTS, type SearchParams, type SortKey } from "@/lib/filters";
import { specHighlights } from "@/lib/specs";
import { setParam } from "@/lib/url";
import { getZip } from "@/lib/zip";

export default function CategoryPage(props: PageProps<"/c/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryView {...props} />
    </Suspense>
  );
}

async function CategoryView({ params, searchParams }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const sp = (await searchParams) as SearchParams;
  const [category, zip] = await Promise.all([getCategory(slug), getZip()]);
  if (!category) notFound();

  const path = `/c/${category.slug}`;
  const isLeaf = category.children.length === 0;
  // Parent categories list everything in their subcategories, filterable by brand/retailer/price
  const categoryIds = isLeaf ? [category.id] : category.children.map((c) => c.id);
  const attributes = isLeaf ? category.attributes : [];

  const products = await loadProducts({ categoryId: { in: categoryIds } }, zip);
  const filters = parseFilters(sp, attributes);
  const { results, facets } = applyFilters(products, filters, attributes);
  const activeCount = activeFilterCount(filters);

  const sortHrefs = Object.fromEntries(
    Object.keys(SORTS).map((k) => [k, setParam(path, sp, "sort", k === "price" ? null : k)]),
  ) as Record<SortKey, string>;

  const sidebar = (
    <FacetSidebar path={path} searchParams={sp} facets={facets} filters={filters} activeCount={activeCount} />
  );

  return (
    <div className="space-y-6">
      <div>
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
        </nav>
        <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
          {category.icon && <span aria-hidden>{category.icon} </span>}
          {category.name}
        </h1>
        {!zip && (
          <p className="mt-2 text-sm text-muted">
            Showing online prices. Set your ZIP code (top right) to include in-store prices at stores near you.
          </p>
        )}
      </div>

      {!isLeaf && (
        <ul className="flex flex-wrap gap-2">
          {category.children.map((c) => (
            <li key={c.id}>
              <Link
                href={`/c/${c.slug}`}
                className="block rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium hover:border-ink"
              >
                {c.name} <span className="tabular text-muted">{c._count.products}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <aside className="hidden lg:block">{sidebar}</aside>
        <details className="rounded-xl border border-line bg-surface p-4 lg:hidden">
          <summary className="cursor-pointer font-semibold">
            Filters{activeCount > 0 && ` (${activeCount})`}
          </summary>
          <div className="mt-4">{sidebar}</div>
        </details>

        <section>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted">
              <span className="tabular font-medium text-ink">{results.length}</span>{" "}
              {results.length === 1 ? "item" : "items"}
            </p>
            <SortSelect value={filters.sort} hrefs={sortHrefs} />
          </div>
          {results.length ? (
            <div className="space-y-3">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} highlights={specHighlights(p, attributes)} />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
              Nothing matches those filters.{" "}
              <Link href={path} className="underline">
                Clear filters
              </Link>
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
