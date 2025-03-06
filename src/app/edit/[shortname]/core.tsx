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
import FilePreview from "~/components/file-container";
import { api } from "~/trpc/react";
import { z } from "zod";

const uuidType = z.string().uuid();

export function EditPage({ userId }: { userId: z.infer<typeof uuidType> }) {
  type InputData = inferRouterInputs<AppRouter>["presentations"]["create"];
  const router = useRouter();

  // TODO: Create and use an Edit Mutation
  const creationMutation = api.presentations.create.useMutation({
    onSuccess(data, variables, context) {
      router.push(`/edit/${data[0]?.shortname}`);
    },
  });

  // TODO: Remove "Owner" field from @/edit
  // TODO: Remove "createdAt" from @/edit
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

  // TODO: Query presentations.getById (IMPORTANT: the shorname is editable so we need to only use the id)

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

  // Handle form submission with loading state
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
      // Handle submission error
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

    // console.log(newErrors);
    setErrors({});
    setErrors(newErrors);
    // console.log(Object.keys(errors).length);
    // console.log(availabilityData);
    const allowCreation = Object.keys(errors).length === 0 && availabilityData;
    // console.log(errors, newErrors);
    // console.log(allowCreation);
    return allowCreation;
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        {/** TODO: Edit {presentation.title} */}
        <h1 className="text-3xl font-bold">Edit Presentation</h1>
        <Button variant="outline" asChild>
          <Link href="/manage">Back to Manage</Link>
        </Button>
        {/* TODO: Implement the View Button */}
        {/* <Button variant="secondary" asChild>
            <Link href={`/?i=${shortname}`}>View</Link>
          </Button> */}
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleFormSubmit();
          }}
          className="space-y-6 p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1"
                >
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.title ? "border-destructive" : "border-input"
                  }`}
                />
                {errors.title && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="shortname"
                  className="block text-sm font-medium mb-1"
                >
                  Shortname *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="shortname"
                    name="shortname"
                    value={formData.shortname}
                    onChange={handleChange}
                    className={`flex-1 px-4 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.shortname ? "border-destructive" : "border-input"
                    }`}
                    placeholder="e.g., my-presentation"
                  />
                  <Button
                    type="button"
                    onClick={callCheckShortname}
                    disabled={!formData.shortname || isCheckingShortname}
                    variant="outline"
                  >
                    {isCheckingShortname ? "Checking..." : "Check Availability"}
                  </Button>
                </div>
                {errors.shortname && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.shortname}
                  </p>
                )}
                {!errors.shortname && (
                  <>
                    {shortnameStatus === "available" && (
                      <p className="text-green-500 text-sm mt-1">
                        This shortname is available!
                      </p>
                    )}
                    {shortnameStatus === "taken" && (
                      <p className="text-destructive text-sm mt-1">
                        This shortname is already taken.
                      </p>
                    )}
                  </>
                )}
                <p className="text-muted-foreground text-sm mt-1">
                  Only change if you want to update the URL. Only lowercase
                  letters, numbers, and hyphens.
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="visibility"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="credits"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Credits
                </label>
                <input
                  type="text"
                  id="credits"
                  name="credits"
                  value={formData.credits}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., John Doe or leave blank to use your username"
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Media</h2>
              <FilePreview fileType="logo" disabled />

              <FilePreview fileType="cover" disabled />
            </div>
          </div>

          {/* Resources */}
          <div className="pt-6 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FilePreview fileType="presentation" disabled />

              <FilePreview fileType="handout" disabled />

              <FilePreview fileType="research" disabled />
            </div>

            {/* TODO: Implement the presentation password*/}
            {/* {formData.presentationIsLocked && (
              <div className="mt-4">
                <label
                  htmlFor="presentationPassword"
                  className="block text-sm font-medium mb-1"
                >
                  Presentation Password
                </label>
                <input
                  type="text"
                  id="presentationPassword"
                  name="presentationPassword"
                  value={formData.presentationPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )} */}
          </div>

          {/* Kahoot */}
          <div className="pt-6 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">Interactive Quiz</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="kahootPin"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kahoot PIN
                </label>
                <input
                  type="text"
                  id="kahootPin"
                  name="kahootPin"
                  value={formData.kahootPin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="123456 or 'none' for loading"
                />
                <p className="text-gray-500 text-sm mt-1">
                  Enter &apos;none&apos; to show a loading animation
                </p>
              </div>

              <div>
                <label
                  htmlFor="kahootSelfHostUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kahoot Self-Host URL
                </label>
                <input
                  type="text"
                  id="kahootSelfHostUrl"
                  name="kahootSelfHostUrl"
                  value={formData.kahootId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://kahoot.it/challenge/123456"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            {/* TODO: Implement Deletion*/}
            {/* <Button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              variant="destructive"
            >
              Delete Presentation
            </Button> */}
            <Button variant="outline" asChild>
              <Link href="/manage">Cancel</Link>
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </div>

      {/* <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this presentation? This action
            cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}
