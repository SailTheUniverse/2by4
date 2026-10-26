// ZIP-based location for local store pricing.
//
// Draft approach: the first digit of a US ZIP code is a national zone that maps
// cleanly to a broad region, and within a zone we treat the numerically closest
// store ZIP as "nearest". Good enough to demo local pricing without a geo
// database; swap for real lat/lng distance once we load a ZIP centroid dataset.

export const ZIP_COOKIE = "zip";

export const ZONES: Record<string, string> = {
  "0": "New England & NJ",
  "1": "New York & Pennsylvania",
  "2": "Mid-Atlantic & Carolinas",
  "3": "Southeast",
  "4": "Great Lakes & Kentucky",
  "5": "Upper Midwest",
  "6": "Central Plains",
  "7": "South Central",
  "8": "Mountain West",
  "9": "Pacific",
};

export function isValidZip(zip: string | undefined | null): zip is string {
  return !!zip && /^\d{5}$/.test(zip);
}

export function zoneOf(zip: string) {
  return zip[0];
}

export function zipDistance(a: string, b: string) {
  return Math.abs(Number(a) - Number(b));
}

/** Pick the nearest store per retailer for a ZIP. Stores outside the zone are ignored. */
export function nearestStores<T extends { retailerId: string; zip: string }>(
  stores: T[],
  zip: string,
): Map<string, T> {
  const nearest = new Map<string, T>();
  for (const store of stores) {
    if (zoneOf(store.zip) !== zoneOf(zip)) continue;
    const current = nearest.get(store.retailerId);
    if (!current || zipDistance(store.zip, zip) < zipDistance(current.zip, zip)) {
      nearest.set(store.retailerId, store);
    }
  }
  return nearest;
}
