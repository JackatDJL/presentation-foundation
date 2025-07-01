import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";

export const recentRouter = createTRPCRouter({
  pullByUID: protectedProcedure
    .input(
      z.object({
        uid: z.string().max(32),
        limit: z.number().int().optional(),
        offset: z.number().int().optional(),
      }),
    )
    .query(async ({ input }) => {
      const data = await db.presentations.findMany({
        where: {
          ownerId: input.uid,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: input.limit ?? 15,
        skip: input.offset ?? 0,
      });

      return data;
    }),
});
