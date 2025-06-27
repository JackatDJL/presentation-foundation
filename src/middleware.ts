import { clerkMiddleware, createRouteMatcher, currentUser } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { forbiddenNames } from "./lib/constants";

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
 * - - /org redirects to /settings
 * - - /settings // Org Clerk Profile / if accessed on root then redirects to the currently selected org of the user (if personal account then just to /profile)
 * - - /profile/select // Root / Org Clerk Selector
 * - (legal) // Same as Always
 * - (management) // Only Root / Org Root
 * - - /manage // Root / Org Root / is the main management and settings page for organisations on normal users redirects to /list 
 * - - /list // Root / Org Root / e.g. old /manage
 * - - /edit/{shortname} // Root / Org Root
 * - - /create // Root / Org Root
 * - - (hidden routing)
 * - - - /_internal/hero // Only Rootdomain!
 * - - - /_internal/home // Rootdomain / Org Rootdomain
 * - - - /_internal/view/[shortname] // Also gets rewritten from /[username]/[shortname] on free tier as well as subdomains and orgs subdomains /[shortname]
 * - - - /_internal/layout.ts // File that checks for a cookie or header from middleware to only pass through to the only rewritten targeted routes if the middleware actualy wanted that to happen

* - / // the root page.tsx // but thanks to middleware inaccessible
 */

// Thinking about implementing different tables for free tier and pro tier and orgs e.g. saved under (free = username/shortname, pro = shortname, org = orgSlug/shortname) but thats just an example on how to store the shortnames and usernames in the database, not how to route them

