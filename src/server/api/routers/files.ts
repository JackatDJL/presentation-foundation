import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";
import { files, presentations } from "~/server/db/schema";

export const fileRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        fileType: z.enum([
          "logo",
          "cover",
          "presentation",
          "handout",
          "research",
        ]),
        dataType: z.string(),
        size: z.number().int(),
        key: z.string().length(48),
        ufsUrl: z.string().url(),

        isLocked: z.boolean().default(false),
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
        fileType: input.fileType,
        dataType: input.dataType,
        size: input.size,
        key: input.key,
        ufsUrl: input.ufsUrl,

        isLocked: input.isLocked,
        password: input.password,

        presentationId: input.presentationId,
        owner: input.owner,

        createdAt: new Date(input.createdAt),
        updatedAt: new Date(input.updatedAt),
      };
      // console.log("Inserting Data into Database", file);

      await db.insert(files).values(file);

      const response = await db
        .select()
        .from(files)
        .where(eq(files.id, file.id!));

      // console.log("Inserted Data into Database", response);

      // console.log("Configuring Presentation to point to File");

      await db
        .update(presentations)
        .set({
          [input.fileType]: response[0]?.id,
          updatedAt: new Date(input.updatedAt),
        })
        .where(eq(presentations.id, input.presentationId));

      const presentation = await db
        .select()
        .from(presentations)
        .where(eq(presentations.id, input.presentationId));

      // console.log("Updated Presentation", presentation);

      return {
        file: response[0],
        presentation: presentation[0],
      };
    }),
  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    const file = await db.select().from(files).where(eq(files.id, input));

    return file[0];
  }),
});
