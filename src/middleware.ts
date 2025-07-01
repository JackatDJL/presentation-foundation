import {
  type NextMiddleware,
  type NextRequest,
  NextResponse,
} from "next/server";
import { forbiddenNames } from "./lib/constants";
import auth from "#auth";

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

// MOVING OF OF CLERK

// Needed Route List
/**
 * - (auth) // Same as Always // Below new stuff
 * - - /org/create // Root
 * - - /org redirects to /settings
 * - - /settings // User / Org Settings Page
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

function isOrg(hostname: string) {
  const baseDomain = ".pr.djl.foundation";
  return hostname.endsWith(baseDomain) && hostname !== `pr${baseDomain}`;
}

function isDev(hostname: string) {
  return hostname === "localhost" || hostname.endsWith(".vercel.app");
}

const isRootRoute = createRouteMatcher(["/"]);

const debugFlag: boolean | "info" = false;

function log(message: string) {
  if (debugFlag !== false) {
    console.log(`[Middleware] LOG ${message}`);
  }
}

function debug(message: string) {
  if (debugFlag === true) {
    console.debug(`[Middleware] DEBUG ${message}`);
  }
}

function customRouter(): NextMiddleware {
  return async (request) => {
    const {
      pathname,
      hostname: originalHostname,
      searchParams,
    } = request.nextUrl;
    let effectiveHostname = originalHostname;
    const headers = request.headers;

    log(
      `Incoming request: Original Hostname=${originalHostname}, Pathname=${pathname}, SearchParams=${searchParams.toString()}`,
    );

    // Determine the base origin for external redirects.
    // In development/preview environments, this must point back to the actual deployment URL (e.g., localhost:3000 or my-branch.vercel.app).
    // In production, it's simply the request's origin.
    const protocol = request.nextUrl.protocol;
    const port = request.nextUrl.port ? ":" + request.nextUrl.port : "";
    debug(
      `Request Protocol=${protocol}, Port=${port}, Original Hostname=${originalHostname}`,
    );

    let redirectBaseOrigin: string;

    if (isDev(originalHostname)) {
      log(`DX: Detected development or preview environment.`);

      redirectBaseOrigin = `${protocol}://${originalHostname}${port}`;
      debug(`DX: Redirect Base Origin set to ${redirectBaseOrigin}`);

      const subdomainParam = searchParams.get("subdomain");
      debug(`DX: Subdomain parameter from search params: ${subdomainParam}`);

      if (subdomainParam) {
        log(`DX: Simulating subdomain: ${subdomainParam}`);

        effectiveHostname = `${subdomainParam}.pr.djl.foundation`;
      } else {
        log(
          `DX: No subdomain param, defaulting effective hostname to main domain.`,
        );

        effectiveHostname = `pr.djl.foundation`;
      }

      debug(`DX: Effective Hostname for logic = ${effectiveHostname}`);

      debug(
        `DX: Redirect Base Origin for external redirects = ${redirectBaseOrigin}`,
      );

      log(`DX: Exiting DX logic`);
    } else {
      redirectBaseOrigin = request.nextUrl.origin;
      debug(
        `Production: Redirect Base Origin set to ${redirectBaseOrigin} (request origin)`,
      );
    }

    const authData = await auth.api.getSession({ headers });

    let fullOrgData = null;
    if (authData?.session.activeOrganizationId) {
      fullOrgData = await auth.api.getFullOrganization({
        query: { organizationId: authData.session.activeOrganizationId },
        headers,
      });
    }

    debug(
      `Auth Data: userId=${authData?.user.id}, sessionId=${authData?.session.id}, orgId=${authData?.session.activeOrganizationId}, orgSlug=${fullOrgData?.slug}`,
    );

    // Scenario 1: On a simulated/real organization subdomain.
    if (isOrg(effectiveHostname)) {
      log(`Scenario 1: On Org Subdomain active`);
      if (
        isAuth(request) ||
        isLegal(request) ||
        isManagement(request) ||
        isOrgManagement(request)
      ) {
        const targetUrl = new URL(pathname, redirectBaseOrigin);
        targetUrl.searchParams.delete("subdomain");
        debug(
          `Redirecting from org subdomain to main domain: ${targetUrl.toString()}`,
        );

        log(`Redirecting to main domain: ${targetUrl.toString()}`);
        return NextResponse.redirect(targetUrl);
      }
    }

    // Scenario 2: On the main domain
    if (!isOrg(effectiveHostname)) {
      log(
        `Scenario 2: On Main Domain, checking Management/Org-Management routes`,
      );

      debug(`User Org Slug: ${fullOrgData?.slug}`);

      if (
        fullOrgData?.slug &&
        (isManagement(request) || isOrgManagement(request))
      ) {
        const targetUrl = new URL(pathname, redirectBaseOrigin);
        targetUrl.searchParams.set("subdomain", fullOrgData.slug);
        log(`Redirecting to org subdomain: ${targetUrl.toString()}`);
        return NextResponse.redirect(targetUrl);
      }
    }

    if (isOrgRedirect(request)) {
      log("Handling /org redirect");
      const targetUrl = new URL("/settings", redirectBaseOrigin);
      targetUrl.search = request.nextUrl.search;
      log(`Redirecting /org to /settings: ${targetUrl.toString()}`);
      return NextResponse.redirect(targetUrl);
    }

    if (isSettingsRoute(request) && !isOrg(effectiveHostname)) {
      log("Intelligent /settings redirect");
      if (fullOrgData?.slug) {
        const targetUrl = new URL(pathname, redirectBaseOrigin);
        targetUrl.searchParams.set("subdomain", fullOrgData.slug);
        log(`Redirecting /settings to org subdomain: ${targetUrl.toString()}`);
        return NextResponse.redirect(targetUrl);
      } else {
        const targetUrl = new URL("/profile", redirectBaseOrigin);
        targetUrl.search = request.nextUrl.search;
        log("Redirecting /settings to /profile");
        return NextResponse.redirect(targetUrl);
      }
    }

    if (isManageRoute(request) && !isOrg(effectiveHostname)) {
      log("Intelligent /manage redirect");
      if (fullOrgData?.slug) {
        const targetUrl = new URL(pathname, redirectBaseOrigin);
        targetUrl.searchParams.set("subdomain", fullOrgData.slug);
        log(`Redirecting /manage to org subdomain: ${targetUrl.toString()}`);
        return NextResponse.redirect(targetUrl);
      } else {
        const targetUrl = new URL("/list", redirectBaseOrigin);
        targetUrl.search = request.nextUrl.search;
        log("Redirecting /manage to /list");
        return NextResponse.redirect(targetUrl);
      }
    }

    if (isManagement(request)) {
      log("Handling Management route: protecting.");
      // await auth.protect();
      if (!authData) {
        log("No auth data found, redirecting to /sign-in");
        const targetUrl = new URL("/sign-in", redirectBaseOrigin);
        targetUrl.search = request.nextUrl.search;
        return NextResponse.redirect(targetUrl);
      }
    }

    if (isOrg(effectiveHostname)) {
      log("Handling custom domains/orgs (rewrites)");
      if (pathname === "/") {
        log("Org root path");
        if (!authData) {
          const response = NextResponse.rewrite(
            new URL("/internal/hero/B2C", request.url),
          );
          log(`Rewriting to /internal/hero/B2C: ${response.url}`);
          response.headers.set("x-internal-no-evict", "true");
          return response;
        }
        const orgSlugFromEffectiveHostname = effectiveHostname.split(".")[0];
        const response = NextResponse.rewrite(
          new URL(
            `/internal/home/org/${orgSlugFromEffectiveHostname}`,
            request.url,
          ),
        );
        log(`Rewriting to /internal/home/org: ${response.url}`);
        response.headers.set("x-internal-no-evict", "true");
        return response;
      } else {
        log("Org presentation path");
        const shortname = pathname.substring(1);
        log(`Extracted shortname: ${shortname}`);
        if (forbiddenNames.includes(shortname)) {
          log("Shortname is forbidden, rewriting to /forbidden");
          return NextResponse.rewrite(new URL("/forbidden", request.url));
        }
        const orgSlugFromEffectiveHostname = effectiveHostname.split(".")[0];
        const response = NextResponse.rewrite(
          new URL(
            `/internal/view/org/${orgSlugFromEffectiveHostname}/${shortname}`,
            request.url,
          ),
        );
        log(`Rewriting to /internal/view/org: ${response.url}`);
        response.headers.set("x-internal-no-evict", "true");
        return response;
      }
    }

    if (isUserProfile(request)) {
      log("Handling User Profile route");
      const username = pathname.substring(1);
      log(`Extracted username: ${username}`);
      if (forbiddenNames.includes(username)) {
        log("Username is forbidden, rewriting to /forbidden");
        return NextResponse.rewrite(new URL("/forbidden", request.url));
      }

      if (authData?.user.username === username) {
        log("Authenticated user matches profile, redirecting to home page.");
        const targetUrl = new URL("/", redirectBaseOrigin);
        targetUrl.searchParams.delete("subdomain");
        return NextResponse.redirect(targetUrl);
      }

      const response = NextResponse.rewrite(
        new URL(`/internal/profile/user/${username}`, request.url),
      );
      log(`Rewriting to /internal/profile/user: ${response.url}`);
      response.headers.set("x-internal-no-evict", "true");
      return response;
    }

    if (isFreeTier(request)) {
      log("Handling Free Tier route");
      const parts = pathname.split("/");
      const username = parts[1];
      const shortname = parts[2];
      log(`Extracted username: ${username}, shortname: ${shortname}`);

      if (
        (username && forbiddenNames.includes(username)) ||
        (shortname && forbiddenNames.includes(shortname))
      ) {
        log("Username or shortname is forbidden, rewriting to /forbidden");
        return NextResponse.rewrite(new URL("/forbidden", request.url));
      }
      const response = NextResponse.rewrite(
        new URL(`/internal/view/free/${username}/${shortname}`, request.url),
      );
      log(`Rewriting to /internal/view/free: ${response.url}`);
      response.headers.set("x-internal-no-evict", "true");
      return response;
    }

    if (isProTier(request)) {
      log("Handling Pro Tier route");
      const shortname = pathname.substring(2); // Remove leading /!
      log(`Extracted shortname: ${shortname}`);
      if (forbiddenNames.includes(shortname)) {
        log("Shortname is forbidden, rewriting to /forbidden");
        return NextResponse.rewrite(new URL("/forbidden", request.url));
      }
      const response = NextResponse.rewrite(
        new URL(`/internal/view/pro/${shortname}`, request.url),
      );
      log(`Rewriting to /internal/view/pro: ${response.url}`);
      response.headers.set("x-internal-no-evict", "true");
      return response;
    }

    if (isRootRoute(request)) {
      log("Handling Root Route (main domain)");
      if (!authData) {
        const response = NextResponse.rewrite(
          new URL("/internal/hero/B2C", request.url),
        );
        log(`Rewriting to /internal/hero/B2C: ${response.url}`);
        response.headers.set("x-internal-no-evict", "true");
        return response;
      }
      const response = NextResponse.rewrite(
        new URL(`/internal/home/user`, request.url),
      );
      log(`Rewriting to /internal/home/user: ${response.url}`);
      response.headers.set("x-internal-no-evict", "true");
      return response;
    }

    return NextResponse.next();
  };
}

export default customRouter();

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

function createRouteMatcher(patterns: string[]) {
  const regexes = patterns.map((pattern) => new RegExp(pattern));

  return (request: NextRequest) => {
    const { pathname } = request.nextUrl;
    return regexes.some((regex) => regex.test(pathname));
  };
}