// Internal Route set
// All internal routes are wraped by a layout.tsx file that checks for a cookie or header from the middleware to only pass through to the only rewritten targeted routes if the middleware actualy wanted that to happen
/**
 *  - /_internal/hero/B2C // Hero Page for Root Domain
 *  - /_internal/hero/B2B // Possible advertising page for orgs in the future // disregarded for now
 *  - /_internal/home/user // Will Partial Prerender this page and just input the username and then fetch with trpc // homepage for users on the root domain,
 *  - /_internal/home/org/[orgSlug] // Will Partial Prerender this page and just input the orgSlug and then fetch with trpc // homepage for orgs on the root domain,
 *  - /_internal/profile/org/[orgSlug] // Org Public facing page, only presentaitons that are public e.g. example-org.pr.djl.foundation
 *  - /_internal/profile/user/[username] // User Profile Page, e.g. pr.djl.foundation/username
 *  - /_internal/view/free/[username]/[shortname] // Free Tier Presentation View, e.g. pr.djl.foundation/username/shortname
 *  - /_internal/view/pro/[shortname] // Pro Tier Presentation View, e.g. pr.djl.foundation/!shortname
 *  - /_internal/view/org/[orgSlug]/[shortname] // Org Presentation View, e.g. example-org.pr.djl.foundation/shortname
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
  "/create(.*)",
]);
const isLegal = createRouteMatcher(["/terms(.*)", "/privacy(.*)"]);
const isOrgManagement = createRouteMatcher([
  "/org/create(.*)",
  "/org/settings(.*)",
  "/profile/select(.*)",
]);
// Free Tier is /(username *)/(shortname *)
const isFreeTier = createRouteMatcher(["/([^/]+)/([^/]+)"]);
// User Profile is /{username}
const isUserProfile = createRouteMatcher(["^/([^/]+)$"]);
// Pro Tier is /!(shortname *)
const isProTier = createRouteMatcher(["/!([^/]+)"]);

const isOrgRedirect = createRouteMatcher(["/org"]);
const isSettingsRoute = createRouteMatcher(["/settings"]);
const isManageRoute = createRouteMatcher(["/manage"]);
const isListRoute = createRouteMatcher(["/list"]);

function isOrg(req: NextRequest) {
  const { hostname } = req.nextUrl;
  return (
    hostname.endsWith(".pr.djl.foundation") && hostname !== "pr.djl.foundation"
  );
}

const isRootRoute = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname, hostname } = req.nextUrl;
  const authData = await auth(); // Fetch authData once
  

  // Scenario 1: On Org Subdomain, accessing Auth/Legal/Management/Org-Management routes
  if (isOrg(req)) {
    if (
      isAuth(req) ||
      isLegal(req) ||
      isManagement(req) ||
      isOrgManagement(req)
    ) {
      const redirectUrl = new URL(pathname, `https://pr.djl.foundation`);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Scenario 2: On Main Domain, accessing Management/Org-Management routes (and user has an org)
  if (!isOrg(req)) {
    const userOrgSlug = authData.orgSlug;

    if (userOrgSlug && (isManagement(req) || isOrgManagement(req))) {
      const redirectUrl = new URL(
        pathname,
        `https://${userOrgSlug}.pr.djl.foundation`,
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isOrgRedirect(req)) {
    return NextResponse.redirect(new URL("/settings", req.url));
  }

  // Intelligent /settings redirect
  if (isSettingsRoute(req) && !isOrg(req)) {
    const userOrgSlug = authData.orgSlug;
    if (userOrgSlug) {
      return NextResponse.redirect(new URL(pathname, `https://${userOrgSlug}.pr.djl.foundation`));
    } else {
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  // Intelligent /manage redirect
  if (isManageRoute(req) && !isOrg(req)) {
    const userOrgSlug = authData.orgSlug;
    if (userOrgSlug) {
      return NextResponse.redirect(new URL(pathname, `https://${userOrgSlug}.pr.djl.foundation`));
    } else {
      return NextResponse.redirect(new URL("/list", req.url));
    }
  }

  if (isAuth(req)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isManagement(req)) {
    await auth.protect();
  }

  // Handle custom domains/orgs
  if (isOrg(req)) {
    // For org root (e.g., example-org.pr.djl.foundation/)
    if (pathname === "/") {
      if (!authData.userId) {
        const response = NextResponse.rewrite(
          new URL("/_internal/hero/B2C", req.url),
        );
        response.headers.set("x-internal-no-evict", "true");
        return response;
      }
      const response = NextResponse.rewrite(
        new URL(`/_internal/home/org/${hostname.split('.')[0]}`, req.url),
      );
      response.headers.set("x-internal-no-evict", "true");
      return response;
    } else {
      // For org presentations (e.g., example-org.pr.djl.foundation/shortname)
      const shortname = pathname.substring(1); // Remove leading slash
      if (forbiddenNames.includes(shortname)) {
        return NextResponse.rewrite(new URL("/forbidden", req.url));
      }
      const response = NextResponse.rewrite(
        new URL(`/_internal/view/org/${hostname.split('.')[0]}/${shortname}`, req.url),
      );
      response.headers.set("x-internal-no-evict", "true");
      return response;
    }
  }

  // Handle User Profile (username)
  if (isUserProfile(req)) {
    const username = pathname.substring(1); // Remove leading slash
    const userData = await currentUser(); // Moved here
    if (forbiddenNames.includes(username)) {
      return NextResponse.rewrite(new URL("/forbidden", req.url));
    }

    // If authenticated user matches the profile, redirect to home
    if (authData.userId && userData?.username === username) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Otherwise, show the public user profile
    const response = NextResponse.rewrite(
      new URL(`/_internal/profile/user/${username}`, req.url),
    );
    response.headers.set("x-internal-no-evict", "true");
    return response;
  }

  // Handle Free Tier (username/shortname)
  if (isFreeTier(req)) {
    const parts = pathname.split("/");
    const username = parts[1];
    const shortname = parts[2];

    if (
      (username && forbiddenNames.includes(username)) ||
      (shortname && forbiddenNames.includes(shortname))
    ) {
      return NextResponse.rewrite(new URL("/forbidden", req.url));
    }
    const response = NextResponse.rewrite(
      new URL(`/_internal/view/free/${username}/${shortname}`, req.url),
    );
    response.headers.set("x-internal-no-evict", "true");
    return response;
  }

  // Handle Pro Tier (!shortname)
  if (isProTier(req)) {
    const shortname = pathname.substring(2); // Remove leading /!
    if (forbiddenNames.includes(shortname)) {
      return NextResponse.rewrite(new URL("/forbidden", req.url));
    }
    const response = NextResponse.rewrite(
      new URL(`/_internal/view/pro/${shortname}`, req.url),
    );
    response.headers.set("x-internal-no-evict", "true");
    return response;
  }

  // Handle Root Route (hero/home) for main domain
  if (isRootRoute(req)) {
    if (!authData.userId) {
      const response = NextResponse.rewrite(
        new URL("/_internal/hero/B2C", req.url),
      );
      response.headers.set("x-internal-no-evict", "true");
      return response;
    }
    const response = NextResponse.rewrite(new URL(`/_internal/home/user`, req.url));
    response.headers.set("x-internal-no-evict", "true");
    return response;
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
