const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatPrice(n: number | null | undefined) {
  return n === null || n === undefined ? "—" : usd.format(n);
}

/** Unit prices can be fractions of a cent per foot, so show more precision when small. */
export function formatUnitPrice(n: number | null | undefined, unitLabel: string) {
  if (n === null || n === undefined) return null;
  const digits = n < 1 ? 3 : 2;
  const s = n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${s}/${unitLabel}`;
}

export function formatSpec(value: unknown, unit?: string | null) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (value === null || value === undefined || value === "") return "—";
  return unit ? `${value} ${unit}` : String(value);
}

export function timeAgo(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return `${Math.round(hours / 24)} days ago`;
}
