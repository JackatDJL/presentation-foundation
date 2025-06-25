"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "~/components/ui/button";
import { VolumeX, Home, Plus } from "react-feather";
import { Card, CardContent } from "~/components/ui/card";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";

export default function PresentationNotFound() {
  const clerk = useClerk();

  return (
    <div className="container mx-auto px-4 py-16 min-h-[80vh] flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 pb-8 px-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                type: "spring",
                stiffness: 200,
              }}
              className="mx-auto mb-8 relative"
            >
              <div className="w-32 h-32 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <VolumeX className="h-16 w-16 text-destructive" />
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="absolute top-0 right-0 w-10 h-10 bg-destructive/20 rounded-full"
                style={{ transform: "translate(25%, -25%)" }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
                className="absolute bottom-0 left-0 w-6 h-6 bg-destructive/15 rounded-full"
                style={{ transform: "translate(-25%, 25%)" }}
              />
            </motion.div>

            <motion.h1
              className="text-3xl font-bold mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              Presentation Not Found
            </motion.h1>

            <motion.p
              className="text-muted-foreground mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              The presentation you&apos;re looking for doesn&apos;t exist or has
              been removed.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Button asChild>
                <Link href="/" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Return Home
                </Link>
              </Button>

              <SignedIn>
                <Button variant="outline" asChild>
                  <Link href="/create" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create New
                  </Link>
                </Button>
              </SignedIn>

              <SignedOut>
                <Button
                  variant="outline"
                  onClick={() => clerk.redirectToSignIn()}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Sign In to Create
                </Button>
              </SignedOut>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
