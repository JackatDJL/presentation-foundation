import Link from "next/link";
import { getPresentations } from "~/lib/data";
import PresentationGrid from "~/components/presentation-grid";
import PresentationDetail from "~/components/presentation-detail";

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const presentations = getPresentations();
  const shortname = searchParams.i as string | undefined;

  // If shortname is provided, show the specific presentation
  if (shortname) {
    const presentation = presentations.find((p) => p.shortname === shortname);

    if (!presentation) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Presentation Not Found</h1>
            <p className="mb-6">
              The presentation with shortname "{shortname}" could not be found.
            </p>
            <Link
            prefetch
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      );
    }

    return <PresentationDetail presentation={presentation} />;
  }

  // Otherwise, show the grid of all public presentations
  const publicPresentations = presentations.filter(
    (p) => p.visibility === "public",
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Presentation Foundation
      </h1>
      <p className="text-center mb-12 max-w-2xl mx-auto">
        Share your presentations, handouts, and research materials without the
        need for cloud storage logins.
      </p>
      <PresentationGrid presentations={publicPresentations} />
    </div>
  );
}
