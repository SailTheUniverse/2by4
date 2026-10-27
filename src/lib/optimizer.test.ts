import { describe, expect, it } from "vitest";
import { optimize, type OptItem } from "./optimizer";

const store = (retailer: string, unitPrice: number) => ({ retailer, channel: "store" as const, unitPrice, shipping: 0 });
const online = (retailer: string, unitPrice: number, shipping = 0) => ({ retailer, channel: "online" as const, unitPrice, shipping });

describe("optimize", () => {
  const items: OptItem[] = [
    { id: "studs", quantity: 10, options: [store("hd", 4), store("lowes", 4.5)] },
    { id: "wire", quantity: 1, options: [store("hd", 120), store("lowes", 100)] },
    { id: "screws", quantity: 2, options: [store("hd", 10), store("lowes", 11)] },
  ];

  it("splits across retailers when that's cheapest", () => {
    const { cheapest } = optimize(items);
    // studs + screws at hd (40 + 20), wire at lowes (100)
    expect(cheapest!.total).toBe(160);
    expect(cheapest!.stops.map((s) => s.retailer).sort()).toEqual(["hd", "lowes"]);
  });

  it("finds the best single retailer", () => {
    const { oneStop, byRetailer } = optimize(items);
    expect(byRetailer.get("hd")!.total).toBe(180);
    expect(byRetailer.get("lowes")!.total).toBe(167);
    expect(oneStop!.total).toBe(167);
    expect(oneStop!.stops).toHaveLength(1);
  });

  it("charges one shipping fee per online order, free if any item ships free", () => {
    const shipped: OptItem[] = [
      { id: "a", quantity: 1, options: [online("amazon", 5, 6), store("hd", 9)] },
      { id: "b", quantity: 1, options: [online("amazon", 5, 6), store("hd", 9)] },
    ];
    // Online: 10 + one 6 fee = 16, beats 18 in store
    expect(optimize(shipped).cheapest!.total).toBe(16);

    const withFreeItem: OptItem[] = [...shipped, { id: "c", quantity: 1, options: [online("amazon", 40, 0), store("hd", 45)] }];
    // The $40 item ships free, so the whole order does: 5 + 5 + 40
    expect(optimize(withFreeItem).cheapest!.total).toBe(50);
  });

  it("skips online when the shipping fee outweighs the savings", () => {
    const plan = optimize([{ id: "a", quantity: 1, options: [online("amazon", 5, 6), store("hd", 9)] }]).cheapest!;
    expect(plan.stops[0].retailer).toBe("hd");
    expect(plan.total).toBe(9);
  });

  it("prefers complete plans and reports missing items", () => {
    const partial: OptItem[] = [
      { id: "a", quantity: 1, options: [store("hd", 1)] },
      { id: "b", quantity: 1, options: [store("lowes", 100)] },
    ];
    const { cheapest, oneStop } = optimize(partial);
    expect(cheapest!.missing).toEqual([]);
    expect(cheapest!.total).toBe(101);
    // No single retailer has both: the best one-stop plan is the one missing least, then cheapest
    expect(oneStop!.missing).toHaveLength(1);
    expect(oneStop!.total).toBe(1);
  });

  it("caps the two-stop plan at two retailers", () => {
    const spread: OptItem[] = [
      { id: "a", quantity: 1, options: [store("r1", 1), store("r4", 2)] },
      { id: "b", quantity: 1, options: [store("r2", 1), store("r4", 2)] },
      { id: "c", quantity: 1, options: [store("r3", 1), store("r4", 2)] },
    ];
    const { cheapest, twoStops } = optimize(spread);
    expect(cheapest!.stops).toHaveLength(3);
    expect(cheapest!.total).toBe(3);
    expect(twoStops!.stops.length).toBeLessThanOrEqual(2);
    expect(twoStops!.total).toBe(5); // two items at their cheapest store + one at r4
  });

  it("handles an empty list", () => {
    expect(optimize([]).cheapest).toBeNull();
  });
});
