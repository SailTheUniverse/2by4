import { Suspense } from "react";
import { EmptyList, ListView } from "@/components/ListView";
import { PageSkeleton } from "@/components/Skeletons";
import { getCurrentListId, getPricedList } from "@/lib/lists";
import { getZip } from "@/lib/zip";

export default function MyListPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <MyList />
    </Suspense>
  );
}

async function MyList() {
  const [id, zip] = await Promise.all([getCurrentListId(), getZip()]);
  const list = id ? await getPricedList(id, zip) : null;
  if (!list) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Project list</h1>
        <p className="max-w-2xl text-muted">
          Put together everything a job needs and we&apos;ll find the cheapest way to buy it: one store, two stores, or
          whatever combination of pickup and online orders costs least.
        </p>
        <EmptyList />
      </div>
    );
  }
  return <ListView list={list} isMine hasZip={!!zip} />;
}
