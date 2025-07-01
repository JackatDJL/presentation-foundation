import type { Metadata } from "next";
import Hero from "~/components/hero";

export const metadata: Metadata = {
  title: "Presentation Foundation",
  description: "This Metadata should be inaccessible due to middleware",
};

export default function Page() {
  return (
    <main>
      <Hero />
    </main>
  );
}
