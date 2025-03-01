"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { getPresentation, updatePresentation, deletePresentation, isOwner, currentUser } from "~/lib/data"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import FilePreview from "~/components/file-preview"

export default function EditPage({ params }: { params: { shortname: string } }) {
  const router = useRouter()
  const { shortname } = params
  const user = currentUser

  const [formData, setFormData] = useState({
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
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const presentation = getPresentation(shortname)

    if (!presentation) {
      router.push("/manage")
      return
    }

    // Check if user is the owner
    if (!isOwner(shortname, user.id)) {
      router.push("/manage")
      return
    }

    setFormData({
      title: presentation.title,
      description: presentation.description || "",
      logo: presentation.logo || "",
      cover: presentation.cover || "",
      presentationUrl: presentation.presentationFile?.url || "",
      presentationIsLocked: presentation.presentationFile?.isLocked || false,
      presentationPassword: presentation.presentationFile?.password || "",
      handoutUrl: presentation.handoutFile?.url || "",
      researchUrl: presentation.researchFile?.url || "",
      kahootPin: presentation.kahootPin || "",
      kahootSelfHostUrl: presentation.kahootSelfHostUrl || "",
      visibility: presentation.visibility,
      credits: presentation.credits || "",
    })

    setIsLoading(false)
  }, [shortname, router, user.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Update the presentation
      updatePresentation(shortname, {
        title: formData.title,
        description: formData.description || undefined,
        logo: formData.logo || undefined,
        cover: formData.cover || undefined,
        presentationFile: formData.presentationUrl
          ? {
              url: formData.presentationUrl,
              isLocked: formData.presentationIsLocked,
              password: formData.presentationIsLocked ? formData.presentationPassword : undefined,
            }
          : undefined,
        handoutFile: formData.handoutUrl
          ? {
              url: formData.handoutUrl,
            }
          : undefined,
        researchFile: formData.researchUrl
          ? {
              url: formData.researchUrl,
            }
          : undefined,
        kahootPin: formData.kahootPin || undefined,
        kahootSelfHostUrl: formData.kahootSelfHostUrl || undefined,
        visibility: formData.visibility as "public" | "private",
        credits: formData.credits || undefined,
      })

      // Redirect to the presentations page
      router.push("/manage")
    }
  }

  const handleDelete = () => {
    deletePresentation(shortname)
    router.push("/manage")
  }

  const handleFileUpload = (type: "presentation" | "handout" | "research") => async (file: File) => {
    // In a real app, you would upload the file to your storage service here
    // For now, we'll just simulate it with a fake URL
    const fakeUrl = `https://storage.example.com/${type}/${file.name}`

    const updates: any = {}
    switch (type) {
      case "presentation":
        updates.presentationFile = {
          url: fakeUrl,
          isLocked: formData.presentationIsLocked,
          password: formData.presentationPassword,
        }
        break
      case "handout":
        updates.handoutFile = { url: fakeUrl }
        break
      case "research":
        updates.researchFile = { url: fakeUrl }
        break
    }

    updatePresentation(shortname, updates)
    setFormData((prev) => ({
      ...prev,
      [`${type}Url`]: fakeUrl,
    }))
  }

  const handleFileDelete = (type: "presentation" | "handout" | "research") => () => {
    const updates: any = {}
    switch (type) {
      case "presentation":
        updates.presentationFile = null
        break
      case "handout":
        updates.handoutFile = null
        break
      case "research":
        updates.researchFile = null
        break
    }

    updatePresentation(shortname, updates)
    setFormData((prev) => ({
      ...prev,
      [`${type}Url`]: "",
    }))
  }

  const handleToggleLock = () => {
    setFormData((prev) => ({
      ...prev,
      presentationIsLocked: !prev.presentationIsLocked,
    }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Edit Presentation</h1>
        <div className="flex space-x-4">
          <Button variant="outline" asChild>
            <Link href="/manage">Back to Manage</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/?i=${shortname}`}>View</Link>
          </Button>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Basic Information</h2>

              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
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
                {errors.title && <p className="text-destructive text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label htmlFor="shortname" className="block text-sm font-medium mb-1">
                  Shortname
                </label>
                <input
                  type="text"
                  id="shortname"
                  value={shortname}
                  disabled
                  className="w-full px-4 py-2 bg-muted border border-input rounded-md"
                />
                <p className="text-muted-foreground text-sm mt-1">Shortname cannot be changed</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">
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
                <label htmlFor="visibility" className="block text-sm font-medium mb-1">
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
                <label htmlFor="credits" className="block text-sm font-medium mb-1">
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
                onUpload={(file) => {
                  // In a real app, you would upload the file and get a URL
                  const fakeUrl = `https://storage.example.com/logos/${file.name}`
                  setFormData((prev) => ({ ...prev, logo: fakeUrl }))
                }}
                onDelete={() => setFormData((prev) => ({ ...prev, logo: "" }))}
              />

              <FilePreview
                fileType="cover"
                fileUrl={formData.cover}
                onUpload={(file) => {
                  // In a real app, you would upload the file and get a URL
                  const fakeUrl = `https://storage.example.com/covers/${file.name}`
                  setFormData((prev) => ({ ...prev, cover: fakeUrl }))
                }}
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
                onUpload={handleFileUpload("presentation")}
                onDelete={handleFileDelete("presentation")}
                onUnlock={handleToggleLock}
              />

              <FilePreview
                fileType="handout"
                fileUrl={formData.handoutUrl}
                onUpload={handleFileUpload("handout")}
                onDelete={handleFileDelete("handout")}
              />

              <FilePreview
                fileType="research"
                fileUrl={formData.researchUrl}
                onUpload={handleFileUpload("research")}
                onDelete={handleFileDelete("research")}
              />
            </div>

            {formData.presentationIsLocked && (
              <div className="mt-4">
                <label htmlFor="presentationPassword" className="block text-sm font-medium mb-1">
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
                <label htmlFor="kahootPin" className="block text-sm font-medium mb-1">
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
                <p className="text-muted-foreground text-sm mt-1">Enter 'none' to show a loading animation</p>
              </div>

              <div>
                <label htmlFor="kahootSelfHostUrl" className="block text-sm font-medium mb-1">
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

          <div className="flex justify-between pt-6">
            <Button type="button" onClick={() => setShowDeleteConfirm(true)} variant="destructive">
              Delete Presentation
            </Button>

            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link href="/manage">Cancel</Link>
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete confirmation modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this presentation? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

