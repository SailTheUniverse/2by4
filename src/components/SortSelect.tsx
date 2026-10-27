"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { SORTS, type SortKey } from "@/lib/sorts";

/** Sort dropdown; `hrefs` is precomputed on the server for each sort option. */
export function SortSelect({ value, hrefs }: { value: SortKey; hrefs: Record<SortKey, string> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Sort</span>
      <select
        value={value}
        disabled={pending}
        onChange={(e) => startTransition(() => router.push(hrefs[e.target.value as SortKey], { scroll: false }))}
        className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm outline-none focus:border-accent"
      >
        {Object.entries(SORTS).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
