import { env } from "~/env";
import { withReplicas } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";

const primary = drizzle(
  `postgres://${env.DB_MAIN_PGUSER}:${env.DB_MAIN_PGPASSWORD}@${env.DB_MAIN_PGHOST}/${env.DB_PGDATABASE}?sslmode=require`,
);

const read1 = drizzle(
  `postgres://${env.DB_READ1_PGUSER}:${env.DB_READ1_PGPASSWORD}@${env.DB_READ1_PGHOST}/${env.DB_PGDATABASE}?sslmode=require`,
);
const read2 = drizzle(
  `postgres://${env.DB_READ2_PGUSER}:${env.DB_READ2_PGPASSWORD}@${env.DB_READ2_PGHOST}/${env.DB_PGDATABASE}?sslmode=require`,
);

export const db = withReplicas(primary, [read1, read2]);
