"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type React from "react";

import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import type { inferRouterInputs } from "@trpc/server";
import CreatePresentationForm from "./core";
import type { AppRouter } from "~/server/api/root";

export default function CreatePage() {
  type InputData = inferRouterInputs<AppRouter>["presentations"]["create"];
  const handleFormSubmit = async (formData: InputData) => {
    // Add the new presentation
    // addPresentation({
    //   shortname: formData.shortname,
    //   title: formData.title,
    //   description: formData.description || undefined,
    //   logo: formData.logo || undefined,
    //   cover: formData.cover || undefined,
    //   presentationFile: formData.presentationUrl
    //     ? {
    //         url: formData.presentationUrl,
    //         isLocked: formData.presentationIsLocked,
    //         password: formData.presentationIsLocked
    //           ? formData.presentationPassword
    //           : undefined,
    //       }
    //     : undefined,
    //   handoutFile: formData.handoutUrl
    //     ? {
    //         url: formData.handoutUrl,
    //       }
    //     : undefined,
    //   researchFile: formData.researchUrl
    //     ? {
    //         url: formData.researchUrl,
    //       }
    //     : undefined,
    //   kahootPin: formData.kahootPin || undefined,
    //   kahootSelfHostUrl: formData.kahootSelfHostUrl || undefined,
    //   visibility: formData.visibility as "public" | "private",
    //   owner: user.id,
    //   credits: formData.credits || undefined,
    // });

    // Redirect to the presentations page
    redirect("/manage");
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Presentation</h1>
        <Button variant="outline" asChild>
          <Link href="/manage">Back to Manage</Link>
        </Button>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow">
        <CreatePresentationForm onSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}
