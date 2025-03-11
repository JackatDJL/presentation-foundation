"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useClerk } from "@clerk/nextjs";
import {
  PlusCircle,
  Folder,
  Settings,
  Clock,
  FileText,
  Loader,
} from "react-feather";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";
import type { presentations } from "~/server/db/schema";
import { AsyncViewLink } from "./asyncLink";

export default function Home({
  userId,
  firstName,
}: {
  userId: string;
  firstName?: string;
}) {
  const { redirectToUserProfile } = useClerk();
  const [recentPresentations, setRecentPresentations] = useState<
    (typeof presentations.$inferSelect)[]
  >([]);

  const query = api.recent.pullByUID.useQuery({
    uid: userId,
    limit: 4,
  });

  useEffect(() => {
    if (query.data) {
      setRecentPresentations(query.data);
    }
  }, [query.data]);

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="text-center mb-12">
          <motion.h1
            className="text-4xl font-bold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Welcome, {firstName ?? "there"}!
          </motion.h1>
          <motion.p
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            What would you like to do today?
          </motion.p>
        </div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-primary" />
                Create New
              </CardTitle>
              <CardDescription>
                Start a new presentation from scratch
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Choose from templates or start with a blank canvas
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/create" prefetch={true}>
                  Create Presentation
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-primary" />
                Manage Existing
              </CardTitle>
              <CardDescription>
                View and edit your presentations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Access all your presentations in one place
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/manage" prefetch={true}>
                  Manage Presentations
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Update personal information and security settings
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => redirectToUserProfile()}
              >
                Manage Account
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-4">Recent Presentations</h2>

          {query.isPending ? (
            <div className="flex items-center justify-center p-8">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          ) : recentPresentations.length > 0 ? (
            <div className="grid gap-4">
              {recentPresentations.map((presentation, index) => (
                <motion.div
                  key={presentation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="hover:bg-accent/20 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-10 w-10 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{presentation.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{" "}
                              {new Date(
                                presentation.updatedAt,
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            prefetch
                            href={`/edit/${presentation.shortname}`}
                          >
                            Edit
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <AsyncViewLink
                            searchParams={{}}
                            shortname={presentation.shortname}
                          >
                            View
                          </AsyncViewLink>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  You don&apos;t have any presentations yet.
                </p>
                <Button asChild className="mt-4">
                  <Link prefetch href="/create">
                    Create Your First Presentation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
