import "server-only";
import { cookies } from "next/headers";
import { isValidZip, ZIP_COOKIE } from "@/lib/location";

/** The shopper's ZIP from their cookie, or null. Call inside a <Suspense> boundary. */
export async function getZip(): Promise<string | null> {
  const zip = (await cookies()).get(ZIP_COOKIE)?.value;
  return isValidZip(zip) ? zip : null;
}
