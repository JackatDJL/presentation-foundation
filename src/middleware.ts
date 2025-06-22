import {
  clerkMiddleware,
  createRouteMatcher,
  currentUser,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isExternalAuthRoutes = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/waitlist(.*)",
]);
const isInternalRoutes = createRouteMatcher([
  "/profile(.*)",
  "/manage(.*)",
  "/edit/(.*)",
  "/create/(.*)",
]);

const isRootRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  if (isExternalAuthRoutes(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isInternalRoutes(req)) {
    await auth.protect();
  }
  if (isRootRoute(req)) {
    const authData = await auth();
    if (!authData.userId) {
      const response = NextResponse.rewrite(
        new URL("/_internal/hero", req.url),
      );
      response.headers.set("x-internal-no-evict", "true");
      return response;
    }

    const response = NextResponse.rewrite(new URL(`/_internal/home`, req.url));
    response.headers.set("x-internal-no-evict", "true");
    return response;

    // check if the request comes from a subdomain
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
