import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { api } from "~/trpc/server";
import { EditPage as ThEditPage } from "./core";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    shortname: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { shortname } = await params;

  const data = await api.presentations.getByShortname(shortname);
  if (!data) return {};

  return {
    title: `Edit ${data.title} - Presentation Foundation by @DJL`,
  };
}

export default async function EditPage({ params }: Props) {
  await auth.protect();

  const { shortname } = await params;
  const id = await api.presentations.getIdByShortname(shortname);

  if (!id) {
    notFound();
  }

  return (
    <main className="flex justify-center">
      <ThEditPage id={id} />
    </main>
  );
}
