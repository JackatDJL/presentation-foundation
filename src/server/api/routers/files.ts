import { eq, not, and } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";
import { del, put } from "@vercel/blob";
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
        ufsKey: z.string().length(48),
        url: z.string().url(),

        presentationId: z.string().uuid(),
        owner: z.string().length(32),
      }),
    )
    .query(async ({ input }) => {
      const file: typeof files.$inferInsert = {
        id: crypto.randomUUID(),
        name: input.name,
        fileType: input.fileType,
        dataType: input.dataType,
        size: input.size,

        ufsKey: input.ufsKey,
        url: input.url,

        storedIn: "utfs",
        targetStorage: "blob",
        transferStatus: "queued",

        isLocked: false,

        presentationId: input.presentationId,
        owner: input.owner,

        createdAt: new Date(),
        updatedAt: new Date(),
      };
      // console.log("Inserting Data into Database", file);

      const response = await db.insert(files).values(file).returning();

      // console.log("Inserted Data into Database", response);

      // console.log("Configuring Presentation to point to File");

      const presentation = await db
        .update(presentations)
        .set({
          [input.fileType]: response[0]?.id,
          updatedAt: new Date(),
        })
        .where(eq(presentations.id, input.presentationId))
        .returning();

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
      let filles = await db.select().from(files).where(eq(files.id, input));
      const file = filles[0];

      if (!file || file.transferStatus === "in progress") {
        throw new Error("File not found or currently Trancending Servers");
      }
      // Immediatly remove the file from the queue so that the file doesnt get lost trancending servers
      if (file.transferStatus === "queued") {
        filles = await db
          .update(files)
          .set({
            targetStorage: file.storedIn,
            transferStatus: "idle",
          })
          .where(eq(files.id, input))
          .returning();
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
  transfers: createTRPCRouter({
    run: publicProcedure.mutation(async () => {
      // First set all the files wo are idle and storedIn !== targetStorage to queued
      // This will probably only be called if i manually move around files between storage services

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      await db
        .update(files)
        .set({
          transferStatus: "queued",
        })
        .where(
          and(
            eq(files.transferStatus, "idle"),
            not(eq(files.storedIn, files.targetStorage)),
          ),
        );

      await db
        .update(files)
        .set({
          transferStatus: "idle",
        })
        .where(
          and(
            not(eq(files.transferStatus, "idle")),
            eq(files.storedIn, files.targetStorage),
          ),
        );

      // Then get all to be transferred files
      const filesToTransfer = await db
        .select()
        .from(files)
        .where(eq(files.transferStatus, "queued"));

      // For each file, transfer it
      for (const file of filesToTransfer) {
        // Set Status
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const updatestatus = await db
          .update(files)
          .set({
            transferStatus: "in progress",
          })
          .where(eq(files.id, file.id));

        const blob = await fetch(file.url).then((res) => res.blob());

        if (blob.size !== file.size) {
          console.warn(
            "Blob is Corrupted (Or Cloudflare making issues again), Aborting transfer",
          );
          await db
            .update(files)
            .set({
              transferStatus: "idle",
            })
            .where(eq(files.id, file.id));
          continue;
        }

        let up_success = false;
        // Transfer
        switch (file.targetStorage) {
          case "utfs":
            try {
              const up_utfs_response = await utapi.uploadFilesFromUrl(file.url);

              await db
                .update(files)
                .set({
                  ufsKey: up_utfs_response.data?.key,
                  url: up_utfs_response.data?.ufsUrl,
                })
                .where(eq(files.id, file.id));
            } catch (error) {
              console.error(error);
            } finally {
              up_success = true;
            }
            break;
          case "blob":
            try {
              const up_blob_response = await put(
                `pr/${process.env.NODE_ENV}/${file.owner}/${file.name}`,
                blob,
                {
                  access: "public",
                },
              );
              await db
                .update(files)
                .set({
                  blobPath: up_blob_response.pathname,
                  url: up_blob_response.url,
                })
                .where(eq(files.id, file.id));
            } catch (error) {
              console.error(error);
            } finally {
              up_success = true;
            }
            break;
        }

        if (!up_success) {
          throw new Error("Failed to transfer file");
        }

        // Delete old file
        let del_success = false;
        switch (file.storedIn) {
          case "utfs":
            try {
              if (!file.ufsKey) {
                throw new Error("No Key Provided");
              }
              const del_utfs_response = await utapi.deleteFiles(file.ufsKey);
              if (
                !del_utfs_response.success ||
                del_utfs_response.deletedCount !== 1
              ) {
                throw new Error("Failed to delete file");
              }

              await db
                .update(files)
                .set({
                  ufsKey: null,
                })
                .where(eq(files.id, file.id));
            } catch (error) {
              console.error(error);
            } finally {
              del_success = true;
            }
            break;
          case "blob":
            try {
              if (!file.blobPath) {
                throw new Error("No Path Provided");
              }
              await del(file.blobPath);

              await db
                .update(files)
                .set({
                  blobPath: null,
                })
                .where(eq(files.id, file.id));
            } catch (error) {
              console.error(error);
            } finally {
              del_success = true;
            }
            break;
        }

        if (!del_success) {
          throw new Error("Failed to delete file");
        }

        // Set Status and storage
        await db
          .update(files)
          .set({
            storedIn: file.targetStorage,
            transferStatus: "idle",
          })
          .where(eq(files.id, file.id));
      }
    }),
  }),
});
