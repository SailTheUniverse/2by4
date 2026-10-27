import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/index.ts",
  },
  datasource: {
    // Migrations need a direct (unpooled) connection. Vercel's Neon integration
    // provides DATABASE_URL_UNPOOLED; locally DATABASE_URL is already direct.
    url: process.env["DATABASE_URL_UNPOOLED"] || process.env["DATABASE_URL"],
  },
});
