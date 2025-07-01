import { auth } from "@clerk/nextjs/server";
import { CreatePage } from "./core";
import type { Metadata } from "next";

// TODO: Implement Metadata
export const metadata: Metadata = {
  title: "Create your Own Presentation on the Presentation Foundation",
  description:
    "Absolutely Free, No Sign Up Required, No Cloud Storage Required.",
  openGraph: {
    title: "Create your Own Presentation on the Presentation Foundation",
    description:
      "Absolutely Free, No Sign Up Required, No Cloud Storage Required.",
  },
  robots: {
    index: true,
    follow: true,
  },
  twitter: {
    title: "Create your Own Presentation on the Presentation Foundation",
    description:
      "Absolutely Free, No Sign Up Required, No Cloud Storage Required.",
  },
  classification: "Public",
};

export default async function Page() {
  const Auth = await auth.protect();

  return <CreatePage userId={Auth.userId} />;
}
