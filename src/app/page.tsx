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
  const currentUrl =
    typeof window !== "undefined" ? window.location.hostname : "";

  if (env.NODE_ENV === "development" || searchParams.dev === "true") {
    return searchParams.shortname ?? null;
  } else if (!currentUrl.endsWith(".pr.djl.foundation")) {
    return null;
  } else {
    // Extract the subdomain from the URL
    const subdomain = currentUrl.split(".")[0];
    return subdomain ?? null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
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

// Define the correct type for the Page component
interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const shortname = await getShortname(resolvedSearchParams);

  if (!shortname) {
    return <Hero />;
  }

  const presentation = await api.presentations.getByShortname(shortname);

  if (!presentation) {
    notFound();
  }

  return <ViewPresentation shortname={shortname} />;
}
