import "server-only";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { loadProducts, priceProduct, type PricedProduct } from "@/lib/catalog";
import { optimize, type OptItem } from "@/lib/optimizer";

export const LIST_COOKIE = "list";

/** The shopper's current list id from their cookie (not validated). Call inside <Suspense>. */
export async function getCurrentListId() {
  return (await cookies()).get(LIST_COOKIE)?.value ?? null;
}

export async function getListSummary(id: string | null) {
  if (!id) return null;
  return db.projectList.findUnique({
    where: { id },
    select: { id: true, name: true, _count: { select: { items: true } } },
  });
}

export interface ListLine {
  itemId: string;
  quantity: number;
  product: PricedProduct;
}

/** A list with every item priced for the shopper's ZIP, plus the optimized buying plans. */
export async function getPricedList(id: string, zip: string | null) {
  const list = await db.projectList.findUnique({
    where: { id },
    include: { items: { orderBy: { createdAt: "asc" } } },
  });
  if (!list) return null;

  const products = await loadProducts({ id: { in: list.items.map((i) => i.productId) } }, zip);
  const byId = new Map(products.map((p) => [p.id, priceProduct(p)]));
  const lines: ListLine[] = list.items
    .filter((i) => byId.has(i.productId))
    .map((i) => ({ itemId: i.id, quantity: i.quantity, product: byId.get(i.productId)! }));

  const optItems: OptItem[] = lines.map((l) => ({
    id: l.itemId,
    quantity: l.quantity,
    options: l.product.prices.retailers.flatMap((r) =>
      [r.store, r.online]
        .filter((o) => o?.inStock)
        .map((o) => ({ retailer: r.retailer.slug, channel: o!.channel, unitPrice: o!.price, shipping: o!.shipping })),
    ),
  }));

  // Every retailer that shows up anywhere in the list, for names/colors in the UI
  const retailers = new Map(
    lines.flatMap((l) => l.product.prices.retailers.map((r) => [r.retailer.slug, r.retailer] as const)),
  );

  return { id: list.id, name: list.name, lines, plans: optimize(optItems), retailers };
}

export type PricedList = NonNullable<Awaited<ReturnType<typeof getPricedList>>>;
