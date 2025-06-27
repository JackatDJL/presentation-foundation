import {
  clerkMiddleware,
  createRouteMatcher,
  currentUser,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
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

// Route Matchers for different paths
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
const isFreeTier = createRouteMatcher(["/([^/]+)/([^/]+)"]); // Matches /username/shortname
const isUserProfile = createRouteMatcher(["^/([^/]+)$"]); // Matches /username (single path segment)
const isProTier = createRouteMatcher(["/!([^/]+)"]); // Matches /!shortname

const isOrgRedirect = createRouteMatcher(["/org"]);
const isSettingsRoute = createRouteMatcher(["/settings"]);
const isManageRoute = createRouteMatcher(["/manage"]);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isListRoute = createRouteMatcher(["/list"]);

/**
 * Checks if the given hostname corresponds to an organization subdomain.
 * Example: `example-org.pr.djl.foundation`
 * @param hostname The hostname to check.
 * @returns True if it's an org subdomain, false otherwise.
 */
function isOrg(hostname: string) {
  const baseDomain = ".pr.djl.foundation";
  // Checks if the hostname ends with the base domain and is not the base domain itself.
  return hostname.endsWith(baseDomain) && hostname !== `pr${baseDomain}`;
}

/**
 * Checks if the current environment is development or a Vercel preview deployment.
 * @param hostname The hostname to check.
 * @returns True if it's a dev/preview environment, false otherwise.
 */
function isDev(hostname: string) {
  return hostname === "localhost" || hostname.endsWith(".vercel.app");
}

const isRootRoute = createRouteMatcher(["/"]); // Matches the root path "/"

export default clerkMiddleware(async (auth, req) => {
  const { pathname, hostname: originalHostname, searchParams } = req.nextUrl;
  let effectiveHostname = originalHostname; // This hostname is used for internal middleware logic (e.g., `isOrg` checks).

  console.log(
    `[Middleware] Incoming request: Original Hostname=${originalHostname}, Pathname=${pathname}, SearchParams=${searchParams.toString()}`,
  );

  // Determine the base origin for external redirects.
  // In development/preview environments, this must point back to the actual deployment URL (e.g., localhost:3000 or my-branch.vercel.app).
  // In production, it's simply the request's origin.
  const protocol = req.nextUrl.protocol;
  const port = req.nextUrl.port ? ":" + req.nextUrl.port : "";
  let redirectBaseOrigin: string;

  // DX: Simulate subdomain for local/preview environments
  if (isDev(originalHostname)) {
    // For redirects, always use the original deployment hostname (e.g., my-branch.vercel.app or localhost).
    redirectBaseOrigin = `${protocol}://${originalHostname}${port}`;

    const subdomainParam = searchParams.get("subdomain");

    if (subdomainParam) {
      console.log(`[Middleware] DX: Simulating subdomain: ${subdomainParam}`);
      // Update effectiveHostname for internal routing logic to reflect the simulated subdomain.
      effectiveHostname = `${subdomainParam}.pr.djl.foundation`;
    } else {
      console.log(
        `[Middleware] DX: No subdomain param, defaulting effective hostname to main domain.`,
      );
      // For internal logic, if no subdomain param, treat it as the main domain.
      effectiveHostname = `pr.djl.foundation`;
    }
    console.log(
      `[Middleware] DX: Effective Hostname for logic = ${effectiveHostname}`,
    );
    console.log(
      `[Middleware] DX: Redirect Base Origin for external redirects = ${redirectBaseOrigin}`,
    );
  } else {
    // Not a dev environment, so effectiveHostname is the same as originalHostname.
    // The redirect base origin is simply the current request's origin.
    redirectBaseOrigin = req.nextUrl.origin;
  }

  const authData = await auth(); // Fetch authentication data once
  console.log(
    `[Middleware] Auth Data: userId=${authData.userId}, orgSlug=${authData.orgSlug}`,
  );

  // Scenario 1: On a simulated/real organization subdomain, and accessing Auth/Legal/Management/Org-Management routes.
  // These routes should always be handled on the main domain.
  if (isOrg(effectiveHostname)) {
    // Use effectiveHostname for the logic check
    console.log(
      "[Middleware] Scenario 1: On Org Subdomain, checking Auth/Legal/Management/Org-Management routes",
    );
    if (
      isAuth(req) ||
      isLegal(req) ||
      isManagement(req) ||
      isOrgManagement(req)
    ) {
      // Redirect to the main domain of the current deployment.
      // This means using `redirectBaseOrigin` and ensuring no `subdomain` query parameter.
      const targetUrl = new URL(pathname, redirectBaseOrigin);
      targetUrl.searchParams.delete("subdomain"); // Remove subdomain param for main domain redirect
      console.log(
        `[Middleware] Redirecting to main domain: ${targetUrl.toString()}`,
      );
      return NextResponse.redirect(targetUrl);
    }
  }

  // Scenario 2: On the main domain, and accessing Management/Org-Management routes, and the user has an organization.
  // Redirect them to their organization's subdomain.
  if (!isOrg(effectiveHostname)) {
    // Use effectiveHostname for the logic check
    console.log(
      "[Middleware] Scenario 2: On Main Domain, checking Management/Org-Management routes",
    );
    const userOrgSlug = authData.orgSlug;
    console.log(`[Middleware] User Org Slug: ${userOrgSlug}`);

    if (userOrgSlug && (isManagement(req) || isOrgManagement(req))) {
      // Redirect to the organization subdomain of the current deployment.
      // This means using `redirectBaseOrigin` and adding the `subdomain` query parameter.
      const targetUrl = new URL(pathname, redirectBaseOrigin);
      targetUrl.searchParams.set("subdomain", userOrgSlug);
      console.log(
        `[Middleware] Redirecting to org subdomain: ${targetUrl.toString()}`,
      );
      return NextResponse.redirect(targetUrl);
    }
  }

  // Handle `/org` redirect: always redirect to `/settings`.
  if (isOrgRedirect(req)) {
    console.log("[Middleware] Handling /org redirect");
    // Redirect to /settings on the current base origin, preserving existing search parameters.
    const targetUrl = new URL("/settings", redirectBaseOrigin);
    targetUrl.search = req.nextUrl.search; // Preserve search params
    console.log(
      `[Middleware] Redirecting /org to /settings: ${targetUrl.toString()}`,
    );
    return NextResponse.redirect(targetUrl);
  }

  // Intelligent `/settings` redirect:
  // If on the main domain and accessing `/settings`:
  // - If the user has an organization, redirect to the organization's settings page on its subdomain.
  // - Otherwise (personal account), redirect to `/profile`.
  if (isSettingsRoute(req) && !isOrg(effectiveHostname)) {
    // Use effectiveHostname for the logic check
    console.log("[Middleware] Intelligent /settings redirect");
    const userOrgSlug = authData.orgSlug;
    if (userOrgSlug) {
      // Redirect to organization subdomain settings.
      const targetUrl = new URL(pathname, redirectBaseOrigin);
      targetUrl.searchParams.set("subdomain", userOrgSlug);
      console.log(
        `[Middleware] Redirecting /settings to org subdomain: ${targetUrl.toString()}`,
      );
      return NextResponse.redirect(targetUrl);
    } else {
      // Redirect to /profile (personal account) on the current base origin, preserving search parameters.
      const targetUrl = new URL("/profile", redirectBaseOrigin);
      targetUrl.search = req.nextUrl.search; // Preserve search params
      console.log("[Middleware] Redirecting /settings to /profile");
      return NextResponse.redirect(targetUrl);
    }
  }

  // Intelligent `/manage` redirect:
  // If on the main domain and accessing `/manage`:
  // - If the user has an organization, redirect to the organization's manage page on its subdomain.
  // - Otherwise (personal account), redirect to `/list`.
  if (isManageRoute(req) && !isOrg(effectiveHostname)) {
    // Use effectiveHostname for the logic check
    console.log("[Middleware] Intelligent /manage redirect");
    const userOrgSlug = authData.orgSlug;
    if (userOrgSlug) {
      // Redirect to organization subdomain manage page.
      const targetUrl = new URL(pathname, redirectBaseOrigin);
      targetUrl.searchParams.set("subdomain", userOrgSlug);
      console.log(
        `[Middleware] Redirecting /manage to org subdomain: ${targetUrl.toString()}`,
      );
      return NextResponse.redirect(targetUrl);
    } else {
      // Redirect to /list (personal account) on the current base origin, preserving search parameters.
      const targetUrl = new URL("/list", redirectBaseOrigin);
      targetUrl.search = req.nextUrl.search; // Preserve search params
      console.log("[Middleware] Redirecting /manage to /list");
      return NextResponse.redirect(targetUrl);
    }
  }

  // Protect management routes, requiring authentication.
  if (isManagement(req)) {
    console.log("[Middleware] Handling Management route: protecting.");
    await auth.protect();
  }

  // Handle custom domains/orgs for internal rewrites.
  // The `req.url` here will correctly reflect the `effectiveHostname` due to the DX modification.
  if (isOrg(effectiveHostname)) {
    // Use effectiveHostname for the logic check
    console.log("[Middleware] Handling custom domains/orgs (rewrites)");
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
      const orgSlugFromEffectiveHostname = effectiveHostname.split(".")[0];
      const response = NextResponse.rewrite(
        new URL(`/internal/home/org/${orgSlugFromEffectiveHostname}`, req.url),
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
      const orgSlugFromEffectiveHostname = effectiveHostname.split(".")[0];
      const response = NextResponse.rewrite(
        new URL(
          `/internal/view/org/${orgSlugFromEffectiveHostname}/${shortname}`,
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

  // Handle User Profile (e.g., /username).
  if (isUserProfile(req)) {
    console.log("[Middleware] Handling User Profile route");
    const username = pathname.substring(1); // Remove leading slash
    console.log(`[Middleware] Extracted username: ${username}`);
    const userData = await currentUser(); // Fetch current user data from Clerk
    if (forbiddenNames.includes(username)) {
      console.log(
        "[Middleware] Username is forbidden, rewriting to /forbidden",
      );
      return NextResponse.rewrite(new URL("/forbidden", req.url));
    }

    // If the authenticated user's username matches the profile being viewed, redirect to the home page.
    if (authData.userId && userData?.username === username) {
      console.log(
        "[Middleware] Authenticated user matches profile, redirecting to home page.",
      );
      // Redirect to the main domain root, ensuring no subdomain param for personal home.
      const targetUrl = new URL("/", redirectBaseOrigin);
      targetUrl.searchParams.delete("subdomain"); // Remove subdomain param
      return NextResponse.redirect(targetUrl);
    }

    // Otherwise, rewrite to show the public user profile page.
    const response = NextResponse.rewrite(
      new URL(`/internal/profile/user/${username}`, req.url),
    );
    console.log(
      `[Middleware] Rewriting to /internal/profile/user: ${response.url}`,
    );
    response.headers.set("x-internal-no-evict", "true");
    return response;
  }

  // Handle Free Tier presentations (e.g., /username/shortname).
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

  // Handle Pro Tier presentations (e.g., /!shortname).
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

  // Handle Root Route (`/`) for the main domain.
  if (isRootRoute(req)) {
    console.log("[Middleware] Handling Root Route (main domain)");
    if (!authData.userId) {
      // If not authenticated, show the B2C hero page.
      const response = NextResponse.rewrite(
        new URL("/internal/hero/B2C", req.url),
      );
      console.log(
        `[Middleware] Rewriting to /internal/hero/B2C: ${response.url}`,
      );
      response.headers.set("x-internal-no-evict", "true");
      return response;
    }
    // If authenticated, show the user's home page.
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

// Configuration for the middleware matcher, specifying which paths it should run on.
export const config = {
  matcher: [
    // Skip Next.js internals (e.g., _next) and all static files.
    // The `[^?]*\\.(?:html?|css|js(?!on)|zip|webmanifest)` part ensures it runs
    // on paths that are not static files, unless they have a query parameter (like `?subdomain=`).
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|zip|webmanifest)).*)",
    // Always run for API and tRPC routes.
    "/(api|trpc)(.*)",
  ],
};
