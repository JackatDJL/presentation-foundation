import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

// Combine with Clerk middleware
const middleware = async (req: NextRequest, event: NextFetchEvent) => {
  await clerkMiddleware()(req, event);
  const url = req.nextUrl;
  const hostname = req.headers.get("host") ?? "";
  const path = url.pathname;
  const searchParams = url.searchParams;

  // Skip for API routes and static files
  if (
    path.startsWith("/api") ||
    path.startsWith("/trpc") ||
    path.startsWith("/_next") ||
    /\.(html?|css|js|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)$/.exec(
      path,
    )
  ) {
    return NextResponse.next();
  }

  // Check if we're in development mode (including ?dev=true parameter)
  const isDev =
    process.env.NODE_ENV === "development" ||
    searchParams.get("dev") === "true";

  // Check if we're on a subdomain
  const isPrSubdomain = hostname.endsWith(".pr.djl.foundation");

  if (!isDev && isPrSubdomain && path !== "/") {
    // Redirect to the main domain
    const redirectUrl = new URL("https://pr.djl.foundation", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Continue with Clerk middleware
  return clerkMiddleware()(req, event);
};

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
