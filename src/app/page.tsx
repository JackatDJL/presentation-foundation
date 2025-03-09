import type { Metadata } from "next";
import { env } from "~/env";
import { api } from "~/trpc/server";
import Hero from "~/components/hero";
import ViewPresentation from "~/components/view-presentation";
import { notFound } from "next/navigation";

interface SearchParams {
  dev?: string;
  shortname?: string;
}

// Function to get shortname based on environment and URL
async function getShortname(
  searchParams: SearchParams,
): Promise<string | null> {
  if (typeof window !== "undefined") console.log(window);
  console.log("Search Params:", searchParams);

  const currentUrl =
    typeof window !== "undefined" ? window.location.hostname : "";
  console.log("Current URL:", currentUrl);

  if (env.NODE_ENV === "development" || searchParams.dev === "true") {
    console.log("Development mode");
    return searchParams.shortname ?? null;
  } else if (!currentUrl.endsWith(".pr.djl.foundation")) {
    console.log("Not a subdomain");
    return null;
  } else {
    console.log("Subdomain mode");
    // Extract the subdomain from the URL
    const subdomain = currentUrl.split(".")[0];
    console.log("Subdomain:", subdomain);
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
  console.log("Search Params:", searchParams);

  const shortname = await getShortname(searchParams);
  if (!shortname) {
    console.log("No shortname");
    return <Hero />;
  }

  const presentation = await api.presentations.getByShortname(shortname);

  console.log("Presentation:", presentation);
  if (!presentation) {
    notFound();
  }

  return <ViewPresentation shortname={shortname} />;
}
