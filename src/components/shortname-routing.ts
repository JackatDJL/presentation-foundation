"use server";

import { headers } from "next/headers";

export interface SearchParams {
  dev?: string;
  shortname?: string;
  [key: string]: string | string[] | undefined;
}

/**
 * Determines if the current environment is in development mode
 */
export async function isDevMode(searchParams: SearchParams): Promise<boolean> {
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
  const headerList = await headers();
  const headersObject: Record<string, string> = {};

  headerList.forEach((value: string, key: string) => {
    headersObject[key] = value;
  });

  const shortname = searchParams.shortname;

  // If no shortname, no need to redirect
  if (!shortname) {
    return { redirectUrl: null, shouldRedirect: false };
  }

  // If we're already on the root path, no need to redirect
  if (currentPath === "/") {
    return { redirectUrl: null, shouldRedirect: false };
  }

  const isDev = await isDevMode(searchParams);

  if (isDev) {
    // In dev mode, we keep the shortname as a query parameter
    // but redirect to the root path
    const url = new URL(`https://${headersObject.host}`);
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
export async function getViewHref(
  searchParams: SearchParams,
  shortname: string,
): Promise<string> {
  // Abrufen des Host-Headers
  const headerList = await headers();
  const headersObject: Record<string, string> = {};

  headerList.forEach((value: string, key: string) => {
    headersObject[key] = value;
  });
  const host = headersObject.host ?? "";
  const isDev = await isDevMode(searchParams);

  if (isDev) {
    // In dev mode, verwende window.location.origin, da ein Query-Parameter angehängt wird
    const protocol =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? "http"
        : "https";
    const url = new URL("/", `${protocol}://${host}`);
    url.searchParams.set("shortname", shortname);
    if (searchParams.dev === "true") {
      url.searchParams.set("dev", "true");
    }
    return url.toString();
  } else {
    // In production, verwende das Subdomain-Format
    return `https://${shortname}.pr.djl.foundation/`;
  }
}

/**
 * Generates the correct href for the home page, removing shortname if needed
 * @param searchParams The current search parameters
 * @returns The URL for the home page
 */
export async function getHomeHref(searchParams: SearchParams): Promise<string> {
  const isDev = await isDevMode(searchParams);
  const headerList = await headers();
  const headersObject: Record<string, string> = {};

  headerList.forEach((value: string, key: string) => {
    headersObject[key] = value;
  });
  const host = headersObject.host ?? "pr.djl.foundation";

  if (isDev) {
    const protocol =
      host.includes("localhost") || host.includes("127.0.0.1")
        ? "http"
        : "https";
    const url = new URL("/", `${protocol}://${host}`);
    if (searchParams.dev === "true") {
      url.searchParams.set("dev", "true");
    }
    return url.toString();
  } else {
    // In production, always go to the main domain
    return "https://pr.djl.foundation/";
  }
}
