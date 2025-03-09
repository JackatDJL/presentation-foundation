import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";
import { files, presentations } from "~/server/db/schema";
import { utapi } from "~/server/uploadthing";
import * as argon2 from "argon2";
import crypto from "crypto";

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

  deleteById: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      // Check if the file exists
      const filles = await db.select().from(files).where(eq(files.id, input));
      const file = filles[0];

      if (!file) {
        throw new Error("File not found");
      }
      // Get the presentationId and the filetype

      // Delete the file from uploadthing
      const deletionResponse = await utapi.deleteFiles(file.key);
      if (!deletionResponse.success || deletionResponse.deletedCount !== 1) {
        throw new Error("Failed to delete file");
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

      return;
    }),
  // toggle locked with password
  editLock: publicProcedure
    .input(
      z.object({
        fileId: z.string().uuid(),
        procedure: z.enum(["lock", "unlock", "changePassword"]),
        oldPassword: z.string().optional(),
        newPassword: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const tfile = await db
        .select()
        .from(files)
        .where(eq(files.id, input.fileId));

      const file = tfile[0];

      if (!file) {
        return {
          success: false,
          code: "ex.404.file",
          message: "File not found",
        };
      }

      if (file.fileType !== "presentation") {
        return {
          success: false,
          code: "ex.400.file",
          message: "Filetype is not a presentation",
        };
      }

      if (
        (input.procedure === "changePassword" &&
          (!file.password || !input.oldPassword || !input.newPassword)) ||
        (input.procedure === "lock" && (file.password || !input.newPassword)) ||
        (input.procedure === "unlock" && (!file.password || !input.oldPassword))
      ) {
        return {
          success: false,
          code: "ex.400.type",
          message: "Invalid operation for the current input",
        };
      }

      switch (input.procedure) {
        case "changePassword": {
          if (!file.password) {
            throw new Error("Error unreachable");
          }
          if (!input.oldPassword) {
            return {
              success: false,
              code: "ex.400.password",
              message: "Old password is required",
            };
          }

          const hashedPassword = crypto
            .createHash("sha256")
            .update(input.oldPassword)
            .digest("hex");

          const match = await argon2.verify(file.password, hashedPassword);
          if (!match) {
            return {
              success: false,
              code: "ex.401.password",
              message: "Incorrect password",
            };
          }

          const response = await db
            .update(files)
            .set({
              password: input.newPassword
                ? await argon2.hash(input.newPassword)
                : null,
              updatedAt: new Date(),
            })
            .where(eq(files.id, input.fileId));

          return {
            success: true,
            code: "sc.200.success",
            response: response,
            message: "Password changed",
          };
        }
        case "lock": {
          if (file.password || !input.newPassword) {
            throw new Error("Error unreachable");
          }

          const prehash = crypto
            .createHash("sha256")
            .update(input.newPassword)
            .digest("hex");

          const hash = await argon2.hash(prehash);

          const response = await db
            .update(files)
            .set({
              isLocked: true,
              password: hash,
              updatedAt: new Date(),
            })
            .where(eq(files.id, input.fileId));

          return {
            success: true,
            code: "sc.200.success",
            response: response,
            message: "File locked",
          };
        }
        case "unlock": {
          if (!file.password || !input.oldPassword) {
            throw new Error("Error unreachable");
          }

          const prehash = crypto
            .createHash("sha256")
            .update(input.oldPassword)
            .digest("hex");

          const match = await argon2.verify(file.password, prehash);
          if (!match) {
            return {
              success: false,
              code: "ex.401.password",
              message: "Incorrect password",
            };
          }

          const response = await db
            .update(files)
            .set({
              isLocked: false,
              password: null,
              updatedAt: new Date(),
            })
            .where(eq(files.id, input.fileId));

          return {
            success: true,
            code: "sc.200.success",
            response: response,
            message: "File unlocked",
          };
        }
        default:
          throw new Error("Error Unreachable");
      }
    }),
  verifyPassword: publicProcedure
    .input(
      z.object({
        fileId: z.string().uuid(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const tfile = await db
        .select()
        .from(files)
        .where(eq(files.id, input.fileId));

      const file = tfile[0];

      if (!file) {
        return {
          success: false,
          code: "ex.404.file",
          message: "File not found",
        };
      }

      if (!file.password) {
        return {
          success: false,
          code: "ex.400.password",
          message: "File is not password protected",
        };
      }

      const hashedPassword = crypto
        .createHash("sha256")
        .update(input.password)
        .digest("hex");

      const match = await argon2.verify(file.password, hashedPassword);

      return {
        success: match,
        code: match ? "sc.200.success" : "ex.401.password",
        message: match ? "Password verified" : "Incorrect password",
      };
    }),
});
