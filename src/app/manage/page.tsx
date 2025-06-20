import { auth } from "@clerk/nextjs/server";
import ManagePresentations from "./core";
import { api } from "~/trpc/server";
import { cleanup } from "~/components/shortname-routing";
import type { Metadata } from "next";

// TODO: Implement Metadata
export const metadata: Metadata = {
  title: "Manage Presentations - The Presentation Foundation",
  description: "Manage your Presentations on The Presentation Foundation.",
  openGraph: {
    title: "Manage Presentations - The Presentation Foundation",
    description: "Manage your Presentations on The Presentation Foundation.",
  },
  robots: {
    index: false,
    follow: true,
  },
  twitter: {
    title: "Manage Presentations - The Presentation Foundation",
    description: "Manage your Presentations on The Presentation Foundation.",
  },

  classification: "Private",
};

export default async function ManagePage() {
  const user = await auth.protect();
  await cleanup();
  const presentation = await api.recent.pullByUID({
    uid: user.userId,
  });

  return <ManagePresentations presentation={presentation} />;
}
