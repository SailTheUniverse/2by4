// Seeds the database when it's empty or when the seed data has changed since
// the last seed. Runs during deploys (`npm run vercel-build`), so new catalog
// data ships with a push while unchanged deploys leave the database alone.
// Reseeding keeps project lists (items are re-linked by product slug).
import "dotenv/config";
import { execSync } from "node:child_process";
import { db } from "@/lib/db";
import { CATALOG_KEY, catalogVersion } from "../prisma/seed/version";

async function main() {
  const [products, setting] = await Promise.all([
    db.product.count(),
    db.appSetting.findUnique({ where: { key: CATALOG_KEY } }),
  ]);
  await db.$disconnect();
  const version = catalogVersion();

  if (products > 0 && setting?.value === version) {
    console.log(`Catalog ${version} is already loaded (${products} products); skipping seed.`);
    return;
  }
  console.log(products ? `Catalog changed (${setting?.value ?? "unknown"} → ${version}): reseeding…` : "Empty database: seeding…");
  execSync("npx prisma db seed", { stdio: "inherit" });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
