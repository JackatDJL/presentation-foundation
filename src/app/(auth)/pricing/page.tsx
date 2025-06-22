"use client";

import { motion } from "motion/react";
import { PricingTable } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"; // Assuming these are from your ui library like in hero.tsx
import Link from "next/link"; // Assuming Link from next/link as in hero.tsx

export default function PricingPage() {
  return (
    <main className="container mx-auto px-4 pt-10 pb-20">
      {/* Header Section - Inspired by Hero.tsx */}
      <section className="py-12 md:py-20">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Choose Your <span className="text-primary">Perfect Plan</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Find the plan that best fits your needs, whether you&apos;re just
            starting out or scaling your presentations.
          </motion.p>
        </motion.div>
      </section>

      {/* Pricing Table Section */}
      <section className="py-8">
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl md:text-4xl font-bold">
              Simple & Transparent Pricing
            </CardTitle>
            <CardDescription className="text-xl max-w-2xl mx-auto">
              No hidden fees. Just great features designed to empower your
              presentations.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {/* The Clerk PricingTable Component */}
            {/* Make sure your pricing plans are configured in the Clerk dashboard */}
            <div className="flex justify-center items-center">
              <PricingTable />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer Section - Copied from Hero.tsx for consistency */}
      <section className="py-8">
        <Card className="bg-transparent border-none shadow-none text-center text-sm text-muted-foreground dark:text-slate-400">
          <CardContent className="p-4">
            <Link
              href="/terms"
              prefetch
              className="hover:text-foreground dark:hover:text-slate-100 transition-colors mr-4"
            >
              Terms of Service
            </Link>
            <Link
              href="/privacy"
              prefetch
              className="hover:text-foreground dark:hover:text-slate-100 transition-colors"
            >
              Privacy Policy
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
