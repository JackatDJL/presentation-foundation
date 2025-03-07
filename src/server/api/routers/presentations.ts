import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { utapi } from "~/server/uploadthing";

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

  deleteById: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      // console.log("Pulling data from database");
      const presentation = await db
        .select()
        .from(presentations)
        .where(eq(presentations.id, input));

      // console.log("Data Pulled from database", presentation);
      if (!presentation[0]) {
        throw new Error("Presentation not found");
      }
      const keys = [
        "logo",
        "cover",
        "presentation",
        "handout",
        "research",
      ] as Array<keyof (typeof presentation)[0]>;
      const presentationItem = presentation[0];
      const filesArray = keys
        .map((key) => presentationItem[key])
        .filter((fileId): fileId is string => fileId !== null && fileId !== "");
      // console.log("Files Array", filesArray);

      for (const fileId of filesArray) {
        if (!fileId) {
          continue;
        }
        // console.log("Deleting File", fileId);
        const filles = await db
          .select()
          .from(files)
          .where(eq(files.id, fileId));

        const file = filles[0];
        // console.log("File Data", file);

        if (!file) {
          throw new Error("File not found");
        }

        const deletionResponse = await utapi.deleteFiles(file.key);
        if (!deletionResponse.success || deletionResponse.deletedCount !== 1) {
          throw new Error("Failed to delete file");
        }
        // console.log("Deleted", fileId, "from Uploadthing", deletionResponse);

        const dbPrResponse = await db
          .update(presentations)
          .set({
            [file.fileType]: null,
          })
          .where(eq(presentations.id, file.presentationId))
          .returning();
        // console.log("Updated Presentation", dbPrResponse);

        if (
          dbPrResponse[0]?.[file.fileType] !== null ||
          dbPrResponse.length !== 1
        ) {
          throw new Error("Failed to update presentation");
        }

        const dbFileResponse = await db
          .delete(files)
          .where(eq(files.id, fileId))
          .returning();
        // console.log("Deleted File", fileId, "from Database", dbFileResponse);
        if (!dbFileResponse[0]) {
          throw new Error("Failed to delete file");
        }
        // console.log("Deleted File", fileId, "from Database", dbFileResponse);
      }

      await db.delete(presentations).where(eq(presentations.id, input));
      // console.log("Deleted Presentation");

      return;
    }),
});
