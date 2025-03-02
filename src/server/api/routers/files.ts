import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";
import { files } from "~/server/db/schema";

export const filesRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.enum(["logo", "cover", "presentation", "handout", "research"]),
        datatype: z.string(),
        size: z.number().int(),
        key: z.string().length(48),
        ufsUrl: z.string().url(),
        isLocked: z.boolean(),
        password: z.string().optional(),
        presentationId: z.string().uuid(),
        owner: z.string().length(32),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      }),
    )
    .query(async ({ input }) => {
      const file: typeof files.$inferInsert = {
        id: crypto.randomUUID(),
        name: input.name,
        type: input.type,
        datatype: input.datatype,
        size: input.size,
        key: input.key,
        ufsUrl: input.ufsUrl,
        isLocked: input.isLocked,
        presentationId: input.presentationId,
        owner: input.owner,
        createdAt: new Date(input.createdAt),
        updatedAt: new Date(input.updatedAt),
      };

      const response = await db.insert(files).values(file).returning();

      // if (input.password) {
      //   db.insert(files).values({id: ,password: input.password})
      // }

      console.log(response);

      return response;
    }),
});
