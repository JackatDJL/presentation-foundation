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

    DB_MAIN_STRING: z.string(),
    DB_MAIN_DIRECT_STRING: z.string(),
    DB_READ1_STRING: z.string(),
    DB_READ2_STRING: z.string(),
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

    DB_MAIN_STRING: process.env.DB_MAIN_STRING,
    DB_MAIN_DIRECT_STRING: process.env.DB_MAIN_DIRECT_STRING,
    DB_READ1_STRING: process.env.DB_READ1_STRING,
    DB_READ2_STRING: process.env.DB_READ2_STRING,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
