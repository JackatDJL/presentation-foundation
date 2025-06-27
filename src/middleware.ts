import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

// Future Routing Structure
// Based on example routes
// example-org
// example-user

// oh villeicht kauf ich mir pr-fnd.de oder so weil ist kürzer als pr.djl.foundation

// pr.djl.foundation = root (intelligent routing for hero / home)
// pr.djl.foundation/{example-user}/{shortname} = presentation view for presentation "shortname" - Free Tier
// pr.djl.foundation/!{shortname} = presentation view for presentation "shortname" - Pro Tier
// pr.djl.foundation/{example-user} = user profile w/public presentations - intelligent routing (e.g. if auth().user == example-user redirect to /)
// example-org.pr.djl.foundation = organisation profile (if wanted) (intelligent routing for profile / org home) // Alias Org-Root
// example-org.pr.djl.foundation/{shortname} = organisation presentation view for presentation "shortname"+

// Integration für Custom Domains (Pro Org)
// e.g. subdomain.yourdomain.com (example: keynotes.hackclub-stade.de) // Need ideas on how to implement, maybe just a cname to pr.djl.foundation works? or does double cnames not work? e.g. customdomain.com -> pr.djl.foundation -> cname.vercel.com. or smth

// Needed Route List
/**
 * - (auth) // Same as Always // Below new stuff
 * - - /org/create // Root
 * - - /org/settings // Root / Org Clerk Profile / if on custom subdomain or domain /settings gets rewritten to /org/settings
 * - - /profile/select // Root / Org Clerk Selector
 * - (legal) // Same as Always
 * - (management) // Only Root / Org Root
 * - - /manage // Root / Org Root / needs revamped ui
 * - - /edit/{shortname} // Root / Org Root
 * - - /create // Root / Org Root
 * - - (hidden routing)
 * - - - /_internal/hero // Only Rootdomain!
 * - - - /_internal/home // Rootdomain / Org Rootdomain
 * - - - /_internal/view/[shortname] // Also gets rewritten from /[username]/[shortname] on free tier as well as subdomains and orgs subdomains /[shortname]
 * - - - /_internal/layout.ts // File that checks for a cookie or header from middleware to only pass through to the only rewritten targeted routes if the middleware actualy wanted that to happen

* - / // the root page.tsx // but thanks to middleware inaccessible
 */

// Route List: (current / old way)
/**
 * - (auth) // Mostly only root routes
 * - - /sign-in // Everywhere
 * - - /sign-up // Root
 * - - /pricing // Root
 * - - /waitlist // Root
 * - - /profile // Root
 * - (legal) // Root
 * - - /terms // Root
 * - - /privacy // Root
 * - (management) // Only Root / Org Root
 * - - /manage
 * - - /edit/{shortname}
 * - - /create
 * - / // Presentation View, Hero, Home and more...
 */

// Forbidden User and Shortnames:
/**
 * - /sign-in
 * - /sign-up
 * - /pricing
 * - /waitlist
 * - /profile
 * - /terms
 * - /privacy
 * - /manage
 * - /edit
 * - /create
 * - /org
 * - /settings
 * - /select
 * - /hero
 * - /home
 * - /view
 * - /layout
 * - /_internal
 * - /_next
 * - /api
 * - /trpc
 */

const forbiddenNames = [];

const isAuth = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pricing(.*)",
  "/waitlist(.*)",
  "/profile(.*)",
]);
const isManagement = createRouteMatcher([
  "/manage(.*)",
  "/edit/(.*)",
  "/create/(.*)",
]);
// Free Tier is /(username *)/(shortname *)
const isFreeTier = createRouteMatcher(["/([^/]+)/([^/]+)"]);
// Pro Tier is /!(shortname *)
const isProTier = createRouteMatcher(["/!([^/]+)"]);

function isOrg(req: NextRequest) {
  const { hostname } = req.nextUrl;
  return hostname.includes(".pr.djl.foundation");
}

// returns "user-profile" | "presentation-view" | "org-profile" | "hero" | "home"

const isRootRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  if (isAuth(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (isManagement(req)) {
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
