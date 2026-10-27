import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/ProductCard";
import { CardListSkeleton } from "@/components/Skeletons";
import { getCategoryTree, getTopSavings } from "@/lib/catalog";
import { getZip } from "@/lib/zip";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#6d28d9] px-6 py-10 text-white sm:px-10 sm:py-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent-bright">Price check before you haul</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
          The best price on building materials, across every store.
        </h1>
        <p className="mt-4 max-w-xl text-white/80">
          Compare Home Depot, Lowe&apos;s, Menards, Ace, Harbor Freight and Amazon side by side, with real unit
          prices per foot, per sheet and per piece.
        </p>
        <Form action="/search" className="mt-8 flex max-w-xl gap-2">
          <label htmlFor="hero-search" className="sr-only">
            Search materials
          </label>
          <input
            id="hero-search"
            name="q"
            type="search"
            placeholder="Try “12/2 Romex” or “pressure treated 2x6”"
            className="min-w-0 flex-1 rounded-lg bg-white px-4 py-3 text-ink outline-none"
          />
          <button type="submit" className="rounded-lg bg-accent-bright px-5 font-semibold text-ink hover:bg-white">
            Compare
          </button>
        </Form>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Shop by category</h2>
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-line" />}>
          <CategoryGrid />
        </Suspense>
      </section>

      <section>
        <Suspense
          fallback={
            <>
              <h2 className="mb-4 text-xl font-semibold">Biggest price gaps right now</h2>
              <CardListSkeleton count={4} />
            </>
          }
        >
          <TopSavings />
        </Suspense>
      </section>
    </div>
  );
}

async function CategoryGrid() {
  const categories = await getCategoryTree();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((c) => (
        <div key={c.id} className="rounded-xl border border-line bg-surface p-5">
          <Link href={`/c/${c.slug}`} className="flex items-center gap-2 text-lg font-semibold hover:underline">
            <span aria-hidden className="text-2xl">
              {c.icon}
            </span>
            {c.name}
          </Link>
          <ul className="mt-3 space-y-1 text-sm">
            {c.children.map((sub) => (
              <li key={sub.id}>
                <Link href={`/c/${sub.slug}`} className="flex justify-between text-muted hover:text-ink">
                  {sub.name}
                  <span className="tabular text-xs">{sub._count.products}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

async function TopSavings() {
  const zip = await getZip();
  const products = await getTopSavings(zip, 6);
  return (
    <>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">Biggest price gaps {zip ? `near ${zip}` : "right now"}</h2>
        <p className="text-sm text-muted">Same item, very different prices depending on where you buy it.</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </>
  );
}
