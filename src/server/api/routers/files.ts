import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { db } from "~/server/db";
import { del, put } from "@vercel/blob";
import { utapi } from "~/server/uploadthing";
import { type Prisma } from "@prisma/client";
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
      const file: Prisma.filesCreateInput = {
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

      const response = await db.files.create({
        data: file,
      });

      const presentation = await db.presentations.update({
        where: {
          id: input.presentationId,
        },
        data: {
          [input.fileType]: response.id,
          updatedAt: new Date(),
        },
      });

      return {
        file: response,
        presentation: presentation,
      };
    }),
  getById: publicProcedure.input(z.string()).query(async ({ input }) => {
    return db.files.findUnique({
      where: {
        id: input,
      },
    });
  }),

  deleteById: publicProcedure
    .input(z.string().uuid())
    .mutation(async ({ input }) => {
      // Check if the file exists
      let file = await db.files.findUnique({
        where: {
          id: input,
        },
      });

      if (!file) {
        throw new Error("File not found");
      }

      if (file.transferStatus === "in_progress") {
        throw new Error("File is currently being transferred");
      }

      // Immediatly remove the file from the queue so that the file doesnt get lost trancending servers
      if (file.transferStatus === "queued") {
        file = await db.files.update({
          where: {
            id: input,
          },
          data: {
            targetStorage: file.storedIn,
            transferStatus: "idle",
          },
        });
      }

      // Delete the file from the corresponding service
      switch (file.storedIn) {
        case "utfs": {
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
        }
        case "blob": {
          if (!file.blobPath) {
            throw new Error("No Path Provided");
          }
          await del(file.blobPath);
          break;
        }
      }

      // Update the presentation to remove the file
      await db.presentations.update({
        where: {
          id: file.presentationId,
        },
        data: {
          [file.fileType]: null,
          updatedAt: new Date(),
        },
      });

      // Delete the file from the database
      await db.files.delete({
        where: {
          id: input,
        },
      });

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
      const file = await db.files.findUnique({
        where: {
          id: input.fileId,
        },
      });

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

          const response = await db.files.update({
            where: {
              id: input.fileId,
            },
            data: {
              password: input.newPassword
                ? await argon2.hash(input.newPassword)
                : null,
              updatedAt: new Date(),
            },
          });

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

          const response = await db.files.update({
            where: {
              id: input.fileId,
            },
            data: {
              isLocked: true,
              password: hash,
              updatedAt: new Date(),
            },
          });

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

          const response = await db.files.update({
            where: {
              id: input.fileId,
            },
            data: {
              isLocked: false,
              password: null,
              updatedAt: new Date(),
            },
          });

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
      const file = await db.files.findUnique({
        where: {
          id: input.fileId,
        },
      });

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
      // TODO: Implement transfer monitoring with posthog
      // First set all the files wo are idle and storedIn !== targetStorage to queued
      // This will probably only be called if i manually move around files between storage services

      await db.$transaction(async (tx) => {
        // pull all idle
        // sort for ones where storedIn != targetStorage
        // update them to queued
        const idleFiles = await tx.files.findMany({
          where: {
            transferStatus: "idle",
          },
        });
        const filesToQueue = idleFiles.filter(
          (file) => file.storedIn !== file.targetStorage,
        );
        if (filesToQueue.length > 0) {
          await tx.files.updateMany({
            where: {
              id: {
                in: filesToQueue.map((file) => file.id),
              },
            },
            data: {
              transferStatus: "queued",
            },
          });
        }
      });

      // Then get all to be transferred files
      const filesToTransfer = await db.files.findMany({
        where: {
          transferStatus: "queued",
        },
      });

      // For each file, transfer it
      for (const file of filesToTransfer) {
        // Set Status
        await db.files.update({
          where: {
            id: file.id,
          },
          data: {
            transferStatus: "in_progress",
          },
        });

        const blob = await fetch(file.url).then((res) => res.blob());

        if (blob.size !== file.size) {
          console.warn(
            "Blob is Corrupted (Or Cloudflare making issues again), Aborting transfer",
          );
          await db.files.update({
            where: {
              id: file.id,
            },
            data: {
              transferStatus: "idle",
            },
          });
          // TODO: YANK SENTRY AND POSTHOG HERE
          console.warn("File transfer aborted");

          continue;
        }

        let up_success = false;
        // Transfer
        switch (file.targetStorage) {
          case "utfs":
            try {
              const up_utfs_response = await utapi.uploadFilesFromUrl(file.url);

              await db.files.update({
                where: {
                  id: file.id,
                },
                data: {
                  ufsKey: up_utfs_response.data?.key,
                  url: up_utfs_response.data?.ufsUrl,
                },
              });
              up_success = true;
            } catch (error) {
              console.error(error);
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
              await db.files.update({
                where: {
                  id: file.id,
                },
                data: {
                  blobPath: up_blob_response.pathname,
                  url: up_blob_response.url,
                },
              });
              up_success = true;
            } catch (error) {
              console.error(error);
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

              await db.files.update({
                where: {
                  id: file.id,
                },
                data: {
                  ufsKey: null,
                },
              });
              del_success = true;
            } catch (error) {
              console.error(error);
            }
            break;
          case "blob":
            try {
              if (!file.blobPath) {
                throw new Error("No Path Provided");
              }
              await del(file.blobPath);

              await db.files.update({
                where: {
                  id: file.id,
                },
                data: {
                  blobPath: null,
                },
              });
              del_success = true;
            } catch (error) {
              console.error(error);
            }
            break;
        }

        if (!del_success) {
          throw new Error("Failed to delete file");
        }

        await db.files.update({
          where: {
            id: file.id,
          },
          data: {
            storedIn: file.targetStorage,
            transferStatus: "idle",
            updatedAt: new Date(),
          },
        });
      }
    }),
  }),
});
