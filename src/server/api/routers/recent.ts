import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";
import { eq, desc } from "drizzle-orm";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { presentations } from "~/server/db/schema";

export const recentRouter = createTRPCRouter({
  pullByUID: publicProcedure
    .input(
      z.object({
        uid: z.string().max(32),
        limit: z.number().int().optional(),
        offset: z.number().int().optional(),
      }),
    )
    .query(async ({ input }) => {
      const data = await db
        .select()
        .from(presentations)
        .where(eq(presentations.owner, input.uid))
        .orderBy(desc(presentations.updatedAt))
        .limit(input.limit ?? 15)
        .offset(input.offset ?? 0);

      return data;
    }),
});
