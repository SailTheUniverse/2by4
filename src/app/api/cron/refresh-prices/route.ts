import { headers } from "next/headers";
import { db } from "@/lib/db";
import { pruneHistory, refreshPrices } from "@/lib/refresh";

// Called by Vercel Cron (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`
// when the CRON_SECRET env var is set; without it the endpoint stays closed.
export const maxDuration = 60;

export async function GET() {
  const secret = process.env.CRON_SECRET;
  const auth = (await headers()).get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const started = Date.now();
  const offers = await refreshPrices(db);
  const pruned = await pruneHistory(db);
  return Response.json({ offers, pruned, ms: Date.now() - started });
}
