// Prisma 7 config — datasource URLs live here, not in schema.prisma.
// DATABASE_URL is the pooled (PgBouncer) URL used at runtime.
// DIRECT_URL is the direct connection used for migrations/introspection.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
