"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  forbiddenShortnames,
  type SearchParams,
} from "./shortname-routing-utility";
import { env } from "~/env";
import { type NextRequest } from "next/server";

/**
 * Determines if the current environment is in development mode
 */
export async function isDevMode(searchParams: SearchParams): Promise<boolean> {
  return process.env.NODE_ENV === "development" || searchParams.dev === "true";
}

/**
 * Type definition for the analyseRequest function's return value.
 * It indicates whether the request is from a subdomain, the shortname if applicable, and whether the request is in development mode.
 * @property {boolean} isSubdomain - Indicates if the request is from a subdomain
 * @property {string | null} shortname - The shortname if applicable, otherwise null
 * @property {boolean} isDev - Indicates if the request is in development mode
 */
type analyseRequestType = {
  state: {
    isSubdomain: boolean;
    isDev: boolean;
  };
  shortname: string | null;
  type: "root" | "org" | "";
};

// pr.djl.foundation = root
// orgname.pr.djl.foundation = org
// pr.djl.foundation/!shortname = shortname
//

/**
 * Analyzes an incoming request and extracts application-state-specific information.
 * @param request - A NextRequest object to analyze.
 * @return An object containing the analysis results, including whether the request is from a subdomain, the shortname if applicable, and whether the request is in development mode.
 */
async function analyseRequest({
  request,
}: {
  request: NextRequest;
}): Promise<analyseRequestType>;
/**
 * Analyzes a Clients State to extract application-state-specific information.
 * @param searchParams - Client side search parameters to analyze.
 * @return An object containing the analysis results, including whether the request is from a subdomain, the shortname if applicable, and whether the request is in development mode.
 */
async function analyseRequest({
  searchParams,
}: {
  searchParams?: SearchParams;
}): Promise<analyseRequestType>;
/**
 * Analyzes a request or search parameters to extract application-state-specific information.
 * Implemented to expose an endpoint for other functions with overloaded signatures.
 * @param request - A NextRequest object to analyze.
 * @param searchParams - Client side search parameters to analyze.
 * @return An object containing the analysis results, including whether the request is from a subdomain, the shortname if applicable, and whether the request is in development mode.
 * @throws An error if neither request nor searchParams is provided.
 */
async function analyseRequest({
  request,
  searchParams,
}: {
  request?: NextRequest;
  searchParams?: SearchParams;
}): Promise<analyseRequestType>;
async function analyseRequest({
  request,
  searchParams,
}: {
  request?: NextRequest;
  searchParams?: SearchParams;
}): Promise<analyseRequestType> {
  if (!request && !searchParams) {
    throw new Error("Either request or searchParams must be provided");
  }
  const headerList = request ? request.headers : await headers();
  const headersObject: Record<string, string> = {};

  headerList.forEach((value: string, key: string) => {
    headersObject[key] = value;
  });

  const params: URLSearchParams = searchParams
    ? new URLSearchParams(searchParams as Record<string, string>)
    : request
      ? request.nextUrl.searchParams
      : new URLSearchParams();

  if (env.NODE_ENV === "development" || params.get("dev") === "true") {
    // Dev Case
    return {
      isSubdomain: params.get("shortname") !== null,
      shortname: params.get("shortname"),
      isDev: true,
    };
  } else if (!headersObject.host?.endsWith(".pr.djl.foundation")) {
    // Host Case
    return {
      isSubdomain: false,
      shortname: null,
      isDev: false,
    };
  } else {
    // Subdomain Case
    const hostHeader = headersObject.host;
    if (!hostHeader) {
      // Sollte auch Host sein, aber vlt middleware fehler
      return {
        isSubdomain: false,
        shortname: null,
        isDev: false,
      };
    }

    const subdomain = hostHeader.split(".")[0];
    if (!subdomain || subdomain in forbiddenShortnames) {
      return {
        isSubdomain: false,
        shortname: null,
        isDev: false,
      };
    }
    return {
      isSubdomain: true,
      shortname: subdomain,
      isDev: false,
    };
  }
}

export { analyseRequest };

/**
 * Analyzes an incoming request to check wether its target is a root domain
 * @param request - A NextRequest object to analyze.
 */
async function isRootDomain({
  request,
}: {
  request: NextRequest;
}): Promise<boolean>;
/**
 * Analyzes a Clients State to check wether its target is a root domain
 * @param searchParams - Client side search parameters to analyze.
 */
async function isRootDomain({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<boolean>;
async function isRootDomain({
  searchParams,
  request,
}: {
  searchParams?: SearchParams;
  request?: NextRequest;
}): Promise<boolean> {
  const { isSubdomain } = await analyseRequest({
    searchParams,
    request,
  });
  return !isSubdomain;
}

export { isRootDomain };

/**
 * Cleans up the URL by removing subdomains of "pr.djl.foundation" and any "shortname" query parameters.
 * This function takes no input and does not return anything—it immediately redirects if cleanup is needed.
 */
export async function cleanup(): Promise<void> {
  const headerList = await headers();
  const headersObject: Record<string, string> = {};
  headerList.forEach((value, key) => {
    headersObject[key] = value;
  });

  const baseDomain = "pr.djl.foundation";
  const host = headersObject.host ?? "";
  let requiresCleanup = false;

  // Check if the current hostname is a subdomain of the base domain.
  if (host !== baseDomain && host.endsWith(`.${baseDomain}`)) {
    requiresCleanup = true;
  }

  // Retrieve the current URL from the referer header, or fallback to constructing one from the host.
  const referer = headersObject.referer ?? "";
  let currentUrl: URL;
  try {
    currentUrl = new URL(referer || `https://${host}`);
  } catch {
    currentUrl = new URL(`https://${host}`);
  }

  // Remove the "shortname" query parameter if it exists.
  if (currentUrl.searchParams.has("shortname")) {
    requiresCleanup = true;
    currentUrl.searchParams.delete("shortname");
  }

  if (!requiresCleanup) {
    return;
  }

  // Determine the protocol based on the host.
  const protocol =
    host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";

  // Always redirect to the base domain root.
  const url = new URL("/", `${protocol}://${baseDomain}`);

  // Preserve the "dev" flag if it exists in the current query string.
  if (currentUrl.searchParams.get("dev") === "true") {
    url.searchParams.set("dev", "true");
  }

  // Immediately perform the redirect.
  redirect(url.toString());
  return;
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
