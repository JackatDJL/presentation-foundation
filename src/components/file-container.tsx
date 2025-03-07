/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
import { Button } from "~/components/ui/button";
import { UploadButton } from "./uploadthing";
import { api } from "~/trpc/react";
import { Loader, Trash2, Lock } from "react-feather";
import type { files, presentations } from "~/server/db/schema";

type FileType = "presentation" | "handout" | "research" | "logo" | "cover";

interface FileContainerProps {
  presentationId?: string;
  fileType: FileType;
  disabled?: boolean;
  onSuccess?: () => void;
}

export default function FileContainer({
  presentationId,
  fileType,
  disabled = false,
  onSuccess,
}: FileContainerProps) {
  if (!presentationId) {
    return <CreateFirst />;
  }
  // Fetch the presentation to get the fileId
  const {
    data: presentation,
    isLoading: loadingPresentation,
    refetch,
  } = api.presentations.getById.useQuery(presentationId, {
    enabled: !disabled && Boolean(presentationId),
  });

  // Get the fileId based on fileType
  const fileId = presentation && getFileIdByType(presentation, fileType);

  // Fetch file data if we have a fileId
  const { data: file, isLoading: loadingFile } = api.files.getById.useQuery(
    fileId ?? "",
    {
      enabled: Boolean(fileId),
    },
  );

  // Delete mutation
  const deleteMutation = api.files.deleteById.useMutation({
    onSuccess: () => {
      if (onSuccess) onSuccess();
      void refetch();
    },
  });

  // Handle file deletion
  const handleDelete = async () => {
    if (fileId) {
      deleteMutation.mutate(fileId);
    }
  };

  // Loading state
  if ((loadingPresentation || loadingFile) && !disabled) {
    return <LoadingFile />;
  }

  // If no file is uploaded yet or we're in disabled state
  if (!file || disabled) {
    return (
      <UploadComponent
        presentationId={presentationId}
        fileType={fileType}
        disabled={disabled}
        onSuccess={onSuccess}
        refetch={refetch}
      />
    );
  }

  // File is uploaded, show the file preview
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
        <h3 className="font-medium">{getTitle(fileType)}</h3>
        <div className="flex space-x-2">
          {fileType === "presentation" && (
            <Button size="sm" variant="outline">
              <Lock className="h-4 w-4 mr-1" />
              Unlocked
            </Button>
          )}
          <Button
            onClick={handleDelete}
            type="button"
            size="sm"
            variant="destructive"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="p-4">
        <FilePreview file={file} fileType={fileType} />
      </div>
    </div>
  );
}

// Helper component to display file preview
function FilePreview({
  file,
  fileType,
}: {
  file: typeof files.$inferSelect;
  fileType: FileType;
}) {
  const isImage = fileType === "logo" || fileType === "cover";

  if (isImage && file.ufsUrl) {
    return (
      <div className="flex items-center">
        <img
          src={file.ufsUrl || "/placeholder.svg"}
          alt={file.name}
          className="h-20 object-contain mr-3"
        />
        <div>
          <p className="font-medium">{file.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <FileIcon fileExtension={file.name.split(".").pop()} />
      <div className="ml-3">
        <p className="font-medium">{file.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
      </div>
    </div>
  );
}

// Upload component
function UploadComponent({
  presentationId,
  fileType,
  disabled = false,
  onSuccess,
  refetch,
}: {
  presentationId: string;
  fileType: FileType;
  disabled?: boolean;
  onSuccess?: () => void;
  refetch: () => void;
}) {
  if (disabled) {
    return <CreateFirst />;
  }

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center">
      <UploadPreConfigured
        fileType={fileType}
        presentationId={presentationId}
        onSuccess={onSuccess}
        refetch={refetch}
      />
    </div>
  );
}

function CreateFirst() {
  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center">
      <div className="text-muted-foreground mb-2">
        Create a presentation first
      </div>
    </div>
  );
}

// Pre-configured upload button
function UploadPreConfigured({
  fileType,
  presentationId,
  onSuccess,
  refetch,
}: {
  fileType: FileType;
  presentationId: string;
  onSuccess?: () => void;
  refetch: () => void;
}) {
  const endpoint:
    | "presentationUploader"
    | "documentUploader"
    | "imageUploader" =
    fileType === "presentation"
      ? "presentationUploader"
      : fileType === "handout" || fileType === "research"
        ? "documentUploader"
        : "imageUploader";
  let input:
    | { presentationId: string }
    | { fileType: "logo" | "cover"; presentationId: string }
    | { fileType: "handout" | "research"; presentationId: string };

  if (fileType === "presentation") {
    input = { presentationId };
  } else if (fileType === "handout" || fileType === "research") {
    input = { presentationId, fileType };
  } else {
    input = { presentationId, fileType };
  }

  return (
    <UploadButton
      endpoint={endpoint}
      input={input}
      onClientUploadComplete={() => {
        if (onSuccess) onSuccess();
        void refetch();
      }}
      config={{
        mode: "auto",
      }}
      content={{
        button({ ready, isUploading }) {
          if (!ready) return "Loading...";
          if (isUploading) return "Uploading...";
          return `Upload ${getTitle(fileType)}`;
        },
        allowedContent() {
          return getAllowedContentText(fileType);
        },
      }}
    />
  );
}

// Loading component
function LoadingFile() {
  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center">
      <Loader className="h-8 w-8 text-muted-foreground animate-spin" />
      <p className="mt-2 text-muted-foreground">Loading...</p>
    </div>
  );
}

// File icon component
function FileIcon({ fileExtension }: { fileExtension?: string }) {
  let className = "h-12 w-12 text-gray-500";

  switch (fileExtension) {
    case "pdf":
      className = "h-12 w-12 text-red-500";
      break;
    case "doc":
    case "docx":
      className = "h-12 w-12 text-blue-500";
      break;
    case "ppt":
    case "pptx":
    case "key":
      className = "h-12 w-12 text-orange-500";
      break;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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
  );
}

// Helper functions
function getFileIdByType(
  presentation: typeof presentations.$inferSelect,
  fileType: FileType,
): string | undefined {
  switch (fileType) {
    case "logo":
      return presentation.logo ?? undefined;
    case "cover":
      return presentation.cover ?? undefined;
    case "presentation":
      return presentation.presentation ?? undefined;
    case "handout":
      return presentation.handout ?? undefined;
    case "research":
      return presentation.research ?? undefined;
    default:
      return undefined;
  }
}

function getTitle(fileType: FileType): string {
  switch (fileType) {
    case "presentation":
      return "Presentation";
    case "handout":
      return "Handout";
    case "research":
      return "Research Paper";
    case "logo":
      return "Logo";
    case "cover":
      return "Cover";
    default:
      return "File";
  }
}

function getAllowedContentText(fileType: FileType): string {
  switch (fileType) {
    case "presentation":
      return "Only presentations in .key, .pptx or .pdf format";
    case "handout":
    case "research":
      return "Only documents in .docx or .pdf format";
    case "logo":
    case "cover":
      return "Only images in .png or .jpeg format";
    default:
      return "Upload your file";
  }
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "Unknown size";

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
