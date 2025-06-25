import { PrismaClient } from "@prisma/client";
import { readReplicas } from "@prisma/extension-read-replicas";
import { env } from "~/env";

const replicaUrls = [env.DB_READ1_STRING, env.DB_READ2_STRING];

const db = new PrismaClient().$extends(
  readReplicas({
    url: replicaUrls,
  }),
);

export { db };
