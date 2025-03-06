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
  // FIXME: Should be the title
  return {
    title: `Edit ${shortname}`,
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
