import type { Metadata } from "next";
import { headers } from "next/headers";
import { env } from "~/env";
import { api } from "~/trpc/server";
import Hero from "~/components/hero";
import ViewPresentation from "~/components/view-presentation";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Home from "~/components/home";

interface SearchParams {
  dev?: string;
  shortname?: string;
}

async function getShortname(
  searchParams: SearchParams,
): Promise<string | null> {
  // Hole den Host aus den Request-Headern
  const headerList = await headers();
  const headersObject: Record<string, string> = {};

  headerList.forEach((value: string, key: string) => {
    headersObject[key] = value;
  });

  // console.log("Host:", headersObject);
  // console.log("Search Params:", searchParams);

  if (env.NODE_ENV === "development" || searchParams.dev === "true") {
    // console.log("Development mode");
    return searchParams.shortname ?? null;
  } else if (!headersObject.host?.endsWith(".pr.djl.foundation")) {
    // console.log("Not a subdomain");
    return null;
  } else {
    // console.log("Subdomain mode");
    const hostHeader = headersObject.host;
    if (!hostHeader) {
      // console.error("Host header is missing");
      return null;
    }
    // Extrahiere das Subdomain aus dem Host
    const subdomain = hostHeader.split(".")[0];
    // console.log("Subdomain:", subdomain);
    return subdomain ?? null;
  }
}

export async function generateMetadata(props: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const shortname = await getShortname(searchParams);

  if (!shortname) {
    return {
      title: "Presentation Foundation by @DJL",
    };
  }

  const presentation = await api.presentations.getByShortname(shortname);

  if (!presentation) {
    return {
      title: "Presentation Not Found - Presentation Foundation by @DJL",
    };
  }

  return {
    title: `${presentation.title} - Presentation Foundation by @DJL`,
    description:
      presentation.description ??
      "View this presentation on Presentation Foundation",
  };
}

export default async function Page(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  // console.log("Search Params:", searchParams);

  const shortname = await getShortname(searchParams);
  if (!shortname) {
    const user = await auth();
    if (!user.userId) {
      return <Hero />;
    }

    // TODO: return home
    return <Hero />;
  }

  const presentation = await api.presentations.getByShortname(shortname);
  // console.log("Presentation:", presentation);

  if (!presentation) {
    notFound();
  }

  return <ViewPresentation shortname={shortname} />;
}
