"use client";

interface SearchParams {
  dev?: string;
  shortname?: string;
  [key: string]: string | string[] | undefined;
}

/**
 * Determines if the current environment is in development mode
 */
export function isDevMode(searchParams: SearchParams): boolean {
  return process.env.NODE_ENV === "development" || searchParams.dev === "true";
}

/**
 * Handles routing based on shortname and current route
 * @param searchParams The search parameters from the URL
 * @param currentPath The current path (e.g., from usePathname())
 * @returns An object with the target URL and whether to redirect
 */
export async function handleShortnameRouting(
  searchParams: SearchParams,
  currentPath: string,
): Promise<{ redirectUrl: string | null; shouldRedirect: boolean }> {
  const shortname = searchParams.shortname;

  // If no shortname, no need to redirect
  if (!shortname) {
    return { redirectUrl: null, shouldRedirect: false };
  }

  // If we're already on the root path, no need to redirect
  if (currentPath === "/") {
    return { redirectUrl: null, shouldRedirect: false };
  }

  const isDev = isDevMode(searchParams);

  if (isDev) {
    // In dev mode, we keep the shortname as a query parameter
    // but redirect to the root path
    const url = new URL(window.location.origin);
    url.searchParams.set("shortname", shortname);
    if (searchParams.dev === "true") {
      url.searchParams.set("dev", "true");
    }

    return { redirectUrl: url.toString(), shouldRedirect: true };
  } else {
    // In production, redirect to the subdomain's root
    return {
      redirectUrl: `https://${shortname}.pr.djl.foundation/`,
      shouldRedirect: true,
    };
  }
}

/**
 * Generates the correct href for viewing a presentation
 * @param searchParams The current search parameters
 * @param shortname The shortname of the presentation
 * @returns The URL to view the presentation
 */
export function getViewHref(
  searchParams: SearchParams,
  shortname: string,
): string {
  const isDev = isDevMode(searchParams);

  if (isDev) {
    // In dev mode, use query parameters
    const url = new URL("/", window.location.origin);
    url.searchParams.set("shortname", shortname);
    if (searchParams.dev === "true") {
      url.searchParams.set("dev", "true");
    }
    return url.toString();
  } else {
    // In production, use subdomains
    return `https://${shortname}.pr.djl.foundation/`;
  }
}

/**
 * Generates the correct href for the home page, removing shortname if needed
 * @param searchParams The current search parameters
 * @returns The URL for the home page
 */
export function getHomeHref(searchParams: SearchParams): string {
  const isDev = isDevMode(searchParams);

  if (isDev) {
    // In dev mode, go to home but keep dev=true if it exists
    const url = new URL("/", window.location.origin);
    if (searchParams.dev === "true") {
      url.searchParams.set("dev", "true");
    }
    return url.toString();
  } else {
    // In production, always go to the main domain
    return "https://pr.djl.foundation/";
  }
}
