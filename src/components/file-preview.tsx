"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"

type FileType = "presentation" | "handout" | "research" | "logo" | "cover"

interface FilePreviewProps {
  fileUrl?: string
  fileType: FileType
  isLocked?: boolean
  onUnlock?: fileType extends "presentation" ? () => void : never
  onUpload?: () => void
  onDelete?: () => void
}

export default function FilePreview({
  fileUrl,
  fileType,
  isLocked = false,
  onUnlock,
  onUpload,
  onDelete,
}: FilePreviewProps) {
  const [showPreview, setShowPreview] = useState(false)

  // Determine if the file is an image
  const isImage = fileUrl?.match(/\.(jpeg|jpg|gif|png)$/i) !== null

  // Get file extension
  const getFileExtension = (url?: string) => {
    if (!url) return ""
    return url.split(".").pop()?.toLowerCase() || ""
  }

  // Get file icon based on type
  const getFileIcon = () => {
    if (isImage) return null

    const extension = getFileExtension(fileUrl)

    switch (extension) {
      case "pdf":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )
      case "doc":
      case "docx":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )
      case "ppt":
      case "pptx":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-orange-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        )
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        )
    }
  }

  // Get title based on file type
  const getTitle = () => {
    switch (fileType) {
      case "presentation":
        return "Presentation"
      case "handout":
        return "Handout"
      case "research":
        return "Research Paper"
      case "logo":
        return "Logo"
      case "cover":
        return "Cover"
      default:
        return "File"
    }
  }

  // If no file exists, show upload button
  if (!fileUrl) {
    return (
      <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-muted-foreground mb-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
        <p className="text-muted-foreground mb-4">No {getTitle().toLowerCase()} uploaded</p>
        <Button onClick={onUpload} variant="outline">
          Upload {getTitle()}
        </Button>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
        <h3 className="font-medium">{getTitle()}</h3>
        <div className="flex space-x-2">
          {fileType === "presentation" && (
            <Button onClick={onUnlock} size="sm" variant="outline">
              {isLocked ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Locked
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Unlocked
                </>
              )}
            </Button>
          )}
          <Button onClick={onDelete} size="sm" variant="destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </Button>
        </div>
      </div>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogTrigger asChild>
          <div className="p-6 flex items-center justify-center cursor-pointer hover:bg-muted/50">
            {isImage ? (
              <div className="relative h-40 w-full">
                <Image src={fileUrl || "/placeholder.svg"} alt={getTitle()} fill className="object-contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {getFileIcon()}
                <p className="mt-2 text-sm text-muted-foreground">{fileUrl?.split("/").pop()}</p>
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{getTitle()} Preview</DialogTitle>
          </DialogHeader>
          {isImage ? (
            <div className="relative h-96 w-full">
              <Image src={fileUrl || "/placeholder.svg"} alt={getTitle()} fill className="object-contain" />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12">
              {getFileIcon()}
              <p className="mt-4 text-muted-foreground">Preview not available</p>
              <Button className="mt-4" asChild>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  Open {getTitle()}
                </a>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

