// src/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config, type DotenvConfigOutput } from "dotenv";

const result: DotenvConfigOutput = config({ path: ".env.local" }); // or .env.local
if (result.error) {
  throw result.error;
}
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const sql = neon(databaseUrl);
export const db = drizzle(sql);
