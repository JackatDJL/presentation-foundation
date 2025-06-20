import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";

import type { UploadthingRouter } from "~/app/api/uploadthing/core";

export const UploadButton = generateUploadButton<UploadthingRouter>();
export const UploadDropzone = generateUploadDropzone<UploadthingRouter>();
