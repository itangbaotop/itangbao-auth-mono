import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "sqlite", // 始终生成 SQLite 兼容的 SQL
  driver: "d1-http", 
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.DATABASE_ID!,
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
} satisfies Config;
