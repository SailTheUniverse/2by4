import Link from "next/link";
import { copyList, loadTemplate, removeItem, renameList, startNewList, updateQuantity } from "@/app/actions";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { RetailerBadge } from "@/components/RetailerBadge";
import { formatPrice } from "@/lib/format";
import type { PricedList } from "@/lib/lists";
import type { Plan } from "@/lib/optimizer";
import { TEMPLATES } from "@/lib/templates";

export function ListView({ list, isMine, hasZip }: { list: PricedList; isMine: boolean; hasZip: boolean }) {
  const { lines, plans } = list;
  const names = new Map(lines.map((l) => [l.itemId, l.product.name]));

  return (
    <div className="space-y-8">
      {!isMine && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent-ink">
          <p>You&apos;re viewing a shared list. Changes you make here change it for everyone with the link.</p>
          <form action={copyList}>
            <input type="hidden" name="listId" value={list.id} />
            <button type="submit" className="rounded-lg bg-accent px-3 py-1.5 font-medium text-white hover:bg-accent-hover">
              Copy to my list
            </button>
          </form>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Project list</p>
          <form action={renameList} className="group flex items-center gap-2">
            <input type="hidden" name="listId" value={list.id} />
            <label htmlFor="list-name" className="sr-only">
              List name
            </label>
            <input
              id="list-name"
              name="name"
              defaultValue={list.name}
              maxLength={80}
              className="-ml-1 rounded-md border border-transparent bg-transparent px-1 text-2xl font-bold tracking-tight outline-none hover:border-line focus:border-accent sm:text-3xl"
            />
            <button type="submit" className="hidden text-sm text-muted underline group-focus-within:inline">
              Save
            </button>
          </form>
        </div>
        <div className="flex gap-2">
          <CopyLinkButton path={`/lists/${list.id}`} />
          {isMine && (
            <form action={startNewList}>
              <button type="submit" className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium hover:border-accent">
                New list
              </button>
            </form>
          )}
        </div>
      </div>

      {lines.length === 0 ? (
        <EmptyList />
      ) : (
        <>
          {!hasZip && (
            <p className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted">
              Showing online prices only. Set your ZIP (top right) to include pickup at stores near you, which is usually
              cheaper for bulky materials.
            </p>
          )}

          <section>
            <h2 className="mb-3 text-xl font-semibold">Best ways to buy it</h2>
            <div className="grid gap-4 lg:grid-cols-3">
              <PlanCard title="Cheapest overall" plan={plans.cheapest} baseline={plans.oneStop} names={names} list={list} />
              <PlanCard title="Up to 2 stops" plan={plans.twoStops} baseline={plans.oneStop} names={names} list={list} />
              <PlanCard title="One stop" plan={plans.oneStop} baseline={null} names={names} list={list} />
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">Items ({lines.length})</h2>
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              <ul className="divide-y divide-line">
                {lines.map((l) => {
                  const best = l.product.prices.bestTotal;
                  return (
                    <li key={l.itemId} className="flex flex-wrap items-center gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <Link href={`/p/${l.product.slug}`} className="font-medium hover:underline">
                          {l.product.name}
                        </Link>
                        <p className="text-xs text-muted">
                          {best !== null ? `Best ${formatPrice(best)} each` : "Not in stock nearby"}
                          {l.product.prices.best && ` at ${l.product.prices.best.retailer.name}`}
                        </p>
                      </div>
                      <form action={updateQuantity} className="flex items-center gap-1">
                        <input type="hidden" name="itemId" value={l.itemId} />
                        <label className="sr-only" htmlFor={`q-${l.itemId}`}>
                          Quantity
                        </label>
                        <input
                          id={`q-${l.itemId}`}
                          name="quantity"
                          type="number"
                          min={1}
                          max={9999}
                          defaultValue={l.quantity}
                          className="tabular w-20 rounded-md border border-line px-2 py-1.5 text-sm outline-none focus:border-accent"
                        />
                        <button type="submit" className="rounded-md border border-line px-2 py-1.5 text-sm hover:border-accent">
                          Update
                        </button>
                      </form>
                      <p className="tabular w-24 text-right font-medium">
                        {best !== null ? formatPrice(best * l.quantity) : "—"}
                      </p>
                      <form action={removeItem}>
                        <input type="hidden" name="itemId" value={l.itemId} />
                        <button type="submit" className="text-sm text-muted underline hover:text-ink" aria-label={`Remove ${l.product.name}`}>
                          Remove
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>

          <StoreComparison list={list} />
        </>
      )}
    </div>
  );
}

function PlanCard({
  title,
  plan,
  baseline,
  names,
  list,
}: {
  title: string;
  plan: Plan | null;
  baseline: Plan | null;
  names: Map<string, string>;
  list: PricedList;
}) {
  if (!plan || !plan.stops.length) {
    return (
      <div className="rounded-xl border border-line bg-surface p-5">
        <h3 className="font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted">No retailer near you has these items in stock.</p>
      </div>
    );
  }
  const saves = baseline && !baseline.missing.length && !plan.missing.length ? baseline.total - plan.total : 0;
  const highlight = title === "Cheapest overall";

  return (
    <div className={`rounded-xl border bg-surface p-5 ${highlight ? "border-save ring-1 ring-save" : "border-line"}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">{title}</h3>
        {saves >= 0.01 && (
          <span className="rounded bg-save-soft px-1.5 py-0.5 text-xs font-medium text-save">
            Saves {formatPrice(saves)} vs one stop
          </span>
        )}
      </div>
      <p className="tabular mt-2 text-3xl font-bold">{formatPrice(plan.total)}</p>
      <p className="text-sm text-muted">
        {plan.stops.length} {plan.stops.length === 1 ? "retailer" : "retailers"}
        {plan.shipping > 0 ? ` · includes ${formatPrice(plan.shipping)} shipping` : ""}
      </p>
      {plan.missing.length > 0 && (
        <p className="mt-2 text-sm text-warn">
          Missing {plan.missing.length}: {plan.missing.map((id) => names.get(id)).join(", ")}
        </p>
      )}

      <ul className="mt-4 space-y-3 border-t border-line pt-4">
        {plan.stops.map((stop) => {
          const retailer = list.retailers.get(stop.retailer)!;
          const channels = new Set(stop.lines.map((l) => l.channel));
          const how = channels.size > 1 ? "Pickup + online order" : channels.has("online") ? "Online order" : "Store pickup";
          return (
            <li key={stop.retailer}>
              <details>
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-2 text-sm">
                  <span>
                    <RetailerBadge name={retailer.name} color={retailer.color} className="font-medium" />
                    <span className="ml-1 text-xs text-muted">
                      {how} · {stop.lines.length} {stop.lines.length === 1 ? "item" : "items"}
                    </span>
                  </span>
                  <span className="tabular font-medium">{formatPrice(stop.subtotal + stop.shipping)}</span>
                </summary>
                <ul className="mt-2 space-y-1 pl-4 text-xs text-muted">
                  {stop.lines.map((l) => (
                    <li key={l.itemId} className="flex justify-between gap-2">
                      <span>
                        {l.quantity} × {names.get(l.itemId)}
                        {l.channel === "online" ? " (online)" : ""}
                      </span>
                      <span className="tabular shrink-0">{formatPrice(l.lineTotal)}</span>
                    </li>
                  ))}
                  {stop.shipping > 0 && (
                    <li className="flex justify-between">
                      <span>Shipping</span>
                      <span className="tabular">{formatPrice(stop.shipping)}</span>
                    </li>
                  )}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function StoreComparison({ list }: { list: PricedList }) {
  const rows = [...list.plans.byRetailer.entries()]
    .filter(([, plan]) => plan.stops.length > 0)
    .sort((a, b) => a[1].missing.length - b[1].missing.length || a[1].total - b[1].total);
  if (rows.length < 2) return null;

  return (
    <section>
      <h2 className="mb-3 text-xl font-semibold">Everything at one retailer</h2>
      <div className="overflow-hidden rounded-xl border border-line bg-surface">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([slug, plan]) => {
              const r = list.retailers.get(slug)!;
              return (
                <tr key={slug} className="border-t border-line first:border-t-0">
                  <td className="px-4 py-3 font-medium">
                    <RetailerBadge name={r.name} color={r.color} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {plan.missing.length ? `Missing ${plan.missing.length} of ${list.lines.length} items` : "Has everything"}
                  </td>
                  <td className="tabular px-4 py-3 text-right font-medium">
                    {formatPrice(plan.total)}
                    {plan.missing.length > 0 && <span className="text-xs font-normal text-muted"> (partial)</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function EmptyList() {
  return (
    <div className="space-y-4">
      <p className="text-muted">
        Your list is empty. Add items from any product page, or start from a sample project:
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <form key={t.key} action={loadTemplate} className="flex flex-col rounded-xl border border-line bg-surface p-4">
            <input type="hidden" name="template" value={t.key} />
            <h3 className="font-semibold">{t.name}</h3>
            <p className="mt-1 flex-1 text-sm text-muted">{t.description}</p>
            <button type="submit" className="mt-3 self-start rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white hover:bg-accent-hover">
              Load {t.items.length} items
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
