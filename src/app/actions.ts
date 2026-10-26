"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { isValidZip, ZIP_COOKIE } from "@/lib/location";

export async function setZip(formData: FormData) {
  const zip = String(formData.get("zip") ?? "").trim();
  const store = await cookies();
  if (isValidZip(zip)) {
    store.set(ZIP_COOKIE, zip, { maxAge: 60 * 60 * 24 * 365, path: "/", sameSite: "lax" });
  } else if (zip === "") {
    store.delete(ZIP_COOKIE);
  }
  refresh();
}
