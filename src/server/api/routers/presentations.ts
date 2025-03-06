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

        kahootPin: z.string().optional(),
        kahootId: z.string().optional(), // TODO: Make it Also Assemble it By itself (by ID)

        credits: z.string().optional(),

        visibility: z.enum(["public", "private"]).optional(),

        owner: z.string().max(32),

        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      }),
    )
    .mutation(async ({ input }) => {
      const presentation: typeof presentations.$inferInsert = {
        id: crypto.randomUUID(),
        shortname: input.shortname,
        title: input.title,
        description: input.description,

        kahootPin: input.kahootPin,
        kahootId: input.kahootId,

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

      // console.log("Inserted Data into Database", response);

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

      return isAvailable.length === 0;
    }),

  getByShortname: publicProcedure.input(z.string()).query(async ({ input }) => {
    const presentation = await db
      .select()
      .from(presentations)
      .where(eq(presentations.shortname, input));

    return presentation[0];
  }),

  getIdByShortname: publicProcedure
    .input(z.string().max(25))
    .query(async ({ input }) => {
      const presentation = await db
        .select()
        .from(presentations)
        .where(eq(presentations.shortname, input));

      return presentation[0]?.id;
    }),

  getById: publicProcedure.input(z.string().uuid()).query(async ({ input }) => {
    const presentation = await db
      .select()
      .from(presentations)
      .where(eq(presentations.id, input));

    return presentation[0];
  }),

  edit: publicProcedure
    .input(
      z.object({
        id: z.string().uuid(),

        shortname: z.string().max(25),
        title: z.string(),
        description: z.string().optional(),

        kahootPin: z.string().optional(),
        kahootId: z.string().optional(),

        credits: z.string().optional(),

        visibility: z.enum(["public", "private"]).optional(),

        updatedAt: z.string().datetime(),
      }),
    )
    .mutation(async ({ input }) => {
      const presentation = await db
        .update(presentations)
        .set({
          shortname: input.shortname,
          title: input.title,
          description: input.description,

          kahootPin: input.kahootPin,
          kahootId: input.kahootId,

          credits: input.credits,

          visibility: input.visibility,

          updatedAt: new Date(input.updatedAt),
        })
        .where(eq(presentations.id, input.id))
        .returning();

      return presentation;
    }),
  //TODO: Implement Deletion
});
