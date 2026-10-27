// Find Amazon ASINs for our products using Creators API search.
//
//   npm run amazon:match                  # dry run: show proposed matches
//   npm run amazon:match -- --apply       # save confident matches (model number found in title)
//   npm run amazon:match -- --set <product-slug> <ASIN>   # set one by hand
//
// A match is "confident" only when the product's model number appears in the
// Amazon title. Everything else is printed for review, never saved automatically.
import "dotenv/config";
import { db } from "@/lib/db";
import { amazonConfigFromEnv, createAmazonClient } from "@/lib/providers/amazon";

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

async function setOne(slug: string, asin: string) {
  const listing = await db.listing.findFirst({
    where: { product: { slug }, retailer: { slug: "amazon" } },
  });
  if (!listing) throw new Error(`No Amazon listing for product "${slug}"`);
  await db.listing.update({
    where: { id: listing.id },
    data: { retailerSku: asin, url: `https://www.amazon.com/dp/${asin}` },
  });
  console.log(`Set ${slug} → ${asin}`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--set") return setOne(args[1], args[2]);

  const config = amazonConfigFromEnv();
  if (!config) {
    console.error("Amazon credentials are not configured. See README → Real price data → Amazon.");
    process.exitCode = 1;
    return;
  }
  const apply = args.includes("--apply");
  const client = createAmazonClient(config);

  const listings = await db.listing.findMany({
    where: { retailer: { slug: "amazon" }, retailerSku: null },
    include: { product: true },
  });
  console.log(`${listings.length} Amazon listings without an ASIN${apply ? "" : " (dry run)"}\n`);

  let saved = 0;
  for (const listing of listings) {
    const p = listing.product;
    const query = p.model ? `${p.brand} ${p.model}` : p.name;
    const items = await client.searchItems(query);
    const confident = p.model
      ? items.find((i) => normalize(i.itemInfo?.title?.displayValue ?? "").includes(normalize(p.model!)))
      : undefined;

    if (confident) {
      console.log(`✓ ${p.name}\n    ${confident.asin}  ${confident.itemInfo?.title?.displayValue}`);
      if (apply) {
        await db.listing.update({
          where: { id: listing.id },
          data: { retailerSku: confident.asin, url: confident.detailPageURL ?? `https://www.amazon.com/dp/${confident.asin}` },
        });
        saved++;
      }
    } else {
      console.log(`? ${p.name}  (review, then use --set)`);
      for (const i of items.slice(0, 3)) console.log(`    ${i.asin}  ${i.itemInfo?.title?.displayValue}`);
    }
  }
  if (apply) console.log(`\nSaved ${saved} matches. Run \`npm run prices:refresh -- amazon\` to fetch prices.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
