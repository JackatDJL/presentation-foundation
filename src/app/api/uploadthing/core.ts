/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/only-throw-error */
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

import { auth } from "@clerk/nextjs/server";

// FileRouter for your app, can contain multiple FileRoutes
export const UploadthingRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  presentationUploader: f({
    "application/vnd.apple.keynote": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      {
        maxFileSize: "16MB",
        maxFileCount: 1,
      },
    "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.oasis.opendocument.presentation": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.ms-powerpoint": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
    "application/vnd.openxmlformats-officedocument.presentationml.slide": {
      maxFileSize: "16MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const Auth = auth();
      if (!(await Auth).userId) throw new UploadThingError("Unauthorized");

      return { userId: (await Auth).userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File Data", file);

      console.log("file url", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type UploadthingRouter = typeof UploadthingRouter;
