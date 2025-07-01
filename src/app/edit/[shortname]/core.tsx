"use client";

import type React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
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
import { Loader, Trash2 } from "react-feather";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { toast } from "sonner";
import { type presentations } from "@prisma/client";
const uuidType = z.string().uuid();

export function EditPage({ id }: { id: z.infer<typeof uuidType> }) {
  uuidType.parse(id);

  const { data, isLoading } = api.presentations.getById.useQuery(id);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 animate-spin" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Presentation not found</h1>
          <div>
            <Button asChild>
              <Link prefetch href="/manage">
                Back to Manage
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return <PresentationForm presentation={data} />;
}

function PresentationForm({
  presentation,
}: {
  presentation: presentations;
}) {  const router = useRouter();
  const [formData, setFormData] = useState({
    shortname: presentation.shortname,
    title: presentation.title,
    description: presentation.description ?? "",
    kahootPin: presentation.kahootPin ?? "",
    kahootId: presentation.kahootId ?? "",
    visibility: presentation.visibility,
    credits: presentation.credits ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingShortname, setIsCheckingShortname] = useState(false);
  const [shortnameStatus, setShortnameStatus] = useState<
    "available" | "taken" | null
  >(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const editMutation = api.presentations.edit.useMutation({
    onSuccess() {
      console.log("Success was Called!");
      toast.success("Presentation updated successfully");
      router.push("/manage");
    },
    onError(error) {
      toast.error(error.message || "Failed to update presentation");
    },
  });

  const deleteMutation = api.presentations.deleteById.useMutation({
    onSuccess() {
      toast.success("Presentation deleted successfully");
      router.push("/manage");
    },
    onError(error) {
      toast.error(error.message || "Failed to delete presentation");
    },
  });

  const { refetch: checkAvailability } =
    api.presentations.checkAvailability.useQuery(formData.shortname, {
      enabled: false,
    });

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

  const checkShortnameAvailability = async () => {
    if (!formData.shortname) return false;

    setIsCheckingShortname(true);

    // If shortname hasn't changed, it's available
    if (presentation.shortname === formData.shortname) {
      setIsCheckingShortname(false);
      setShortnameStatus("available");
      return true;
    }

    // Otherwise check with the server
    const response = await checkAvailability();
    setIsCheckingShortname(false);

    const isAvailable = response.data ?? false;
    setShortnameStatus(isAvailable ? "available" : "taken");

    return isAvailable;
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};

    // Check title
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    // Check shortname
    if (!formData.shortname.trim()) {
      newErrors.shortname = "Shortname is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.shortname)) {
      newErrors.shortname =
        "Shortname can only contain lowercase letters, numbers, and hyphens";
    }

    setErrors(newErrors);

    // Check shortname availability if there are no other errors
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) return false;

    const isAvailable = await checkShortnameAvailability();
    return isAvailable;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    editMutation.mutate({
      id: presentation.id,
      shortname: formData.shortname,
      title: formData.title,
      description: formData.description || undefined,
      kahootPin: formData.kahootPin || undefined,
      kahootId: formData.kahootId || undefined,
      visibility: formData.visibility,
      credits: formData.credits || undefined,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDelete = () => {
    deleteMutation.mutate(presentation.id);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit {presentation.title}</h1>
        <div className="flex gap-2">
          <div>
            <Button variant="outline" asChild>
              <Link prefetch href="/manage">
                Back to Manage
              </Link>
            </Button>
          </div>
          {presentation.shortname && (
            <div>
              <Button variant="secondary" asChild>
                <Link
                  prefetch
                  href={`/view/${presentation.shortname}`}
                  className="flex items-center gap-1"
                >
                  View
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div>        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your presentation details
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  className="space-y-4"
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
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
                        onClick={() => void checkShortnameAvailability()}
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
                    {!errors.shortname && shortnameStatus === "available" && (
                      <motion.p
                        className="text-green-500 text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        Available!
                      </motion.p>
                    )}
                    {!errors.shortname && shortnameStatus === "taken" && (
                      <motion.p
                        className="text-destructive text-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        Already taken
                      </motion.p>
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
                      placeholder="e.g., John Doe"
                    />
                  </div>
                </motion.div>

                {/* Media */}
                <motion.div
                  className="space-y-4"
                  initial={{ x: 10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <h2 className="text-xl font-semibold">Media</h2>
                  <FileContainer
                    fileType="logo"
                    presentationId={presentation.id}
                  />
                  <FileContainer
                    fileType="cover"
                    presentationId={presentation.id}
                  />
                </motion.div>
              </div>

              {/* Resources */}
              <motion.div
                className="pt-6 border-t border-border"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >
                <h2 className="text-xl font-semibold mb-4">Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FileContainer
                    fileType="presentation"
                    presentationId={presentation.id}
                  />
                  <FileContainer
                    fileType="handout"
                    presentationId={presentation.id}
                  />
                  <FileContainer
                    fileType="research"
                    presentationId={presentation.id}
                  />
                </div>
              </motion.div>

              {/* Kahoot */}
              <motion.div
                className="pt-6 border-t border-border"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
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
              </motion.div>

              <motion.div
                className="flex justify-between space-x-4 pt-6 border-t border-border"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
              >
                {/* Delete Presentation Button */}
                <AlertDialog
                  open={isDeleteDialogOpen}
                  onOpenChange={setIsDeleteDialogOpen}
                >
                  <AlertDialogTrigger asChild>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="destructive"
                        type="button"
                        className="text-foreground"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Presentation
                      </Button>
                    </motion.div>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the presentation &quot;
                        {presentation.title}&quot; and all associated files.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <Button
                        onClick={handleDelete}
                        type="button"
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleteMutation.isPending ? (
                          <>
                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Save/Cancel Buttons */}
                <div className="flex gap-2 ml-auto">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="outline" asChild>
                      <Link prefetch href="/manage">
                        Cancel
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button type="submit" disabled={editMutation.isPending}>
                      {editMutation.isPending ? (
                        <>
                          <Loader className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </CardContent>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
