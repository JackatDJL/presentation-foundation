/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
import { Button } from "~/components/ui/button";
import { UploadButton } from "./uploadthing";
import { api } from "~/trpc/react";
import { Loader, Trash2, Lock, Unlock } from "react-feather";
import type { files, presentations } from "~/server/db/schema";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";
import { useState, useEffect } from "react";

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
  // Add state for the alert dialogs and password inputs
  const [isLockDialogOpen, setIsLockDialogOpen] = useState(false);
  const [isUnlockDialogOpen, setIsUnlockDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [password, setPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // Fetch the presentation to get the fileId - at the top level
  const {
    data: presentation,
    isPending: loadingPresentation,
    refetch: refetchPresentation,
  } = api.presentations.getById.useQuery(presentationId ?? "", {
    enabled: !disabled && Boolean(presentationId),
  });

  // Get the fileId based on fileType
  const fileId = presentation && getFileIdByType(presentation, fileType);

  // Fetch file data if we have a fileId
  const {
    data: file,
    isPending: loadingFile,
    refetch: refetchFile,
  } = api.files.getById.useQuery(fileId ?? "", {
    enabled: Boolean(fileId),
  });

  // Delete mutation
  const deleteMutation = api.files.deleteById.useMutation({
    onSuccess: () => {
      if (onSuccess) onSuccess();
      void refetchPresentation();
    },
  });

  // Handle file deletion
  const handleDelete = async () => {
    if (fileId) {
      deleteMutation.mutate(fileId);
    }
  };

  const lockMutation = api.files.editLock.useMutation({
    onSuccess: (data) => {
      setIsValidating(false);

      if (data.success) {
        void refetchPresentation();
        void refetchFile();
        if (onSuccess) onSuccess();

        if (data.code.startsWith("sc.200")) {
          // Close dialogs only on success
          setIsLockDialogOpen(false);
          setIsUnlockDialogOpen(false);
          setIsChangePasswordDialogOpen(false);

          // Reset form fields
          setPassword("");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setErrorMessage("");
        }
      } else {
        // Show error message but keep dialog open
        setErrorMessage(data.message);
      }
    },
    onError: (_error) => {
      setIsValidating(false);
      setErrorMessage("An unexpected error occurred. Please try again.");
    },
  });

  // Add the lock/unlock handlers
  const handleLock = () => {
    setIsValidating(true);

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setIsValidating(false);
      return;
    }

    if (fileId) {
      lockMutation.mutate({
        fileId,
        procedure: "lock",
        newPassword: password,
      });
    }
  };

  const handleUnlock = () => {
    setIsValidating(true);

    if (!password) {
      setErrorMessage("Password is required");
      setIsValidating(false);
      return;
    }

    if (fileId) {
      lockMutation.mutate({
        fileId,
        procedure: "unlock",
        oldPassword: password,
      });
    }
  };

  const handleChangePassword = () => {
    setIsValidating(true);

    if (!oldPassword) {
      setErrorMessage("Current password is required");
      setIsValidating(false);
      return;
    }

    if (!newPassword) {
      setErrorMessage("New password is required");
      setIsValidating(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match");
      setIsValidating(false);
      return;
    }

    if (fileId) {
      lockMutation.mutate({
        fileId,
        procedure: "changePassword",
        oldPassword,
        newPassword,
      });
    }
  };

  // Handle cancel button clicks
  const handleCancel = (dialogType: "lock" | "unlock" | "changePassword") => {
    if (lockMutation.isPending || isValidating) {
      return;
    }

    switch (dialogType) {
      case "lock":
        setIsLockDialogOpen(false);
        setPassword("");
        setConfirmPassword("");
        break;
      case "unlock":
        setIsUnlockDialogOpen(false);
        setPassword("");
        break;
      case "changePassword":
        setIsChangePasswordDialogOpen(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        break;
    }
    setErrorMessage("");
  };

  // Reset error message when dialogs close
  useEffect(() => {
    if (
      !isLockDialogOpen &&
      !isUnlockDialogOpen &&
      !isChangePasswordDialogOpen
    ) {
      setErrorMessage("");
      setIsValidating(false);
    }
  }, [isLockDialogOpen, isUnlockDialogOpen, isChangePasswordDialogOpen]);

  // Function to handle dialog close attempts
  const handleDialogOpenChange = (
    open: boolean,
    dialogType: "lock" | "unlock" | "changePassword",
  ) => {
    // Prevent closing if operation is in progress
    if (!open && (lockMutation.isPending || isValidating)) {
      return;
    }

    // Otherwise, update the dialog state
    switch (dialogType) {
      case "lock":
        setIsLockDialogOpen(open);
        if (!open) {
          setPassword("");
          setConfirmPassword("");
          setErrorMessage("");
        }
        break;
      case "unlock":
        setIsUnlockDialogOpen(open);
        if (!open) {
          setPassword("");
          setErrorMessage("");
        }
        break;
      case "changePassword":
        setIsChangePasswordDialogOpen(open);
        if (!open) {
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setErrorMessage("");
        }
        break;
    }
  };

  if (!presentationId) {
    return <CreateFirst />;
  }

  // Loading state
  if (file && (loadingPresentation || loadingFile) && !disabled) {
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
        refetchPresentation={refetchPresentation}
      />
    );
  }

  // File is uploaded, show the file preview
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-secondary border-b border-border flex justify-between items-center">
        <h3 className="font-medium">{getTitle(fileType)}</h3>
        <div className="flex space-x-2">
          {fileType === "presentation" && (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (file?.isLocked) {
                    handleDialogOpenChange(true, "unlock");
                  } else {
                    handleDialogOpenChange(true, "lock");
                  }
                }}
              >
                {file?.isLocked ? (
                  <>
                    <Lock className="h-4 w-4 mr-1 " />
                    Locked
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-1" />
                    Unlocked
                  </>
                )}
              </Button>
              {file?.isLocked && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleDialogOpenChange(true, "changePassword")}
                >
                  Change Password
                </Button>
              )}
            </>
          )}
          <Button
            onClick={handleDelete}
            type="button"
            size="sm"
            variant="destructive"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader className="h-4 w-4 animate-spin text-foreground" />
            ) : (
              <Trash2 className="h-4 w-4 text-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="p-4">
        <FilePreview file={file} fileType={fileType} />
      </div>
      {/* Lock Dialog */}
      <AlertDialog
        open={isLockDialogOpen}
        onOpenChange={(open) => handleDialogOpenChange(open, "lock")}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Lock Presentation</AlertDialogTitle>
            <AlertDialogDescription>
              Set a password to lock your presentation. You&apos;ll need this
              password to access it later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={lockMutation.isPending || isValidating}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                disabled={lockMutation.isPending || isValidating}
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleCancel("lock")}
              disabled={lockMutation.isPending || isValidating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleLock}
              disabled={
                !password ||
                !confirmPassword ||
                lockMutation.isPending ||
                isValidating
              }
            >
              {lockMutation.isPending || isValidating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Locking...
                </>
              ) : (
                "Lock"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unlock Dialog */}
      <AlertDialog
        open={isUnlockDialogOpen}
        onOpenChange={(open) => handleDialogOpenChange(open, "unlock")}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unlock Presentation</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your password to unlock the presentation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="unlockPassword" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="unlockPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={lockMutation.isPending || isValidating}
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleCancel("unlock")}
              disabled={lockMutation.isPending || isValidating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUnlock}
              disabled={!password || lockMutation.isPending || isValidating}
            >
              {lockMutation.isPending || isValidating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Unlocking...
                </>
              ) : (
                "Unlock"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Dialog */}
      <AlertDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={(open) => handleDialogOpenChange(open, "changePassword")}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Password</AlertDialogTitle>
            <AlertDialogDescription>
              Update the password for your locked presentation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="oldPassword" className="text-sm font-medium">
                Current Password
              </label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                disabled={lockMutation.isPending || isValidating}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                disabled={lockMutation.isPending || isValidating}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="confirmNewPassword"
                className="text-sm font-medium"
              >
                Confirm New Password
              </label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                disabled={lockMutation.isPending || isValidating}
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleCancel("changePassword")}
              disabled={lockMutation.isPending || isValidating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleChangePassword}
              disabled={
                !oldPassword ||
                !newPassword ||
                !confirmPassword ||
                lockMutation.isPending ||
                isValidating
              }
            >
              {lockMutation.isPending || isValidating ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  refetchPresentation,
}: {
  presentationId: string;
  fileType: FileType;
  disabled?: boolean;
  onSuccess?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchPresentation: () => Promise<any>;
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
        refetchPresentation={refetchPresentation}
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
  refetchPresentation,
}: {
  fileType: FileType;
  presentationId: string;
  onSuccess?: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  refetchPresentation: () => Promise<any>;
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
        void refetchPresentation();
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
