import Form from "next/form";
import Link from "next/link";
import { Suspense } from "react";
import { getCategoryTree } from "@/lib/catalog";
import { ZipControl } from "@/components/ZipControl";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:gap-6 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="2by4 home">
          <Logo />
          <span className="text-xl font-bold tracking-tight">2by4</span>
        </Link>

        <Form action="/search" className="order-last w-full sm:order-none sm:flex-1">
          <label className="sr-only" htmlFor="site-search">
            Search materials
          </label>
          <div className="flex rounded-lg border border-line bg-paper focus-within:border-ink">
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search 12/2 Romex, 2x4x8, SharkBite elbow…"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button type="submit" className="rounded-r-lg bg-ink px-4 text-sm font-medium text-white hover:bg-ink/85">
              Search
            </button>
          </div>
        </Form>

        <div className="ml-auto sm:ml-0">
          <Suspense fallback={<div className="h-9 w-36 animate-pulse rounded-lg bg-paper" />}>
            <ZipControl />
          </Suspense>
        </div>
      </div>

      <Suspense fallback={<div className="h-10" />}>
        <CategoryNav />
      </Suspense>
    </header>
  );
}

async function CategoryNav() {
  const categories = await getCategoryTree();
  return (
    <nav className="border-t border-line" aria-label="Categories">
      <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-2 text-sm sm:px-4">
        {categories.map((c) => (
          <li key={c.id} className="shrink-0">
            <Link href={`/c/${c.slug}`} className="block rounded-md px-3 py-2 text-muted hover:bg-paper hover:text-ink">
              <span aria-hidden>{c.icon}</span> {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Logo() {
  // A 2x4 end-grain block
  return (
    <svg width="30" height="22" viewBox="0 0 30 22" aria-hidden>
      <rect x="1" y="1" width="28" height="20" rx="3" fill="#f2b705" stroke="#1c1917" strokeWidth="2" />
      <path d="M6 11c4-6 14-6 18 0M9 11c3-3 9-3 12 0" fill="none" stroke="#1c1917" strokeWidth="1.5" opacity=".55" />
    </svg>
  );
}
