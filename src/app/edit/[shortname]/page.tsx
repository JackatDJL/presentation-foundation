import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { api } from "~/trpc/server";
import { EditPage as ThEditPage } from "./core";
import PresentationNotFound from "~/components/prnotfound";
import Unauthorized from "~/components/unauth";
import { cleanup } from "~/components/shortname-routing";

interface Props {
  params: Promise<{
    shortname: string;
  }>;
}

// TODO: Implement Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shortname } = await params;

  const data = await api.presentations.getByShortname(shortname);
  if (!data) return {};

  return {
    title: `Edit ${data.title} - Presentation Foundation by @DJL`,
    description: `Edit ${data.title} on The Presentation Foundation.`,
    openGraph: {
      title: `Edit ${data.title} - Presentation Foundation by @DJL`,
      description: `Edit ${data.title} on The Presentation Foundation.`,
    },
    robots: {
      index: false,
      follow: true,
    },
    twitter: {
      title: `Edit ${data.title} - Presentation Foundation by @DJL`,
      description: `Edit ${data.title} on The Presentation Foundation.`,
    },
    classification: "Private",
  };
}

export default async function EditPage({ params }: Props) {
  const user = await auth.protect();
  await cleanup();

  const { shortname } = await params;
  const data = await api.presentations.getByShortname(shortname);

  if (!data) {
    return <PresentationNotFound />;
  }

  if (user.userId !== data.owner) {
    return <Unauthorized edit />;
  }

  return (
    <main className="flex justify-center">
      <ThEditPage id={data.id} />
    </main>
  );
}
