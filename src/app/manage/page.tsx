import { desc, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { presentations } from "~/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import ManagePresentations from "./core";

export default async function ManagePage() {
  const user = await auth.protect();
  const presentation = await db
    .select()
    .from(presentations)
    .where(eq(presentations.owner, user.userId))
    .orderBy(desc(presentations.updatedAt));

  return <ManagePresentations presentation={presentation} />;
}
