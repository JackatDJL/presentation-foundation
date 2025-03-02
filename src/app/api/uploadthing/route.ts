import { createRouteHandler } from "uploadthing/next";

import { UploadthingRouter } from "./core";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: UploadthingRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
