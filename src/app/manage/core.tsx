"use client";

import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { PlusCircle, ArrowLeft, Edit2, Eye } from "react-feather";
import { AsyncViewLink } from "~/components/asyncLink";
import { useSearchParams } from "next/navigation";
import type { presentations } from "~/server/db/schema";
import { motion } from "motion/react";

interface ManagePresentationsProps {
  presentation: (typeof presentations.$inferSelect)[];
}

export default function ManagePresentations({
  presentation,
}: ManagePresentationsProps) {
  const searchParams = useSearchParams();
  const searchParamsObj = Object.fromEntries(searchParams.entries());

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">
          Manage Presentations
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button variant="outline" size="sm" asChild>
              <Link prefetch href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button size="sm" asChild>
              <Link prefetch href="/create" className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New
              </Link>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-xl">Your Presentations</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Shortname</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presentation.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-muted-foreground"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="py-8"
                      >
                        No presentations found. Create your first one!
                      </motion.div>
                    </TableCell>
                  </TableRow>
                ) : (
                  presentation.map((presentation, index) => (
                    <motion.tr
                      key={presentation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                      className="group"
                    >
                      <TableCell className="font-medium">
                        {presentation.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {presentation.shortname}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            presentation.visibility === "public"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {presentation.visibility}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(presentation.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button variant="outline" size="sm" asChild>
                              <Link
                                prefetch
                                href={`/edit/${presentation.shortname}`}
                                className="flex items-center gap-1"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit
                              </Link>
                            </Button>
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button variant="outline" size="sm" asChild>
                              <AsyncViewLink
                                searchParams={searchParamsObj}
                                shortname={presentation.shortname}
                                className="flex items-center gap-1"
                                spinIt={false}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </AsyncViewLink>
                            </Button>
                          </motion.div>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
