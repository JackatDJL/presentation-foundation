/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// import { addPresentation, currentUser } from "~/lib/data";
import { Button } from "~/components/ui/button";
import FilePreview from "~/components/file-preview";

export default function CreatePage() {
  const router = useRouter();
  // const user = currentUser;

  const [formData, setFormData] = useState({
    shortname: "",
    title: "",
    description: "",
    logo: "",
    cover: "",
    presentationUrl: "",
    presentationIsLocked: false,
    presentationPassword: "",
    handoutUrl: "",
    researchUrl: "",
    kahootPin: "",
    kahootSelfHostUrl: "",
    visibility: "public",
    credits: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingShortname, setIsCheckingShortname] = useState(false);
  const [shortnameStatus, setShortnameStatus] = useState<
    "available" | "taken" | null
  >(null);

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

  const checkShortname = () => {
    setIsCheckingShortname(true);
    const isAvailable = true;
    // const isAvailable = isShortNameAvailable(formData.shortname);
    setShortnameStatus(isAvailable ? "available" : "taken");
    setIsCheckingShortname(false);

    if (!isAvailable) {
      setErrors((prev) => ({
        ...prev,
        shortname: "This shortname is already taken",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.shortname.trim()) {
      newErrors.shortname = "Shortname is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.shortname)) {
      newErrors.shortname =
        "Shortname can only contain lowercase letters, numbers, and hyphens";
    } else if (false) {
      // } else if (!isShortNameAvailable(formData.shortname)) {
      newErrors.shortname = "This shortname is already taken";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
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
      router.push("/manage");
    }
  };

  const handleFileUpload =
    (type: "presentation" | "handout" | "research") => async (file: File) => {
      // In a real app, you would upload the file to your storage service here
      // For now, we'll just simulate it with a fake URL
      const fakeUrl = `https://storage.example.com/${type}/${file.name}`;

      setFormData((prev) => ({
        ...prev,
        [`${type}Url`]: fakeUrl,
      }));
    };

  const handleFileDelete =
    (type: "presentation" | "handout" | "research") => () => {
      setFormData((prev) => ({
        ...prev,
        [`${type}Url`]: "",
      }));
    };

  const handleToggleLock = () => {
    setFormData((prev) => ({
      ...prev,
      presentationIsLocked: !prev.presentationIsLocked,
    }));
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
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
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
                    onClick={checkShortname}
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
                <p className="text-muted-foreground text-sm mt-1">
                  Used in URLs. Only lowercase letters, numbers, and hyphens.
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
              <FilePreview
                fileType="logo"
                fileUrl={formData.logo}
                // onUpload={(file) => {
                //   // In a real app, you would upload the file and get a URL
                //   const fakeUrl = `https://storage.example.com/logos/${file.name}`;
                //   setFormData((prev) => ({ ...prev, logo: fakeUrl }));
                // }}
                onDelete={() => setFormData((prev) => ({ ...prev, logo: "" }))}
              />

              <FilePreview
                fileType="cover"
                fileUrl={formData.cover}
                // onUpload={(file) => {
                //   // In a real app, you would upload the file and get a URL
                //   const fakeUrl = `https://storage.example.com/covers/${file.name}`;
                //   setFormData((prev) => ({ ...prev, cover: fakeUrl }));
                // }}
                onDelete={() => setFormData((prev) => ({ ...prev, cover: "" }))}
              />
            </div>
          </div>

          {/* Resources */}
          <div className="pt-6 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FilePreview
                fileType="presentation"
                fileUrl={formData.presentationUrl}
                isLocked={formData.presentationIsLocked}
                // onUpload={(file) => {
                //   const fakeUrl = `https://storage.example.com/presentations/${file.name}`;
                //   setFormData((prev) => ({
                //     ...prev,
                //     presentationUrl: fakeUrl,
                //   }));
                // }}
                onDelete={() =>
                  setFormData((prev) => ({ ...prev, presentationUrl: "" }))
                }
                onUnlock={() =>
                  setFormData((prev) => ({
                    ...prev,
                    presentationIsLocked: !prev.presentationIsLocked,
                  }))
                }
              />

              <FilePreview
                fileType="handout"
                fileUrl={formData.handoutUrl}
                // onUpload={(file) => {
                //   const fakeUrl = `https://storage.example.com/handouts/${file.name}`;
                //   setFormData((prev) => ({ ...prev, handoutUrl: fakeUrl }));
                // }}
                onDelete={() =>
                  setFormData((prev) => ({ ...prev, handoutUrl: "" }))
                }
              />

              <FilePreview
                fileType="research"
                fileUrl={formData.researchUrl}
                // onUpload={(file) => {
                //   const fakeUrl = `https://storage.example.com/research/${file.name}`;
                //   setFormData((prev) => ({ ...prev, researchUrl: fakeUrl }));
                // }}
                onDelete={() =>
                  setFormData((prev) => ({ ...prev, researchUrl: "" }))
                }
              />
            </div>

            {formData.presentationIsLocked && (
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
            )}
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
                  value={formData.kahootSelfHostUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://kahoot.it/challenge/123456"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <Button variant="outline" asChild>
              <Link href="/manage">Cancel</Link>
            </Button>
            <Button type="submit">Create Presentation</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
