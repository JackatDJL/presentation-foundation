import {
  clerkMiddleware,
  createRouteMatcher,
  currentUser,
} from "@clerk/nextjs/server";
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
 * - - - /internal/hero // Only Rootdomain!
 * - - - /internal/home // Rootdomain / Org Rootdomain
 * - - - /internal/view/[shortname] // Also gets rewritten from /[username]/[shortname] on free tier as well as subdomains and orgs subdomains /[shortname]
 * - - - /internal/layout.ts // File that checks for a cookie or header from middleware to only pass through to the only rewritten targeted routes if the middleware actualy wanted that to happen

* - / // the root page.tsx // but thanks to middleware inaccessible
 */

// Thinking about implementing different tables for free tier and pro tier and orgs e.g. saved under (free = username/shortname, pro = shortname, org = orgSlug/shortname) but thats just an example on how to store the shortnames and usernames in the database, not how to route them

// Internal Route set
// All internal routes are wraped by a layout.tsx file that checks for a cookie or header from the middleware to only pass through to the only rewritten targeted routes if the middleware actualy wanted that to happen
/**
 *  - /internal/hero/B2C // Hero Page for Root Domain
 *  - /internal/hero/B2B // Possible advertising page for orgs in the future // disregarded for now
 *  - /internal/home/user // Will Partial Prerender this page and just input the username and then fetch with trpc // homepage for users on the root domain,
 *  - /internal/home/org/[orgSlug] // Will Partial Prerender this page and just input the orgSlug and then fetch with trpc // homepage for orgs on the root domain,
 *  - /internal/profile/org/[orgSlug] // Org Public facing page, only presentaitons that are public e.g. example-org.pr.djl.foundation
 *  - /internal/profile/user/[username] // User Profile Page, e.g. pr.djl.foundation/username
 *  - /internal/view/free/[username]/[shortname] // Free Tier Presentation View, e.g. pr.djl.foundation/username/shortname
 *  - /internal/view/pro/[shortname] // Pro Tier Presentation View, e.g. pr.djl.foundation/!shortname
 *  - /internal/view/org/[orgSlug]/[shortname] // Org Presentation View, e.g. example-org.pr.djl.foundation/shortname
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
 * - /internal
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
  console.log(
    `[Middleware] Incoming request: Hostname=${hostname}, Pathname=${pathname}`,
  );
  const authData = await auth(); // Fetch authData once
  console.log(
    `[Middleware] Auth Data: userId=${authData.userId}, orgSlug=${authData.orgSlug}`,
  );

  // Scenario 1: On Org Subdomain, accessing Auth/Legal/Management/Org-Management routes
  if (isOrg(req)) {
    console.log(
      "[Middleware] Scenario 1: On Org Subdomain, checking Auth/Legal/Management/Org-Management routes",
    );
    if (
      isAuth(req) ||
      isLegal(req) ||
      isManagement(req) ||
      isOrgManagement(req)
    ) {
      const redirectUrl = new URL(pathname, `https://pr.djl.foundation`);
      console.log(
        `[Middleware] Redirecting to main domain: ${redirectUrl.toString()}`,
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Scenario 2: On Main Domain, accessing Management/Org-Management routes (and user has an org)
  if (!isOrg(req)) {
    console.log(
      "[Middleware] Scenario 2: On Main Domain, checking Management/Org-Management routes",
    );
    const userOrgSlug = authData.orgSlug;
    console.log(`[Middleware] User Org Slug: ${userOrgSlug}`);

    if (userOrgSlug && (isManagement(req) || isOrgManagement(req))) {
      const redirectUrl = new URL(
        pathname,
        `https://${userOrgSlug}.pr.djl.foundation`,
      );
      console.log(
        `[Middleware] Redirecting to org subdomain: ${redirectUrl.toString()}`,
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isOrgRedirect(req)) {
    console.log("[Middleware] Handling /org redirect");
    return NextResponse.redirect(new URL("/settings", req.url));
  }

  // Intelligent /settings redirect
  if (isSettingsRoute(req) && !isOrg(req)) {
    console.log("[Middleware] Intelligent /settings redirect");
    const userOrgSlug = authData.orgSlug;
    if (userOrgSlug) {
      console.log(
        `[Middleware] Redirecting /settings to org subdomain: https://${userOrgSlug}.pr.djl.foundation${pathname}`,
      );
      return NextResponse.redirect(
        new URL(pathname, `https://${userOrgSlug}.pr.djl.foundation`),
      );
    } else {
      console.log("[Middleware] Redirecting /settings to /profile");
      return NextResponse.redirect(new URL("/profile", req.url));
    }
  }

  // Intelligent /manage redirect
  if (isManageRoute(req) && !isOrg(req)) {
    console.log("[Middleware] Intelligent /manage redirect");
    const userOrgSlug = authData.orgSlug;
    if (userOrgSlug) {
      console.log(
        `[Middleware] Redirecting /manage to org subdomain: https://${userOrgSlug}.pr.djl.foundation${pathname}`,
      );
      return NextResponse.redirect(
        new URL(pathname, `https://${userOrgSlug}.pr.djl.foundation`),
      );
    } else {
      console.log("[Middleware] Redirecting /manage to /list");
      return NextResponse.redirect(new URL("/list", req.url));
    }
  }

  if (isAuth(req)) {
    console.log("[Middleware] Handling Auth route");
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isManagement(req)) {
    console.log("[Middleware] Handling Management route");
    await auth.protect();
  }

  // Handle custom domains/orgs
  if (isOrg(req)) {
    console.log("[Middleware] Handling custom domains/orgs");
    // For org root (e.g., example-org.pr.djl.foundation/)
    if (pathname === "/") {
      console.log("[Middleware] Org root path");
      if (!authData.userId) {
        const response = NextResponse.rewrite(
          new URL("/internal/hero/B2C", req.url),
        );
        console.log(
          `[Middleware] Rewriting to /internal/hero/B2C: ${response.url}`,
        );
        response.headers.set("x-internal-no-evict", "true");
        return response;
      }
      const response = NextResponse.rewrite(
        new URL(`/internal/home/org/${hostname.split(".")[0]}`, req.url),
      );
      console.log(
        `[Middleware] Rewriting to /internal/home/org: ${response.url}`,
      );
      response.headers.set("x-internal-no-evict", "true");
      return response;
    } else {
      // For org presentations (e.g., example-org.pr.djl.foundation/shortname)
      console.log("[Middleware] Org presentation path");
      const shortname = pathname.substring(1); // Remove leading slash
      console.log(`[Middleware] Extracted shortname: ${shortname}`);
      if (forbiddenNames.includes(shortname)) {
        console.log(
          "[Middleware] Shortname is forbidden, rewriting to /forbidden",
        );
        return NextResponse.rewrite(new URL("/forbidden", req.url));
      }
      const response = NextResponse.rewrite(
        new URL(
          `/internal/view/org/${hostname.split(".")[0]}/${shortname}`,
          req.url,
        ),
      );
      console.log(
        `[Middleware] Rewriting to /internal/view/org: ${response.url}`,
      );
      response.headers.set("x-internal-no-evict", "true");
      return response;
    }
  }

  // Handle User Profile (username)
  if (isUserProfile(req)) {
    console.log("[Middleware] Handling User Profile route");
    const username = pathname.substring(1); // Remove leading slash
    console.log(`[Middleware] Extracted username: ${username}`);
    const userData = await currentUser(); // Moved here
    if (forbiddenNames.includes(username)) {
      console.log(
        "[Middleware] Username is forbidden, rewriting to /forbidden",
      );
      return NextResponse.rewrite(new URL("/forbidden", req.url));
    }

    // If authenticated user matches the profile, redirect to home
    if (authData.userId && userData?.username === username) {
      console.log(
        "[Middleware] Authenticated user matches profile, redirecting to / ",
      );
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Otherwise, show the public user profile
    const response = NextResponse.rewrite(
      new URL(`/internal/profile/user/${username}`, req.url),
    );
    console.log(
      `[Middleware] Rewriting to /internal/profile/user: ${response.url}`,
    );
    response.headers.set("x-internal-no-evict", "true");
    return response;
  }

  // Handle Free Tier (username/shortname)
  if (isFreeTier(req)) {
    console.log("[Middleware] Handling Free Tier route");
    const parts = pathname.split("/");
    const username = parts[1];
    const shortname = parts[2];
    console.log(
      `[Middleware] Extracted username: ${username}, shortname: ${shortname}`,
    );

    if (
      (username && forbiddenNames.includes(username)) ||
      (shortname && forbiddenNames.includes(shortname))
    ) {
      console.log(
        "[Middleware] Username or shortname is forbidden, rewriting to /forbidden",
      );
      return NextResponse.rewrite(new URL("/forbidden", req.url));
    }
    const response = NextResponse.rewrite(
      new URL(`/internal/view/free/${username}/${shortname}`, req.url),
    );
    console.log(
      `[Middleware] Rewriting to /internal/view/free: ${response.url}`,
    );
    response.headers.set("x-internal-no-evict", "true");
    return response;
  }

  // Handle Pro Tier (!shortname)
  if (isProTier(req)) {
    console.log("[Middleware] Handling Pro Tier route");
    const shortname = pathname.substring(2); // Remove leading /!
    console.log(`[Middleware] Extracted shortname: ${shortname}`);
    if (forbiddenNames.includes(shortname)) {
      console.log(
        "[Middleware] Shortname is forbidden, rewriting to /forbidden",
      );
      return NextResponse.rewrite(new URL("/forbidden", req.url));
    }
    const response = NextResponse.rewrite(
      new URL(`/internal/view/pro/${shortname}`, req.url),
    );
    console.log(
      `[Middleware] Rewriting to /internal/view/pro: ${response.url}`,
    );
    response.headers.set("x-internal-no-evict", "true");
    return response;
  }

  // Handle Root Route (hero/home) for main domain
  if (isRootRoute(req)) {
    console.log("[Middleware] Handling Root Route (main domain)");
    if (!authData.userId) {
      const response = NextResponse.rewrite(
        new URL("/internal/hero/B2C", req.url),
      );
      console.log(
        `[Middleware] Rewriting to /internal/hero/B2C: ${response.url}`,
      );
      response.headers.set("x-internal-no-evict", "true");
      return response;
    }
    const response = NextResponse.rewrite(
      new URL(`/internal/home/user`, req.url),
    );
    console.log(
      `[Middleware] Rewriting to /internal/home/user: ${response.url}`,
    );
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
