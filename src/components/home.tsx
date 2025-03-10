"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useUser, useClerk } from "@clerk/nextjs";
import { PlusCircle, Folder, Settings, Clock, FileText } from "react-feather";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface Presentation {
  id: string;
  title: string;
  lastEdited: string;
  views: number;
}

// TODO: Implement Data
export default function Home() {
  const { user } = useUser();
  const { redirectToUserProfile } = useClerk();
  const [recentPresentations, setRecentPresentations] = useState<
    Presentation[]
  >([]);

  // Simulate loading recent presentations
  useEffect(() => {
    // This would be replaced with an actual API call
    const mockPresentations = [
      {
        id: "pres-1",
        title: "Biology 101 Final Project",
        lastEdited: "2 days ago",
        views: 24,
      },
      {
        id: "pres-2",
        title: "Physics Experiment Results",
        lastEdited: "1 week ago",
        views: 56,
      },
      {
        id: "pres-3",
        title: "Team Project Kickoff",
        lastEdited: "3 weeks ago",
        views: 128,
      },
    ];

    setRecentPresentations(mockPresentations);
  }, []);

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
            Welcome, {user?.firstName ?? "there"}!
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

          {recentPresentations.length > 0 ? (
            <div className="grid gap-4">
              {recentPresentations.map((presentation, index) => (
                <motion.div
                  key={presentation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                >
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-10 w-10 text-muted-foreground" />
                        <div>
                          <h3 className="font-medium">{presentation.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />{" "}
                              {presentation.lastEdited}
                            </span>
                            <span>{presentation.views} views</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/edit/${presentation.id}`}>Edit</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/view/${presentation.id}`}>View</Link>
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
                  <Link href="/create">Create Your First Presentation</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
