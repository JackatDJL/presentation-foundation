import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import { z } from "zod";

// IMPORTANT: To Load the env use (vercel env pull .env) / our db needs the .env not .env.local
config({ path: ".env" });

export const env = createEnv({
  server: {
    CLERK_SECRET_KEY: z.string(),
    UPLOADTHING_TOKEN: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    // VERCEL_URL: z.string().url(),

    // New Database variables
    DB_MAIN_PGHOST: z.string(),
    DB_MAIN_PGPASSWORD: z.string(),
    DB_MAIN_PGUSER: z.string(),
    DB_PGDATABASE: z.string(),
    DB_READ1_PGHOST: z.string(),
    DB_READ1_PGPASSWORD: z.string(),
    DB_READ1_PGUSER: z.string(),
    DB_READ2_PGHOST: z.string(),
    DB_READ2_PGPASSWORD: z.string(),
    DB_READ2_PGUSER: z.string(),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  runtimeEnv: {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
    NODE_ENV: process.env.NODE_ENV,
    // VERCEL_URL: process.env.VERCEL_URL,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,

    // New Database environment variables
    DB_MAIN_PGHOST: process.env.DB_MAIN_PGHOST,
    DB_MAIN_PGPASSWORD: process.env.DB_MAIN_PGPASSWORD,
    DB_MAIN_PGUSER: process.env.DB_MAIN_PGUSER,
    DB_PGDATABASE: process.env.DB_PGDATABASE,
    DB_READ1_PGHOST: process.env.DB_READ1_PGHOST,
    DB_READ1_PGPASSWORD: process.env.DB_READ1_PGPASSWORD,
    DB_READ1_PGUSER: process.env.DB_READ1_PGUSER,
    DB_READ2_PGHOST: process.env.DB_READ2_PGHOST,
    DB_READ2_PGPASSWORD: process.env.DB_READ2_PGPASSWORD,
    DB_READ2_PGUSER: process.env.DB_READ2_PGUSER,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
