"use client";

import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { motion } from "framer-motion";
import { Loader } from "react-feather";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import KahootSection from "~/components/kahoot-section";
import FileView from "./file-view";
import { AsyncHomeLink } from "./asyncLink";

interface ViewPresentationProps {
  shortname: string;
}

export default function ViewPresentation({ shortname }: ViewPresentationProps) {
  const searchParams = useSearchParams();
  const { data: presentation, isPending } =
    api.presentations.getByShortname.useQuery(shortname);

  // Fetch logo and cover files if they exist
  const { data: logoFile } = api.files.getById.useQuery(
    presentation?.logo ?? "",
    {
      enabled: !!presentation?.logo,
    },
  );

  const { data: coverFile } = api.files.getById.useQuery(
    presentation?.cover ?? "",
    {
      enabled: !!presentation?.cover,
    },
  );

  // Convert searchParams to a regular object for our utility functions
  const searchParamsObj = Object.fromEntries(searchParams.entries());

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[50vh]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <Loader className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Loading presentation...</p>
        </motion.div>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Presentation Not Found</CardTitle>
            <CardDescription>
              The presentation you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <AsyncHomeLink searchParams={searchParamsObj}>
                Return Home
              </AsyncHomeLink>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-5xl mx-auto mb-8 overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <Badge
                  variant={
                    presentation.visibility === "public"
                      ? "default"
                      : "secondary"
                  }
                  className="mb-2"
                >
                  {presentation.visibility === "public" ? "Public" : "Private"}
                </Badge>
                <CardTitle className="text-3xl font-bold">
                  {presentation.title}
                </CardTitle>
                {presentation.description && (
                  <CardDescription className="mt-2 text-base">
                    {presentation.description}
                  </CardDescription>
                )}
              </div>
              {logoFile?.url && (
                <div className="hidden sm:block">
                  <Image
                    src={logoFile.url || "/placeholder.svg"}
                    alt="Logo"
                    width={120}
                    height={60}
                    className="h-16 object-contain"
                  />
                </div>
              )}
            </div>
          </CardHeader>

          {coverFile?.url && (
            <div className="w-full h-48 sm:h-64 md:h-80 bg-muted overflow-hidden">
              <Image
                src={coverFile.url || "/placeholder.svg"}
                alt="Cover"
                width={1280}
                height={320}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          )}

          <CardContent className="pt-6 space-y-8">
            {/* Presentation Files Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {presentation.presentation && (
                <FileView
                  fileId={presentation.presentation}
                  fileType="presentation"
                  presentationId={presentation.id}
                />
              )}

              {presentation.handout && (
                <FileView
                  fileId={presentation.handout}
                  fileType="handout"
                  presentationId={presentation.id}
                />
              )}

              {presentation.research && (
                <FileView
                  fileId={presentation.research}
                  fileType="research"
                  presentationId={presentation.id}
                />
              )}
            </div>

            {/* Kahoot Section */}
            <div className="mt-8">
              <KahootSection
                kahootPin={presentation.kahootPin ?? undefined}
                kahootSelfHostUrl={presentation.kahootId ?? undefined}
              />
            </div>
          </CardContent>

          <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {presentation.credits && <p>Credits: {presentation.credits}</p>}
              <p>
                Last updated:{" "}
                {new Date(presentation.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <AsyncHomeLink searchParams={searchParamsObj}>
                  Return Home
                </AsyncHomeLink>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
