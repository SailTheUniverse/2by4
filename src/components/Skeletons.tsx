export function CardListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-busy>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex gap-4 rounded-xl border border-line bg-surface p-4">
          <div className="size-16 animate-pulse rounded-lg bg-paper" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-paper" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-paper" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded bg-paper" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="h-4 w-48 animate-pulse rounded bg-line" />
      <div className="h-8 w-72 animate-pulse rounded bg-line" />
      <CardListSkeleton />
    </div>
  );
}
