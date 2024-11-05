import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Create Next.js API route using the FileRouter
// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
