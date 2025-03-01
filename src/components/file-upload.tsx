"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Lock, Unlock, Trash2, Upload, Eye } from "lucide-react"

interface FileUploadProps {
  fileType: "presentation" | "handout" | "research"
  fileUrl?: string
  isLocked?: boolean
  onUpload: (file: File) => void
  onDelete: () => void
  onToggleLock?: () => void
  onPreview?: () => void
}

export function FileUpload({
  fileType,
  fileUrl,
  isLocked,
  onUpload,
  onDelete,
  onToggleLock,
  onPreview,
}: FileUploadProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  const getTitle = () => {
    switch (fileType) {
      case "presentation":
        return "Presentation"
      case "handout":
        return "Handout"
      case "research":
        return "Research Paper"
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onUpload(file)
      setShowUploadDialog(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{getTitle()}</h3>
        <div className="flex items-center gap-2">
          {fileUrl ? (
            <>
              {onToggleLock && (
                <Button variant="outline" size="sm" onClick={onToggleLock}>
                  {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onPreview}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          )}
        </div>
      </div>

      {fileUrl && <div className="text-sm text-muted-foreground truncate">{fileUrl.split("/").pop()}</div>}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload {getTitle()}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:cursor-pointer hover:file:bg-primary/90"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

