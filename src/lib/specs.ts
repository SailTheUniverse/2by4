import type { AttributeDef, LoadedProduct } from "@/lib/catalog";
import { formatSpec } from "@/lib/format";

/** Short spec chips for product cards, e.g. ["12 AWG", "2 w/ ground", "250 ft"]. */
export function specHighlights(product: LoadedProduct, attributes: AttributeDef[], max = 4) {
  const out: string[] = [];
  for (const a of attributes) {
    const v = product.specs[a.key];
    if (v === undefined) continue;
    if (a.type === "BOOLEAN") {
      if (v) out.push(a.label);
    } else {
      out.push(formatSpec(v, a.unit === "AWG" ? null : a.unit));
    }
    if (out.length >= max) break;
  }
  return out;
}
