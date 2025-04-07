import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { utapi } from "~/server/uploadthing";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { presentations, files } from "~/server/db/schema";
import { del } from "@vercel/blob";
import { forbiddenShortnames } from "~/components/shortname-routing-utility";

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
      const isAvailable = await db
        .select()
        .from(presentations)
        .where(eq(presentations.shortname, input));

      if (forbiddenShortnames.includes(input)) {
        return false;
      }
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
          throw new Error("No File ID Provided");
        }
        let file = (
          await db.select().from(files).where(eq(files.id, fileId))
        )[0];
        if (!file) {
          throw new Error("File not found");
        }
        // Immediatly remove the file from the queue so that the file doesnt get lost trancending servers
        if (file.transferStatus === "queued") {
          file = (
            await db
              .update(files)
              .set({
                targetStorage: file.storedIn,
                transferStatus: "idle",
              })
              .where(eq(files.id, input))
              .returning()
          )[0];

          if (!file) {
            throw new Error("File not found");
          }
        }
        // Get the presentationId and the filetype

        // Delete the file from the corresponding service
        switch (file.storedIn) {
          case "utfs":
            if (!file.ufsKey) {
              throw new Error("No Key Provided");
            }
            const deletionResponse = await utapi.deleteFiles(file.ufsKey);
            if (
              !deletionResponse.success ||
              deletionResponse.deletedCount !== 1
            ) {
              throw new Error("Failed to delete file");
            }
            break;
          case "blob":
            if (!file.blobPath) {
              throw new Error("No Path Provided");
            }
            await del(file.blobPath);
            break;
        }

        // Update the presentation to remove the file

        const dbPrResponse = await db
          .update(presentations)
          .set({
            [file.fileType]: null,
          })
          .where(eq(presentations.id, file.presentationId))
          .returning();

        if (
          dbPrResponse[0]?.[file.fileType] !== null ||
          dbPrResponse.length !== 1
        ) {
          throw new Error("Failed to update presentation");
        }

        // Delete the file from the db
        const dbFileResponse = await db
          .delete(files)
          .where(eq(files.id, input))
          .returning();
        if (dbFileResponse.length !== 1) {
          throw new Error("Failed to delete file");
        }
      }

      await db.delete(presentations).where(eq(presentations.id, input));
      // console.log("Deleted Presentation");

      return;
    }),
});
