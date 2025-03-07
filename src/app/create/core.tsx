"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import type React from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import type { inferRouterInputs } from "@trpc/server";
import type { AppRouter } from "~/server/api/root";

import { useState } from "react";
import FileContainer from "~/components/file-container";
import { api } from "~/trpc/react";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Loader } from "react-feather";
import { toast } from "sonner";

const uuidType = z.string().uuid();

export function CreatePage({ userId }: { userId: z.infer<typeof uuidType> }) {
  type InputData = inferRouterInputs<AppRouter>["presentations"]["create"];
  const router = useRouter();

  const creationMutation = api.presentations.create.useMutation({
    onSuccess(data, variables, context) {
      toast.success("Presentation created successfully");
      router.push(`/edit/${data[0]?.shortname}`);
    },
    onError(error) {
      toast.error(error.message || "Failed to create presentation");
    },
  });

  const onSubmit = (formData: InputData): void => {
    creationMutation.mutate({
      shortname: formData.shortname,
      title: formData.title,
      description: formData.description,
      kahootPin: formData.kahootPin,
      kahootId: formData.kahootId,
      credits: formData.credits,
      visibility: formData.visibility,
      owner: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const [formData, setFormData] = useState({
    shortname: "",
    title: "",
    description: "",
    kahootPin: "",
    kahootId: "",
    visibility: "public",
    credits: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingShortname, setIsCheckingShortname] = useState(false);
  const [shortnameStatus, setShortnameStatus] = useState<
    "available" | "taken" | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: availabilityData, refetch } =
    api.presentations.checkAvailability.useQuery(formData.shortname, {
      enabled: false, // Don't run automatically
    });

  const callCheckShortname = async () => {
    if (!formData.shortname) return;

    setIsCheckingShortname(true);
    const result = await refetch();
    setIsCheckingShortname(false);

    if (result.data === true) {
      setShortnameStatus("available");
    } else if (result.data === false) {
      setShortnameStatus("taken");
    }
  };

  const handleFormSubmit = async () => {
    const block = await validateForm();
    if (!block) return;

    setIsSubmitting(true);
    try {
      onSubmit({
        shortname: formData.shortname,
        title: formData.title,
        description: formData.description,
        kahootPin: formData.kahootPin,
        kahootId: formData.kahootId,
        visibility: formData.visibility as "public" | "private",
        credits: formData.credits,
        owner: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      throw new Error("Failed to create presentation: " + String(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Reset shortname status when shortname changes
    if (name === "shortname") {
      setShortnameStatus(null);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    await callCheckShortname();

    if (!formData.shortname.trim()) {
      newErrors.shortname = "Shortname is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.shortname)) {
      newErrors.shortname =
        "Shortname can only contain lowercase letters, numbers, and hyphens";
    }

    setErrors(newErrors);
    const allowCreation =
      Object.keys(newErrors).length === 0 && availabilityData;
    return allowCreation;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create New Presentation</h1>
        <Button variant="outline" asChild>
          <Link prefetch href="/manage">
            Back to Manage
          </Link>
        </Button>
      </div>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleFormSubmit();
          }}
        >
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter your presentation details</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={errors.title ? "border-destructive" : ""}
                  />
                  {errors.title && (
                    <p className="text-destructive text-sm">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortname">Shortname *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="shortname"
                      name="shortname"
                      value={formData.shortname}
                      onChange={handleChange}
                      className={errors.shortname ? "border-destructive" : ""}
                      placeholder="e.g., my-presentation"
                    />
                    <Button
                      type="button"
                      onClick={() => void callCheckShortname()}
                      disabled={!formData.shortname || isCheckingShortname}
                      variant="outline"
                    >
                      {isCheckingShortname ? "Checking..." : "Check"}
                    </Button>
                  </div>
                  {errors.shortname && (
                    <p className="text-destructive text-sm">
                      {errors.shortname}
                    </p>
                  )}
                  {!errors.shortname && (
                    <>
                      {shortnameStatus === "available" && (
                        <p className="text-green-500 text-sm">Available!</p>
                      )}
                      {shortnameStatus === "taken" && (
                        <p className="text-destructive text-sm">
                          Already taken
                        </p>
                      )}
                    </>
                  )}
                  <p className="text-muted-foreground text-sm">
                    Only lowercase letters, numbers, and hyphens
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) =>
                      handleSelectChange("visibility", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credits">Credits</Label>
                  <Input
                    id="credits"
                    name="credits"
                    value={formData.credits}
                    onChange={handleChange}
                    placeholder="e.g., John Doe or leave blank to use your username"
                  />
                </div>
              </div>

              {/* Media */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Media</h2>
                <FileContainer fileType="logo" disabled />
                <FileContainer fileType="cover" disabled />
              </div>
            </div>

            {/* Resources */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FileContainer fileType="presentation" disabled />
                <FileContainer fileType="handout" disabled />
                <FileContainer fileType="research" disabled />
              </div>
            </div>

            {/* Kahoot */}
            <div className="pt-6 border-t border-border">
              <h2 className="text-xl font-semibold mb-4">Interactive Quiz</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="kahootPin">Kahoot PIN</Label>
                  <Input
                    id="kahootPin"
                    name="kahootPin"
                    value={formData.kahootPin}
                    onChange={handleChange}
                    placeholder="123456 or 'none' for loading"
                  />
                  <p className="text-muted-foreground text-sm">
                    Enter &apos;none&apos; to show a loading animation
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kahootId">Kahoot Self-Host URL</Label>
                  <Input
                    id="kahootId"
                    name="kahootId"
                    value={formData.kahootId}
                    onChange={handleChange}
                    placeholder="https://kahoot.it/challenge/123456"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-border">
              <Button variant="outline" asChild>
                <Link prefetch href="/manage">
                  Cancel
                </Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Presentation"
                )}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
