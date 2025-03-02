import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";
import { eq } from "drizzle-orm";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { presentations, files } from "~/server/db/schema";

export const presentationRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        shortname: z.string().max(25),
        title: z.string(),
        description: z.string().optional(),

        logo: z.string().uuid().optional(),
        cover: z.string().uuid().optional(),
        presentation: z.string().uuid().optional(),
        handout: z.string().uuid().optional(),
        research: z.string().uuid().optional(),

        kahootPin: z.string().optional(),
        kahootSelfHostUrl: z.string().url().optional(),

        credits: z.string().optional(),

        visibility: z.enum(["public", "private"]).optional(),

        owner: z.string().max(32),

        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      }),
    )
    .query(async ({ input }) => {
      const presentation: typeof presentations.$inferInsert = {
        id: crypto.randomUUID(),
        shortname: input.shortname,
        title: input.title,
        description: input.description,

        logo: input.logo,
        cover: input.cover,
        presentation: input.presentation,
        handout: input.handout,
        research: input.research,

        kahootPin: input.kahootPin,
        kahootSelfHostUrl: input.kahootSelfHostUrl,

        credits: input.credits,

        visibility: input.visibility,

        owner: input.owner,
        createdAt: new Date(input.createdAt),
        updatedAt: new Date(input.updatedAt),
      };

      const response = await db
        .insert(presentations)
        .values(presentation)
        .returning();

      console.log(response);

      return response;
    }),

  checkAvailability: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      console.log("test");
      const isAvailable = await db
        .select()
        .from(presentations)
        .where(eq(presentations.shortname, input));

      console.log(isAvailable);

      return isAvailable.length === 0;
    }),
});
