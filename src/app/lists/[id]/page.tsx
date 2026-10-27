import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ListView } from "@/components/ListView";
import { PageSkeleton } from "@/components/Skeletons";
import { getCurrentListId, getPricedList } from "@/lib/lists";
import { getZip } from "@/lib/zip";

export default function SharedListPage(props: PageProps<"/lists/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <SharedList {...props} />
    </Suspense>
  );
}

async function SharedList({ params }: PageProps<"/lists/[id]">) {
  const { id } = await params;
  const [mine, zip] = await Promise.all([getCurrentListId(), getZip()]);
  const list = await getPricedList(id, zip);
  if (!list) notFound();
  return <ListView list={list} isMine={mine === id} hasZip={!!zip} />;
}
