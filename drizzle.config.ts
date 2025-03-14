import { type Config } from "drizzle-kit";

import { env } from "~/env";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: `postgres://${env.DB_MAIN_PGUSER}:${env.DB_MAIN_PGPASSWORD}@${env.DB_MAIN_PGHOST}/${env.DB_PGDATABASE}?sslmode=require`,
  },
  tablesFilter: ["pr.f-*"],
} satisfies Config;
