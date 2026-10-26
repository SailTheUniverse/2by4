import { setZip } from "@/app/actions";
import { ZONES, zoneOf } from "@/lib/location";
import { getZip } from "@/lib/zip";

export async function ZipControl() {
  const zip = await getZip();

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm hover:border-ink">
        <PinIcon />
        {zip ? (
          <span>
            <span className="text-muted">Prices for</span> <strong className="tabular">{zip}</strong>
          </span>
        ) : (
          <span className="font-medium">Set ZIP for local prices</span>
        )}
      </summary>
      <div className="absolute right-0 z-30 mt-2 w-72 rounded-xl border border-line bg-surface p-4 shadow-lg">
        <form action={setZip} className="space-y-3">
          <label htmlFor="zip" className="block text-sm font-medium">
            Your ZIP code
          </label>
          <p className="text-xs text-muted">
            We compare in-store prices at your nearest stores, plus online prices with shipping.
          </p>
          <div className="flex gap-2">
            <input
              id="zip"
              name="zip"
              defaultValue={zip ?? ""}
              inputMode="numeric"
              pattern="\d{5}"
              maxLength={5}
              placeholder="e.g. 80202"
              className="tabular w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-ink"
            />
            <button type="submit" className="rounded-lg bg-accent px-3 text-sm font-semibold text-ink hover:brightness-95">
              Save
            </button>
          </div>
          {zip && <p className="text-xs text-muted">Region: {ZONES[zoneOf(zip)]}</p>}
        </form>
      </div>
    </details>
  );
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}
