import { createEnv } from "@t3-oss/env-nextjs";
import { config } from "dotenv";
import { z } from "zod";

// IMPORTANT: To Load the env use (vercel env pull .env) / our db needs the .env not .env.local
config({ path: ".env" });

const getBetterAuthUrl = () => {
  // Handle client-side
  if (typeof window !== "undefined" && window.location.host) {
    const protocol = window.location.protocol;
    return `${protocol}//${window.location.host}`;
  }

  // Handle server-side with Vercel environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Handle server-side with explicit HOST/PORT
  if (process.env.HOST || process.env.PORT) {
    const host = process.env.HOST || "localhost";
    const port = process.env.PORT || "3000";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    return `${protocol}://${host}${port !== "80" && port !== "443" ? `:${port}` : ""}`;
  }

  // Development fallback
  return "http://localhost:3000";
};
const hostUrl = getBetterAuthUrl();

process.env.BETTER_AUTH_URL = hostUrl;
process.env.HOST_URL = hostUrl;

// test
process.env.NEXT_PUBLIC_HOST_URL = hostUrl;

export const env = createEnv({
  server: {
    HOST_URL: z.string().url().default(hostUrl),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    CLERK_SECRET_KEY: z.string(),

    UPLOADTHING_TOKEN: z.string(),

    DB_MAIN_STRING: z.string(),
    DB_MAIN_DIRECT_STRING: z.string(),
    DB_READ1_STRING: z.string(),
    DB_READ2_STRING: z.string(),

    // Auth
    BETTER_AUTH_SECRET: z.string(),
    BETTER_AUTH_URL: z.string().url(),
    GITHUB_AUTH_CLIENT_SECRET: z.string(),
    GITHUB_AUTH_CLIENT_ID: z.string(),
    GOOGLE_AUTH_CLIENT_ID: z.string(),
    GOOGLE_AUTH_CLIENT_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_POSTHOG_KEY: z.string(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().url(),
    NEXT_PUBLIC_POSTHOG_PROJECT_ID: z.string(),

    // Better Auth
    NEXT_PUBLIC_HOST_URL: z.string().url(),
    NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID: z.string(),
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
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_POSTHOG_PROJECT_ID: process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID,

    // Better Auth
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_HOST_URL: process.env.NEXT_PUBLIC_HOST_URL,
    HOST_URL: process.env.HOST_URL,
    GITHUB_AUTH_CLIENT_ID: process.env.GITHUB_AUTH_CLIENT_ID,
    GITHUB_AUTH_CLIENT_SECRET: process.env.GITHUB_AUTH_CLIENT_SECRET,
    GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
    NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID: process.env.GOOGLE_AUTH_CLIENT_ID,
    GOOGLE_AUTH_CLIENT_SECRET: process.env.GOOGLE_AUTH_CLIENT_SECRET,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

export default env;
