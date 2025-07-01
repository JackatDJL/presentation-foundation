import ManagePresentations from "./core";
import { api } from "~/trpc/server";
import type { Metadata } from "next";
import auth from "@/src/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
  const authData = await auth.api.getSession({ headers: await headers() });

  if (!authData) {
    redirect("/sign-in");
  }

  const presentation = await api.recent.pullByUID({
    uid: authData.user.id,
  });

  return <ManagePresentations presentation={presentation} />;
}
