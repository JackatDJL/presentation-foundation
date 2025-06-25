import { clerkMiddleware, createRouteMatcher, currentUser } from "@clerk/nextjs/server";
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
// example-org.pr.djl.foundation = organisation profile (if wanted) (intelligent routing for profile / org home)
// example-org.pr.djl.foundation/{shortname} = organisation presentation view for presentation "shortname"

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
