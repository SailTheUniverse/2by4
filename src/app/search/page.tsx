import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { PageSkeleton } from "@/components/Skeletons";
import { searchProducts } from "@/lib/catalog";
import { getZip } from "@/lib/zip";

export default function SearchPage(props: PageProps<"/search">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SearchResults {...props} />
    </Suspense>
  );
}

async function SearchResults({ searchParams }: PageProps<"/search">) {
  const raw = (await searchParams).q;
  const q = (Array.isArray(raw) ? raw[0] : raw)?.trim() ?? "";
  const zip = await getZip();
  const results = q ? await searchProducts(q, zip) : [];
  results.sort((a, b) => (a.prices.bestTotal ?? Infinity) - (b.prices.bestTotal ?? Infinity));

  // Group counts by category so shoppers can jump to a filterable view
  const categories = new Map<string, { name: string; count: number }>();
  for (const p of results) {
    const c = categories.get(p.category.slug) ?? { name: p.category.name, count: 0 };
    c.count++;
    categories.set(p.category.slug, c);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        {q ? (
          <>
            {results.length} {results.length === 1 ? "result" : "results"} for “{q}”
          </>
        ) : (
          "Search"
        )}
      </h1>

      {categories.size > 1 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Narrow to a category to filter by specs:</span>
          {[...categories.entries()].map(([slug, c]) => (
            <Link key={slug} href={`/c/${slug}`} className="rounded-full border border-line bg-surface px-3 py-1 hover:border-accent">
              {c.name} <span className="text-muted">{c.count}</span>
            </Link>
          ))}
        </div>
      )}

      {results.length ? (
        <div className="space-y-3">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        q && (
          <p className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
            No matches. Try fewer words, like “romex” or “2x4”.
          </p>
        )
      )}
    </div>
  );
}
