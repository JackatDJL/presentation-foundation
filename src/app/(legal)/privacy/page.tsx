import type { Metadata } from "next";
import PrivacyPolicy from "./core";

export const metadata: Metadata = {
  title: "Privacy Policy of the Presentation Foundation",
  description: "View our Privacy Policy to learn how we handle your data.",
  openGraph: {
    title: "Privacy Policy of the Presentation Foundation",
    description: "View our Privacy Policy to learn how we handle your data.",
  },
  twitter: {
    title: "Privacy Policy of the Presentation Foundation",
    description: "View our Privacy Policy to learn how we handle your data.",
  },
  robots: "index, follow",

  classification: "Privacy Policy",
};

export default async function PrivacyPage() {
  return <PrivacyPolicy />;
}
