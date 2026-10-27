// Seeds the database only if it has no products yet. Runs during deploys
// (`npm run vercel-build`) so a brand-new database gets sample data, while
// later deploys leave existing data (and project lists) alone.
import "dotenv/config";
import { execSync } from "node:child_process";
import { db } from "@/lib/db";

async function main() {
  const products = await db.product.count();
  await db.$disconnect();
  if (products > 0) {
    console.log(`Database already has ${products} products; skipping seed.`);
    return;
  }
  console.log("Empty database: seeding sample data…");
  execSync("npx prisma db seed", { stdio: "inherit" });
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
