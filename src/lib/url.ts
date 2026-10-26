import type { SearchParams } from "@/lib/filters";

function toParams(sp: SearchParams) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v === undefined) continue;
    for (const item of Array.isArray(v) ? v : [v]) params.append(k, item);
  }
  return params;
}

function href(path: string, params: URLSearchParams) {
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/** Toggle one value of a multi-value param (checkbox-style). */
export function toggleParam(path: string, sp: SearchParams, key: string, value: string) {
  const params = toParams(sp);
  const values = params.getAll(key);
  params.delete(key);
  const next = values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
  for (const v of next) params.append(key, v);
  return href(path, params);
}

/** Set (or with null, remove) a single-value param. */
export function setParam(path: string, sp: SearchParams, key: string, value: string | null) {
  const params = toParams(sp);
  params.delete(key);
  if (value !== null) params.set(key, value);
  return href(path, params);
}

/** Keep only the given params (e.g. clear all filters but keep sort). */
export function keepParams(path: string, sp: SearchParams, keys: string[]) {
  const params = toParams(sp);
  for (const k of [...params.keys()]) if (!keys.includes(k)) params.delete(k);
  return href(path, params);
}

/** Flatten params to hidden inputs for GET forms that should preserve other filters. */
export function hiddenInputs(sp: SearchParams, exclude: string[]) {
  const out: [string, string][] = [];
  for (const [k, v] of toParams(sp)) if (!exclude.includes(k)) out.push([k, v]);
  return out;
}
