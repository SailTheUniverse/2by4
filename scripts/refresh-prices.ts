// Refresh current prices from each retailer's provider.
//   npm run prices:refresh               # all retailers
//   npm run prices:refresh -- lowes      # one retailer
import "dotenv/config";
import { db } from "@/lib/db";
import { refreshPrices } from "@/lib/refresh";

async function main() {
  const retailerSlug = process.argv[2];
  console.log(`Refreshing prices${retailerSlug ? ` for ${retailerSlug}` : ""}…`);
  const count = await refreshPrices(db, { retailerSlug });
  console.log(`Done: ${count} offers updated.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
