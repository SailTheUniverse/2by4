"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Line chart of each retailer's best price over time. Hand-rolled SVG: one
// y-axis, 2px lines, recessive grid, crosshair + tooltip listing every series,
// legend, direct end labels (≤4 series) and a table view.

export interface ChartSeries {
  retailer: { slug: string; name: string; color: string };
  points: { day: string; price: number }[];
}

const RANGES = [
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

const HEIGHT = 260;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 52 };
const LABEL_GUTTER = 96; // room for direct end labels

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const shortDate = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Round axis bounds to "nice" steps. */
function niceTicks(min: number, max: number, count = 4) {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const raw = (max - min) / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw)!;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}

export function PriceHistoryChart({ series }: { series: ChartSeries[] }) {
  const [range, setRange] = useState(90);
  const [width, setWidth] = useState(720);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(280, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { days, visible, yTicks } = useMemo(() => {
    // Window ends at the newest data point, so the chart is a pure function of its props
    const latest = series.flatMap((s) => s.points.map((p) => p.day)).sort().at(-1) ?? "";
    const cutoff = latest
      ? new Date(Date.parse(`${latest}T00:00:00Z`) - range * 86_400_000).toISOString().slice(0, 10)
      : "";
    const visible = series
      .map((s) => ({ ...s, points: s.points.filter((p) => p.day >= cutoff) }))
      .filter((s) => s.points.length > 0);
    const days = [...new Set(visible.flatMap((s) => s.points.map((p) => p.day)))].sort();
    const prices = visible.flatMap((s) => s.points.map((p) => p.price));
    const yTicks = prices.length ? niceTicks(Math.min(...prices), Math.max(...prices)) : [0, 1];
    return { days, visible, yTicks };
  }, [series, range]);

  if (!days.length) return null;

  const directLabels = visible.length <= 4;
  const plotRight = width - MARGIN.right - (directLabels ? LABEL_GUTTER : 0);
  const plotW = plotRight - MARGIN.left;
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;
  const yMin = yTicks[0];
  const yMax = yTicks[yTicks.length - 1];
  const x = (i: number) => MARGIN.left + (days.length === 1 ? plotW / 2 : (i / (days.length - 1)) * plotW);
  const y = (v: number) => MARGIN.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const dayIndex = new Map(days.map((d, i) => [d, i]));

  // Roughly one x label per 110px
  const xLabelEvery = Math.max(1, Math.ceil(days.length / Math.max(2, Math.floor(plotW / 110))));

  // End labels, nudged apart so they don't overlap
  const ends = visible
    .map((s) => {
      const last = s.points[s.points.length - 1];
      return { s, last, y: y(last.price) };
    })
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 14) ends[i].y = ends[i - 1].y + 14;

  const onPointer = (clientX: number) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const px = clientX - rect.left;
    const i = Math.round(((px - MARGIN.left) / plotW) * (days.length - 1));
    setHoverIndex(Math.min(days.length - 1, Math.max(0, i)));
  };

  const hoverDay = hoverIndex !== null ? days[hoverIndex] : null;
  const hoverRows = hoverDay
    ? visible
        .map((s) => ({ s, p: s.points.find((p) => p.day === hoverDay) }))
        .filter((r): r is { s: ChartSeries; p: { day: string; price: number } } => !!r.p)
        .sort((a, b) => a.p.price - b.p.price)
    : [];
  const tooltipLeft = hoverIndex !== null ? x(hoverIndex) : 0;
  const tooltipOnLeft = tooltipLeft > width * 0.6;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-paper p-1 text-sm" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={r.days}
              type="button"
              onClick={() => setRange(r.days)}
              aria-pressed={range === r.days}
              className={`rounded-md px-3 py-1 ${range === r.days ? "bg-surface font-medium shadow-sm" : "text-muted hover:text-ink"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        {visible.length > 1 && (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted" aria-label="Legend">
            {visible.map((s) => (
              <li key={s.retailer.slug} className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: s.retailer.color }} aria-hidden />
                {s.retailer.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div
        ref={wrapRef}
        className="relative select-none"
        onPointerMove={(e) => onPointer(e.clientX)}
        onPointerLeave={() => setHoverIndex(null)}
      >
        <svg
          width={width}
          height={HEIGHT}
          role="img"
          aria-label={`Price history over the last ${range} days`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setHoverIndex((i) => Math.max(0, (i ?? days.length) - 1));
            if (e.key === "ArrowRight") setHoverIndex((i) => Math.min(days.length - 1, (i ?? -1) + 1));
            if (e.key === "Escape") setHoverIndex(null);
          }}
          onBlur={() => setHoverIndex(null)}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
        >
          {/* Grid + y axis */}
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={MARGIN.left} x2={plotRight} y1={y(t)} y2={y(t)} stroke="var(--color-line)" strokeWidth={1} />
              <text x={MARGIN.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="tabular fill-muted text-[11px]">
                {usd(t)}
              </text>
            </g>
          ))}
          {/* X axis labels */}
          {days.map((d, i) =>
            i % xLabelEvery === 0 ? (
              <text key={d} x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-muted text-[11px]">
                {shortDate(d)}
              </text>
            ) : null,
          )}

          {/* Lines */}
          {visible.map((s) => (
            <polyline
              key={s.retailer.slug}
              fill="none"
              stroke={s.retailer.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={s.points.map((p) => `${x(dayIndex.get(p.day)!)},${y(p.price)}`).join(" ")}
            />
          ))}

          {/* Direct end labels (text in ink; the color key carries identity) */}
          {directLabels &&
            ends.map(({ s, last, y: ly }) => (
              <g key={s.retailer.slug}>
                <line
                  x1={x(dayIndex.get(last.day)!) + 4}
                  x2={plotRight + 10}
                  y1={y(last.price)}
                  y2={ly}
                  stroke={s.retailer.color}
                  strokeWidth={1}
                  opacity={0.6}
                />
                <text x={plotRight + 14} y={ly} dy="0.32em" className="fill-ink text-[11px]">
                  {s.retailer.name}
                </text>
              </g>
            ))}

          {/* Crosshair */}
          {hoverIndex !== null && (
            <g pointerEvents="none">
              <line
                x1={x(hoverIndex)}
                x2={x(hoverIndex)}
                y1={MARGIN.top}
                y2={MARGIN.top + plotH}
                stroke="var(--color-ink)"
                strokeOpacity={0.35}
                strokeWidth={1}
              />
              {hoverRows.map(({ s, p }) => (
                <circle
                  key={s.retailer.slug}
                  cx={x(hoverIndex)}
                  cy={y(p.price)}
                  r={4}
                  fill={s.retailer.color}
                  stroke="var(--color-surface)"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}
        </svg>

        {hoverDay && hoverRows.length > 0 && (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-lg border border-line bg-surface px-3 py-2 text-sm shadow-lg"
            style={tooltipOnLeft ? { right: width - tooltipLeft + 12 } : { left: tooltipLeft + 12 }}
            role="status"
          >
            <p className="mb-1 text-xs text-muted">{shortDate(hoverDay)}</p>
            <ul className="space-y-0.5">
              {hoverRows.map(({ s, p }) => (
                <li key={s.retailer.slug} className="flex items-center gap-2">
                  <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: s.retailer.color }} aria-hidden />
                  <span className="tabular font-semibold">{usd(p.price)}</span>
                  <span className="text-muted">{s.retailer.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted hover:text-ink">Show as table</summary>
        <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-line">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-paper text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2 font-medium">Date</th>
                {visible.map((s) => (
                  <th key={s.retailer.slug} className="px-3 py-2 text-right font-medium">
                    {s.retailer.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...days].reverse().map((d) => (
                <tr key={d} className="border-t border-line">
                  <td className="px-3 py-1.5">{shortDate(d)}</td>
                  {visible.map((s) => {
                    const p = s.points.find((pt) => pt.day === d);
                    return (
                      <td key={s.retailer.slug} className="tabular px-3 py-1.5 text-right">
                        {p ? usd(p.price) : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
