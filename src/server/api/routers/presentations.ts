import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";
import { utapi } from "~/server/uploadthing";

import { del } from "@vercel/blob";
import { forbiddenShortnames } from "~/components/shortname-routing-utility";
import { type Prisma } from "@prisma/client";

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
      const presentation: Prisma.presentationsCreateInput = {
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

      return await db.presentations.create({
        data: presentation,
      });
    }),

  checkAvailability: publicProcedure
    .input(z.string())
    .query(async ({ input }) => {
      const isAvailable = await db.presentations.findMany({
        where: {
          shortname: input,
        },
      });

      if (forbiddenShortnames.includes(input)) {
        return false;
      }
      return isAvailable.length === 0;
    }),

  getByShortname: publicProcedure.input(z.string()).query(async ({ input }) => {
    return await db.presentations.findFirst({
      where: {
        shortname: input,
      },
      include: {
        files: true,
      },
    });
  }),

  getIdByShortname: publicProcedure
    .input(z.string().max(25))
    .query(async ({ input }) => {
      const response = await db.presentations.findFirst({
        where: {
          shortname: input,
        },
      });
      return response?.id;
    }),

  getById: publicProcedure.input(z.string().uuid()).query(async ({ input }) => {
    return await db.presentations.findFirst({
      where: {
        id: input,
      },
      include: {
        files: true,
      },
    });
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
      const presentation = await db.presentations.update({
        where: {
          id: input.id,
        },
        data: {
          shortname: input.shortname,
          title: input.title,
          description: input.description,

          kahootPin: input.kahootPin,
          kahootId: input.kahootId,

          credits: input.credits,

          visibility: input.visibility,

          updatedAt: new Date(input.updatedAt),
        },
      });

      return presentation;
    }),

  deleteById: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      const presentation = await db.presentations.findUnique({
        where: { id: input },
      });

      if (!presentation) {
        throw new Error("Presentation not found");
      }

      const fileKeys = [
        presentation.logoId,
        presentation.coverId,
        presentation.presentationId,
        presentation.handoutId,
        presentation.researchId,
      ].filter((key): key is string => key !== null);

      for (const fileKey of fileKeys) {
        const file = await db.files.findUnique({
          where: { id: fileKey },
        });

        if (!file) {
          throw new Error("File not found");
        }

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

        await db.files.delete({
          where: { id: file.id },
        });
      }

      await db.presentations.delete({
        where: { id: input },
      });

      return;
    }),
});
