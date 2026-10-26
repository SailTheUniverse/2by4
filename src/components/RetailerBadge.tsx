export function RetailerBadge({ name, color, className = "" }: { name: string; color: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${className}`}>
      <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      {name}
    </span>
  );
}
