// Finds the cheapest way to buy a whole materials list.
//
// Each item can be bought at any retailer that has it in stock, either at the
// shopper's nearest store or online. We try every combination of retailers
// (and, per retailer, whether to place an online order there), assign each item
// to its cheapest allowed option, and keep the best plan for "one stop",
// "up to two stops" and "any number of stops". With six retailers that's at
// most 3^6 = 729 combinations, so exhaustive search is exact and instant.
//
// Shipping model: an online order at a retailer pays one shipping fee: free if
// any item in it already ships free on its own (so the order clears the
// retailer's free-shipping threshold), otherwise the largest single-item fee.

export interface OptOption {
  retailer: string;
  channel: "store" | "online";
  unitPrice: number;
  /** Shipping fee if this item were ordered alone; 0 = ships free */
  shipping: number;
}

export interface OptItem {
  id: string;
  quantity: number;
  /** In-stock options only */
  options: OptOption[];
}

export interface PlanLine {
  itemId: string;
  channel: "store" | "online";
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface PlanStop {
  retailer: string;
  lines: PlanLine[];
  subtotal: number;
  shipping: number;
}

export interface Plan {
  total: number;
  shipping: number;
  stops: PlanStop[];
  /** Items that can't be bought with this plan's retailers */
  missing: string[];
}

export interface OptimizeResult {
  cheapest: Plan | null;
  twoStops: Plan | null;
  oneStop: Plan | null;
  /** Best plan using only each retailer, for the "everything at one store" comparison */
  byRetailer: Map<string, Plan>;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Complete plans beat incomplete ones; then cheaper wins; then fewer stops. */
function better(a: Plan, b: Plan | null) {
  if (!b) return true;
  if (a.missing.length !== b.missing.length) return a.missing.length < b.missing.length;
  if (a.total !== b.total) return a.total < b.total;
  return a.stops.length < b.stops.length;
}

function buildPlan(items: OptItem[], allowed: Set<string>, online: Set<string>): Plan {
  const stops = new Map<string, PlanStop>();
  const missing: string[] = [];

  for (const item of items) {
    let best: OptOption | null = null;
    for (const o of item.options) {
      if (!allowed.has(o.retailer)) continue;
      if (o.channel === "online" && !online.has(o.retailer)) continue;
      if (!best || o.unitPrice < best.unitPrice) best = o;
    }
    if (!best) {
      missing.push(item.id);
      continue;
    }
    const stop = stops.get(best.retailer) ?? { retailer: best.retailer, lines: [], subtotal: 0, shipping: 0 };
    const lineTotal = round(best.unitPrice * item.quantity);
    stop.lines.push({ itemId: item.id, channel: best.channel, unitPrice: best.unitPrice, quantity: item.quantity, lineTotal });
    stop.subtotal = round(stop.subtotal + lineTotal);
    stops.set(best.retailer, stop);
  }

  // One shipping fee per online order
  for (const stop of stops.values()) {
    const onlineLines = stop.lines.filter((l) => l.channel === "online");
    if (!onlineLines.length) continue;
    const fees = onlineLines.map((l) => {
      const item = items.find((i) => i.id === l.itemId)!;
      return item.options.find((o) => o.retailer === stop.retailer && o.channel === "online")!.shipping;
    });
    stop.shipping = fees.some((f) => f === 0) ? 0 : Math.max(...fees);
  }

  const list = [...stops.values()].sort((a, b) => b.subtotal - a.subtotal);
  const shipping = round(list.reduce((n, s) => n + s.shipping, 0));
  return {
    total: round(list.reduce((n, s) => n + s.subtotal, 0) + shipping),
    shipping,
    stops: list,
    missing,
  };
}

export function optimize(items: OptItem[]): OptimizeResult {
  const retailers = [...new Set(items.flatMap((i) => i.options.map((o) => o.retailer)))].sort();
  const result: OptimizeResult = { cheapest: null, twoStops: null, oneStop: null, byRetailer: new Map() };
  if (!items.length || !retailers.length) return result;

  const n = retailers.length;
  for (let subset = 1; subset < 1 << n; subset++) {
    const allowed = retailers.filter((_, i) => subset & (1 << i));
    // Every way to choose which of these retailers we also order online from
    for (let onlineMask = 0; onlineMask < 1 << allowed.length; onlineMask++) {
      const online = new Set(allowed.filter((_, i) => onlineMask & (1 << i)));
      const plan = buildPlan(items, new Set(allowed), online);
      const stops = plan.stops.length;
      if (better(plan, result.cheapest)) result.cheapest = plan;
      if (stops <= 2 && better(plan, result.twoStops)) result.twoStops = plan;
      if (stops <= 1 && better(plan, result.oneStop)) result.oneStop = plan;
      if (allowed.length === 1 && better(plan, result.byRetailer.get(allowed[0]) ?? null)) {
        result.byRetailer.set(allowed[0], plan);
      }
    }
  }
  return result;
}
